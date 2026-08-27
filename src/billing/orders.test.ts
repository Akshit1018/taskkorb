import {describe, expect, it} from 'vitest';
import {MemoryBillingStore} from './store';
import {
  applyPaypalCapture,
  applyPhonepeCompleted,
  canMintWithEntitlement,
  claimOrder,
  startOrder,
} from './orders';

const NOW = Date.parse('2026-08-27T12:00:00.000Z');

describe('billing orders', () => {
  it('starts a PayPal monthly order with a claim token and no entitlement yet', () => {
    const store = new MemoryBillingStore();
    const started = startOrder(store, {
      provider: 'paypal',
      planId: 'monthly_hosted',
      email: 'owner@example.com',
      now: NOW,
      ids: {orderId: 'ord_1', claimToken: 'clm_1'},
    });

    expect(started.ok).toBe(true);
    if (!started.ok) {
      return;
    }
    expect(started.order.status).toBe('created');
    expect(started.order.currency).toBe('USD');
    expect(started.order.amountMinor).toBe(499);
    expect(claimOrder(store, 'clm_1', NOW).entitled).toBe(false);
  });

  it('rejects a bad email and unknown provider exhaustively', () => {
    const store = new MemoryBillingStore();
    expect(
      startOrder(store, {
        provider: 'paypal',
        planId: 'monthly_hosted',
        email: 'not-an-email',
        now: NOW,
        ids: {orderId: 'ord_bad', claimToken: 'clm_bad'},
      }).ok,
    ).toBe(false);
  });

  it('unlocks hosted mint only after a verified PayPal capture webhook', () => {
    const store = new MemoryBillingStore();
    startOrder(store, {
      provider: 'paypal',
      planId: 'monthly_hosted',
      email: 'owner@example.com',
      now: NOW,
      ids: {orderId: 'ord_pp', claimToken: 'clm_pp'},
    });

    const applied = applyPaypalCapture(store, {
      merchantOrderId: 'ord_pp',
      event: 'PAYMENT.CAPTURE.COMPLETED',
      providerRef: 'CAP-1',
      now: NOW + 1000,
    });
    expect(applied.ok).toBe(true);

    const claimed = claimOrder(store, 'clm_pp', NOW + 2000);
    expect(claimed.entitled).toBe(true);
    expect(claimed.kind).toBe('hosted_month');
    expect(claimed.expiresAt).toBe(NOW + 1000 + 30 * 24 * 60 * 60 * 1000);
    expect(canMintWithEntitlement({enforce: true, entitlement: claimed, now: NOW + 2000})).toBe(
      true,
    );
  });

  it('does not unlock on a denied PayPal capture', () => {
    const store = new MemoryBillingStore();
    startOrder(store, {
      provider: 'paypal',
      planId: 'monthly_hosted',
      email: 'owner@example.com',
      now: NOW,
      ids: {orderId: 'ord_deny', claimToken: 'clm_deny'},
    });
    applyPaypalCapture(store, {
      merchantOrderId: 'ord_deny',
      event: 'PAYMENT.CAPTURE.DENIED',
      providerRef: 'CAP-X',
      now: NOW + 1000,
    });
    expect(claimOrder(store, 'clm_deny', NOW + 2000).entitled).toBe(false);
  });

  it('unlocks after PhonePe CHECKOUT_ORDER_COMPLETED', () => {
    const store = new MemoryBillingStore();
    startOrder(store, {
      provider: 'phonepe',
      planId: 'credit_pack',
      email: 'owner@example.com',
      now: NOW,
      ids: {orderId: 'ord_pe', claimToken: 'clm_pe'},
    });
    const applied = applyPhonepeCompleted(store, {
      merchantOrderId: 'ord_pe',
      type: 'CHECKOUT_ORDER_COMPLETED',
      providerRef: 'OMO123',
      now: NOW + 500,
    });
    expect(applied.ok).toBe(true);
    const claimed = claimOrder(store, 'clm_pe', NOW + 600);
    expect(claimed.entitled).toBe(true);
    expect(claimed.kind).toBe('credits');
    expect(claimed.creditMinutes).toBe(60);
  });

  it('keeps hosted mint open when billing is not enforced', () => {
    expect(
      canMintWithEntitlement({
        enforce: false,
        entitlement: {entitled: false},
        now: NOW,
      }),
    ).toBe(true);
  });

  it('blocks hosted mint when enforced and the claim is unpaid or expired', () => {
    expect(
      canMintWithEntitlement({
        enforce: true,
        entitlement: {entitled: false},
        now: NOW,
      }),
    ).toBe(false);
    expect(
      canMintWithEntitlement({
        enforce: true,
        entitlement: {
          entitled: true,
          kind: 'hosted_month',
          expiresAt: NOW - 1,
          creditMinutes: 0,
        },
        now: NOW,
      }),
    ).toBe(false);
  });
});
