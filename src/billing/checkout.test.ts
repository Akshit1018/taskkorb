import {describe, expect, it} from 'vitest';
import {beginCheckout, completeMockPay, mockCheckoutPath} from './checkout';
import {claimOrder} from './orders';
import {MemoryBillingStore} from './store';

describe('billing checkout', () => {
  it('starts a mock PayPal checkout and pays on mock-complete', async () => {
    const store = new MemoryBillingStore();
    const started = await beginCheckout(store, {
      provider: 'paypal',
      planId: 'monthly_hosted',
      email: 'owner@example.com',
      now: 1_000,
      origin: 'http://localhost:3000',
      mode: 'mock',
    });
    expect(started.ok).toBe(true);
    if (!started.ok) {
      return;
    }
    expect(started.checkoutUrl).toBe(
      mockCheckoutPath(started.order.claimToken, 'paypal'),
    );
    expect(completeMockPay(store, {claimToken: started.order.claimToken, now: 2_000})).toEqual({
      ok: true,
      provider: 'paypal',
    });
    expect(claimOrder(store, started.order.claimToken, 3_000).entitled).toBe(true);
  });

  it('rejects an unknown rail', async () => {
    const started = await beginCheckout(new MemoryBillingStore(), {
      provider: 'stripe',
      planId: 'monthly_hosted',
      email: 'owner@example.com',
      now: 1,
      origin: 'http://localhost:3000',
      mode: 'mock',
    });
    expect(started.ok).toBe(false);
  });
});
