import {quotePlan} from './catalog';
import type {BillingStore} from './store';
import type {
  BillingOrder,
  BillingProvider,
  ClaimResult,
  EntitlementKind,
  PlanId,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isBillingEmail(raw: string): boolean {
  return EMAIL.test(raw.trim());
}

export function startOrder(
  store: BillingStore,
  input: {
    provider: BillingProvider;
    planId: PlanId;
    email: string;
    now: number;
    ids: {orderId: string; claimToken: string};
  },
): {ok: true; order: BillingOrder} | {ok: false; error: string} {
  const email = input.email.trim().toLowerCase();
  if (!isBillingEmail(email)) {
    return {ok: false, error: 'Enter a real email so we can attach the receipt.'};
  }

  const quote = quotePlan(input.planId, input.provider);
  const order = {
    id: input.ids.orderId,
    provider: input.provider,
    planId: input.planId,
    email,
    amountMinor: quote.amountMinor,
    currency: quote.currency,
    status: 'created' as const,
    claimToken: input.ids.claimToken,
    createdAt: input.now,
    periodDays: quote.periodDays,
    creditMinutes: quote.creditMinutes,
  };
  store.put(order);
  return {ok: true, order};
}

function kindFor(planId: PlanId): EntitlementKind {
  switch (planId) {
    case 'monthly_hosted':
      return 'hosted_month';
    case 'credit_pack':
      return 'credits';
    default: {
      const exhaustive: never = planId;
      return exhaustive;
    }
  }
}

export function applyPaypalCapture(
  store: BillingStore,
  input: {
    merchantOrderId: string;
    event: 'PAYMENT.CAPTURE.COMPLETED' | 'PAYMENT.CAPTURE.DENIED' | 'PAYMENT.CAPTURE.PENDING';
    providerRef: string;
    now: number;
  },
): {ok: true} | {ok: false; error: string} {
  const order = store.get(input.merchantOrderId);
  if (!order || order.provider !== 'paypal') {
    return {ok: false, error: 'Unknown PayPal order.'};
  }

  switch (input.event) {
    case 'PAYMENT.CAPTURE.PENDING':
      store.put({...order, status: 'pending', providerRef: input.providerRef});
      return {ok: true};
    case 'PAYMENT.CAPTURE.DENIED':
      store.put({...order, status: 'denied', providerRef: input.providerRef});
      return {ok: true};
    case 'PAYMENT.CAPTURE.COMPLETED':
      store.put({
        ...order,
        status: 'paid',
        providerRef: input.providerRef,
        paidAt: input.now,
      });
      return {ok: true};
    default: {
      const exhaustive: never = input.event;
      return exhaustive;
    }
  }
}

export function applyPhonepeCompleted(
  store: BillingStore,
  input: {
    merchantOrderId: string;
    type: 'CHECKOUT_ORDER_COMPLETED' | 'CHECKOUT_ORDER_FAILED';
    providerRef: string;
    now: number;
  },
): {ok: true} | {ok: false; error: string} {
  const order = store.get(input.merchantOrderId);
  if (!order || order.provider !== 'phonepe') {
    return {ok: false, error: 'Unknown PhonePe order.'};
  }

  switch (input.type) {
    case 'CHECKOUT_ORDER_FAILED':
      store.put({...order, status: 'failed', providerRef: input.providerRef});
      return {ok: true};
    case 'CHECKOUT_ORDER_COMPLETED':
      store.put({
        ...order,
        status: 'paid',
        providerRef: input.providerRef,
        paidAt: input.now,
      });
      return {ok: true};
    default: {
      const exhaustive: never = input.type;
      return exhaustive;
    }
  }
}

export function claimOrder(store: BillingStore, claimToken: string, now: number): ClaimResult {
  const order = store.getByClaim(claimToken);
  if (!order || order.status !== 'paid' || order.paidAt === undefined) {
    return {entitled: false};
  }
  const expiresAt = order.paidAt + order.periodDays * DAY_MS;
  if (now > expiresAt) {
    return {entitled: false};
  }
  return {
    entitled: true,
    kind: kindFor(order.planId),
    expiresAt,
    creditMinutes: order.creditMinutes,
    email: order.email,
    planId: order.planId,
  };
}

export function canMintWithEntitlement(input: {
  enforce: boolean;
  entitlement: ClaimResult;
  now: number;
}): boolean {
  if (!input.enforce) {
    return true;
  }
  if (!input.entitlement.entitled) {
    return false;
  }
  return input.now <= input.entitlement.expiresAt;
}
