import {describe, expect, it} from 'vitest';
import {
  BILLING_CLAIM_STORAGE,
  readBillingClaim,
  requestCheckout,
  requestClaim,
  writeBillingClaim,
} from './client';

describe('billing client', () => {
  it('stores the claim token without treating it as a Gemini key', () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };
    writeBillingClaim(storage, 'clm_1');
    expect(readBillingClaim(storage)).toBe('clm_1');
    expect(BILLING_CLAIM_STORAGE).toBe('taskkorb.billing.claim');
  });

  it('reads checkout and claim JSON from the billing API', async () => {
    const checkout = await requestCheckout(
      {provider: 'phonepe', planId: 'credit_pack', email: 'a@b.co'},
      async () =>
        new Response(
          JSON.stringify({checkoutUrl: '/api/billing/mock-complete?claim=clm_x', claimToken: 'clm_x'}),
          {status: 200, headers: {'Content-Type': 'application/json'}},
        ),
    );
    expect(checkout).toEqual({
      ok: true,
      checkoutUrl: '/api/billing/mock-complete?claim=clm_x',
      claimToken: 'clm_x',
    });

    const claimed = await requestClaim('clm_x', async () =>
      new Response(
        JSON.stringify({
          entitled: true,
          kind: 'credits',
          expiresAt: 9,
          creditMinutes: 60,
          email: 'a@b.co',
          planId: 'credit_pack',
        }),
        {status: 200, headers: {'Content-Type': 'application/json'}},
      ),
    );
    expect(claimed.entitled).toBe(true);
  });
});
