import type {BillingProvider, ClaimResult, PlanId} from './types';

export const BILLING_CLAIM_STORAGE = 'taskkorb.billing.claim';

export function readBillingClaim(storage: Pick<Storage, 'getItem'> | null): string {
  if (!storage) {
    return '';
  }
  return storage.getItem(BILLING_CLAIM_STORAGE) ?? '';
}

export function writeBillingClaim(storage: Pick<Storage, 'setItem'> | null, claim: string): void {
  storage?.setItem(BILLING_CLAIM_STORAGE, claim);
}

export async function requestCheckout(
  input: {provider: BillingProvider; planId: PlanId; email: string},
  fetcher: typeof fetch = fetch,
): Promise<{ok: true; checkoutUrl: string; claimToken: string} | {ok: false; error: string}> {
  const response = await fetcher('/api/billing/checkout', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify(input),
  });
  const body = (await response.json()) as {
    checkoutUrl?: string;
    claimToken?: string;
    error?: string;
  };
  if (!response.ok || !body.checkoutUrl || !body.claimToken) {
    return {ok: false, error: body.error || 'Could not start checkout.'};
  }
  return {ok: true, checkoutUrl: body.checkoutUrl, claimToken: body.claimToken};
}

export async function requestClaim(
  claimToken: string,
  fetcher: typeof fetch = fetch,
): Promise<ClaimResult> {
  const response = await fetcher(
    `/api/billing/me?claim=${encodeURIComponent(claimToken)}`,
    {headers: {Accept: 'application/json'}},
  );
  const body = (await response.json()) as ClaimResult;
  return body.entitled ? body : {entitled: false};
}
