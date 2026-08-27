export type BillingMode = 'mock' | 'live';

export function verifyPaypalTransmission(input: {
  mode: BillingMode;
  headers: Record<string, string | undefined>;
  rawBody: string;
  expectedSig?: string;
}): {ok: true} | {ok: false; error: string} {
  if (input.mode === 'mock') {
    return {ok: true};
  }

  const transmissionId = header(input.headers, 'paypal-transmission-id');
  const sig = header(input.headers, 'paypal-transmission-sig');
  if (!transmissionId || !sig) {
    return {ok: false, error: 'Missing PayPal transmission headers.'};
  }
  if (!input.expectedSig || sig !== input.expectedSig) {
    return {ok: false, error: 'PayPal signature did not match.'};
  }
  return {ok: true};
}

export function readPaypalCaptureEvent(body: unknown): {
  event: 'PAYMENT.CAPTURE.COMPLETED' | 'PAYMENT.CAPTURE.DENIED' | 'PAYMENT.CAPTURE.PENDING';
  merchantOrderId: string;
  providerRef: string;
} | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const root = body as Record<string, unknown>;
  const event = root.event_type;
  if (
    event !== 'PAYMENT.CAPTURE.COMPLETED' &&
    event !== 'PAYMENT.CAPTURE.DENIED' &&
    event !== 'PAYMENT.CAPTURE.PENDING'
  ) {
    return null;
  }
  const resource =
    root.resource && typeof root.resource === 'object'
      ? (root.resource as Record<string, unknown>)
      : {};
  const invoice = typeof resource.invoice_id === 'string' ? resource.invoice_id : '';
  const related =
    resource.supplementary_data && typeof resource.supplementary_data === 'object'
      ? (resource.supplementary_data as Record<string, unknown>)
      : {};
  const relatedIds =
    related.related_ids && typeof related.related_ids === 'object'
      ? (related.related_ids as Record<string, unknown>)
      : {};
  const orderId = typeof relatedIds.order_id === 'string' ? relatedIds.order_id : '';
  const merchantOrderId = invoice || orderId;
  const providerRef = typeof resource.id === 'string' ? resource.id : merchantOrderId;
  if (!merchantOrderId) {
    return null;
  }
  return {event, merchantOrderId, providerRef};
}

export async function createPaypalCheckout(input: {
  clientId: string;
  clientSecret: string;
  env: 'sandbox' | 'live';
  orderId: string;
  amountMinor: number;
  currency: 'USD' | 'INR';
  returnUrl: string;
  cancelUrl: string;
  fetcher?: typeof fetch;
}): Promise<{ok: true; checkoutUrl: string; providerRef: string} | {ok: false; error: string}> {
  const fetcher = input.fetcher ?? fetch;
  const api =
    input.env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const basic = Buffer.from(`${input.clientId}:${input.clientSecret}`).toString('base64');
  const tokenRes = await fetcher(`${api}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const tokenBody = (await tokenRes.json()) as {access_token?: string};
  if (!tokenRes.ok || !tokenBody.access_token) {
    return {ok: false, error: 'PayPal login failed. Check the merchant credentials.'};
  }

  const value = (input.amountMinor / 100).toFixed(2);
  const orderRes = await fetcher(`${api}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenBody.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          invoice_id: input.orderId,
          custom_id: input.orderId,
          amount: {currency_code: input.currency, value},
        },
      ],
      application_context: {
        brand_name: 'Taskkorb',
        user_action: 'PAY_NOW',
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });
  const orderBody = (await orderRes.json()) as {
    id?: string;
    links?: Array<{rel?: string; href?: string}>;
  };
  const checkoutUrl = orderBody.links?.find((link) => link.rel === 'approve')?.href;
  if (!orderRes.ok || !checkoutUrl || !orderBody.id) {
    return {ok: false, error: 'PayPal could not start checkout.'};
  }
  return {ok: true, checkoutUrl, providerRef: orderBody.id};
}

function header(
  headers: Record<string, string | undefined>,
  name: string,
): string {
  const direct = headers[name] ?? headers[name.toLowerCase()];
  return typeof direct === 'string' ? direct : '';
}
