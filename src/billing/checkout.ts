import {isPlanId, isProvider} from './catalog';
import {startOrder} from './orders';
import {createPaypalCheckout} from './paypal';
import {createPhonepeCheckout} from './phonepe';
import type {BillingStore} from './store';
import type {BillingOrder, BillingProvider, PlanId} from './types';

export function newBillingIds(random = () => crypto.randomUUID()): {
  orderId: string;
  claimToken: string;
} {
  const raw = random().replace(/-/g, '');
  return {
    orderId: `ord_${raw.slice(0, 24)}`,
    claimToken: `clm_${raw.slice(0, 24)}`,
  };
}

export function mockCheckoutPath(claimToken: string, provider: BillingProvider): string {
  return `/api/billing/mock-complete?claim=${encodeURIComponent(claimToken)}&provider=${provider}`;
}

export async function beginCheckout(
  store: BillingStore,
  input: {
    provider: string;
    planId: string;
    email: string;
    now: number;
    origin: string;
    mode: 'mock' | 'live';
    paypal?: {
      clientId: string;
      clientSecret: string;
      env: 'sandbox' | 'live';
    };
    phonepe?: {
      clientId: string;
      clientSecret: string;
      clientVersion: string;
      env: 'sandbox' | 'live';
    };
    fetcher?: typeof fetch;
  },
): Promise<
  | {ok: true; order: BillingOrder; checkoutUrl: string}
  | {ok: false; error: string}
> {
  if (!isProvider(input.provider) || !isPlanId(input.planId)) {
    return {ok: false, error: 'Choose PayPal or PhonePe and a plan.'};
  }

  const started = startOrder(store, {
    provider: input.provider,
    planId: input.planId,
    email: input.email,
    now: input.now,
    ids: newBillingIds(),
  });
  if (started.ok === false) {
    return started;
  }

  if (input.mode === 'mock') {
    return {
      ok: true,
      order: started.order,
      checkoutUrl: mockCheckoutPath(started.order.claimToken, input.provider),
    };
  }

  const returnUrl = `${input.origin}/?billing=ok`;
  if (input.provider === 'paypal') {
    if (!input.paypal?.clientId || !input.paypal.clientSecret) {
      return {ok: false, error: 'PayPal is not configured on this server.'};
    }
    const created = await createPaypalCheckout({
      ...input.paypal,
      orderId: started.order.id,
      amountMinor: started.order.amountMinor,
      currency: started.order.currency,
      returnUrl,
      cancelUrl: `${input.origin}/?billing=cancel`,
      fetcher: input.fetcher,
    });
    if (created.ok === false) {
      return created;
    }
    store.put({...started.order, status: 'pending', providerRef: created.providerRef});
    return {ok: true, order: started.order, checkoutUrl: created.checkoutUrl};
  }

  if (!input.phonepe?.clientId || !input.phonepe.clientSecret) {
    return {ok: false, error: 'PhonePe is not configured on this server.'};
  }
  const created = await createPhonepeCheckout({
    ...input.phonepe,
    orderId: started.order.id,
    amountPaisa: started.order.amountMinor,
    redirectUrl: returnUrl,
    fetcher: input.fetcher,
  });
  if (created.ok === false) {
    return created;
  }
  store.put({...started.order, status: 'pending', providerRef: created.providerRef});
  return {ok: true, order: started.order, checkoutUrl: created.checkoutUrl};
}

export function completeMockPay(
  store: BillingStore,
  input: {claimToken: string; now: number},
): {ok: true; provider: BillingProvider} | {ok: false; error: string} {
  const order = store.getByClaim(input.claimToken);
  if (!order) {
    return {ok: false, error: 'Unknown checkout.'};
  }
  store.put({
    ...order,
    status: 'paid',
    paidAt: input.now,
    providerRef: order.providerRef ?? `mock_${order.id}`,
  });
  return {ok: true, provider: order.provider};
}
