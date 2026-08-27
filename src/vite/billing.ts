import type {IncomingMessage, ServerResponse} from 'node:http';
import type {Plugin} from 'vite';
import {listPlans} from '../billing/catalog';
import {beginCheckout, completeMockPay} from '../billing/checkout';
import {readHeader, parseUrl, readJsonBody, requestOrigin} from '../billing/http';
import {
  applyPaypalCapture,
  applyPhonepeCompleted,
  claimOrder,
} from '../billing/orders';
import {readPaypalCaptureEvent, verifyPaypalTransmission} from '../billing/paypal';
import {readPhonepeCallback, verifyPhonepeCallback} from '../billing/phonepe';
import {MemoryBillingStore} from '../billing/store';

export const billingStore = new MemoryBillingStore();

export function billingConfig(env: NodeJS.ProcessEnv = process.env): {
  mode: 'mock' | 'live';
  enforce: boolean;
  paypalReady: boolean;
  phonepeReady: boolean;
  paypal: {clientId: string; clientSecret: string; env: 'sandbox' | 'live'; webhookSig: string};
  phonepe: {
    clientId: string;
    clientSecret: string;
    clientVersion: string;
    env: 'sandbox' | 'live';
    webhookUser: string;
    webhookPass: string;
  };
} {
  const mode = env.BILLING_MODE === 'live' ? 'live' : 'mock';
  const paypalClient = env.PAYPAL_CLIENT_ID?.trim() ?? '';
  const paypalSecret = env.PAYPAL_CLIENT_SECRET?.trim() ?? '';
  const phonepeClient = env.PHONEPE_CLIENT_ID?.trim() ?? '';
  const phonepeSecret = env.PHONEPE_CLIENT_SECRET?.trim() ?? '';
  return {
    mode,
    enforce: env.BILLING_ENFORCE === '1',
    paypalReady: Boolean(paypalClient && paypalSecret),
    phonepeReady: Boolean(phonepeClient && phonepeSecret),
    paypal: {
      clientId: paypalClient,
      clientSecret: paypalSecret,
      env: env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox',
      webhookSig: env.PAYPAL_WEBHOOK_SIG?.trim() ?? '',
    },
    phonepe: {
      clientId: phonepeClient,
      clientSecret: phonepeSecret,
      clientVersion: env.PHONEPE_CLIENT_VERSION?.trim() || '1',
      env: env.PHONEPE_ENV === 'live' ? 'live' : 'sandbox',
      webhookUser: env.PHONEPE_WEBHOOK_USER?.trim() ?? '',
      webhookPass: env.PHONEPE_WEBHOOK_PASS?.trim() ?? '',
    },
  };
}

function writeJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function routeBilling(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = req.url ?? '/';
  if (!url.startsWith('/api/billing')) {
    next();
    return;
  }

  const parsed = parseUrl(url);
  const config = billingConfig();

  if (req.method === 'GET' && parsed.pathname === '/api/billing/catalog') {
    writeJson(res, 200, {
      plans: listPlans(),
      mode: config.mode,
      rails: {paypal: config.mode === 'mock' || config.paypalReady, phonepe: config.mode === 'mock' || config.phonepeReady},
    });
    return;
  }

  if (req.method === 'GET' && parsed.pathname === '/api/billing/me') {
    const claim = parsed.searchParams.get('claim') ?? '';
    writeJson(res, 200, claimOrder(billingStore, claim, Date.now()));
    return;
  }

  if (req.method === 'GET' && parsed.pathname === '/api/billing/mock-complete') {
    if (config.mode !== 'mock') {
      writeJson(res, 404, {error: 'Mock checkout is off.'});
      return;
    }
    const claim = parsed.searchParams.get('claim') ?? '';
    const done = completeMockPay(billingStore, {claimToken: claim, now: Date.now()});
    if (done.ok === false) {
      writeJson(res, 404, {error: done.error});
      return;
    }
    res.statusCode = 302;
    res.setHeader('Location', '/?billing=ok');
    res.end();
    return;
  }

  if (req.method === 'POST' && parsed.pathname === '/api/billing/checkout') {
    try {
      const raw = await readJsonBody(req);
      const body = JSON.parse(raw || '{}') as {provider?: string; planId?: string; email?: string};
      const started = await beginCheckout(billingStore, {
        provider: body.provider ?? '',
        planId: body.planId ?? 'monthly_hosted',
        email: body.email ?? '',
        now: Date.now(),
        origin: requestOrigin(req),
        mode: config.mode,
        paypal: config.paypal,
        phonepe: config.phonepe,
      });
      if (started.ok === false) {
        writeJson(res, 400, {error: started.error});
        return;
      }
      writeJson(res, 200, {
        checkoutUrl: started.checkoutUrl,
        claimToken: started.order.claimToken,
        orderId: started.order.id,
      });
    } catch {
      writeJson(res, 400, {error: 'Could not start checkout.'});
    }
    return;
  }

  if (req.method === 'POST' && parsed.pathname === '/api/billing/paypal/webhook') {
    try {
      const raw = await readJsonBody(req);
      const verified = verifyPaypalTransmission({
        mode: config.mode,
        headers: {
          'paypal-transmission-id': readHeader(req, 'paypal-transmission-id'),
          'paypal-transmission-sig': readHeader(req, 'paypal-transmission-sig'),
        },
        rawBody: raw,
        expectedSig: config.paypal.webhookSig,
      });
      if (verified.ok === false) {
        writeJson(res, 401, {error: verified.error});
        return;
      }
      const event = readPaypalCaptureEvent(JSON.parse(raw || '{}'));
      if (!event) {
        writeJson(res, 200, {ok: true, ignored: true});
        return;
      }
      const applied = applyPaypalCapture(billingStore, {
        merchantOrderId: event.merchantOrderId,
        event: event.event,
        providerRef: event.providerRef,
        now: Date.now(),
      });
      if (applied.ok === false) {
        writeJson(res, 404, {error: applied.error});
        return;
      }
      writeJson(res, 200, {ok: true});
    } catch {
      writeJson(res, 400, {error: 'Bad PayPal webhook.'});
    }
    return;
  }

  if (req.method === 'POST' && parsed.pathname === '/api/billing/phonepe/webhook') {
    try {
      const raw = await readJsonBody(req);
      const verified = verifyPhonepeCallback({
        mode: config.mode,
        authorization: readHeader(req, 'authorization'),
        rawBody: raw,
        username: config.phonepe.webhookUser,
        password: config.phonepe.webhookPass,
      });
      if (verified.ok === false) {
        writeJson(res, 401, {error: verified.error});
        return;
      }
      const event = readPhonepeCallback(JSON.parse(raw || '{}'));
      if (!event) {
        writeJson(res, 200, {ok: true, ignored: true});
        return;
      }
      const applied = applyPhonepeCompleted(billingStore, {
        merchantOrderId: event.merchantOrderId,
        type: event.type,
        providerRef: event.providerRef,
        now: Date.now(),
      });
      if (applied.ok === false) {
        writeJson(res, 404, {error: applied.error});
        return;
      }
      writeJson(res, 200, {ok: true});
    } catch {
      writeJson(res, 400, {error: 'Bad PhonePe webhook.'});
    }
    return;
  }

  writeJson(res, 404, {error: 'Unknown billing route.'});
}

export function billingPlugin(): Plugin {
  return {
    name: 'taskkorb-billing',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void routeBilling(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void routeBilling(req, res, next);
      });
    },
  };
}
