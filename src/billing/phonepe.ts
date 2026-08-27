import {createHash} from 'node:crypto';
import type {BillingMode} from './paypal';

export function phonepeExpectedAuth(username: string, password: string, rawBody: string): string {
  return createHash('sha256').update(`${username}:${password}:${rawBody}`).digest('hex');
}

export function verifyPhonepeCallback(input: {
  mode: BillingMode;
  authorization: string;
  rawBody: string;
  username: string;
  password: string;
}): {ok: true} | {ok: false; error: string} {
  if (input.mode === 'mock') {
    return {ok: true};
  }
  const expected = phonepeExpectedAuth(input.username, input.password, input.rawBody);
  if (!input.authorization || input.authorization !== expected) {
    return {ok: false, error: 'PhonePe callback signature did not match.'};
  }
  return {ok: true};
}

export function readPhonepeCallback(body: unknown): {
  type: 'CHECKOUT_ORDER_COMPLETED' | 'CHECKOUT_ORDER_FAILED';
  merchantOrderId: string;
  providerRef: string;
} | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const root = body as Record<string, unknown>;
  const type = root.type;
  if (type !== 'CHECKOUT_ORDER_COMPLETED' && type !== 'CHECKOUT_ORDER_FAILED') {
    return null;
  }
  const payload =
    root.payload && typeof root.payload === 'object'
      ? (root.payload as Record<string, unknown>)
      : root;
  const merchantOrderId =
    (typeof payload.originalMerchantOrderId === 'string' && payload.originalMerchantOrderId) ||
    (typeof payload.merchantOrderId === 'string' && payload.merchantOrderId) ||
    '';
  const providerRef =
    (typeof payload.orderId === 'string' && payload.orderId) || merchantOrderId;
  if (!merchantOrderId) {
    return null;
  }
  return {type, merchantOrderId, providerRef};
}

export async function createPhonepeCheckout(input: {
  clientId: string;
  clientSecret: string;
  clientVersion: string;
  env: 'sandbox' | 'live';
  orderId: string;
  amountPaisa: number;
  redirectUrl: string;
  fetcher?: typeof fetch;
}): Promise<{ok: true; checkoutUrl: string; providerRef: string} | {ok: false; error: string}> {
  const fetcher = input.fetcher ?? fetch;
  const base =
    input.env === 'live'
      ? 'https://api.phonepe.com/apis'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  const authUrl =
    input.env === 'live'
      ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
      : `${base}/v1/oauth/token`;
  const tokenRes = await fetcher(authUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      client_id: input.clientId,
      client_version: input.clientVersion,
      client_secret: input.clientSecret,
      grant_type: 'client_credentials',
    }).toString(),
  });
  const tokenBody = (await tokenRes.json()) as {access_token?: string};
  if (!tokenRes.ok || !tokenBody.access_token) {
    return {ok: false, error: 'PhonePe login failed. Check the merchant credentials.'};
  }

  const payUrl =
    input.env === 'live'
      ? 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';
  const payRes = await fetcher(payUrl, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `O-Bearer ${tokenBody.access_token}`,
    },
    body: JSON.stringify({
      merchantOrderId: input.orderId,
      amount: input.amountPaisa,
      expireAfter: 1200,
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: 'Speak, and the orb answers.',
        merchantUrls: {redirectUrl: input.redirectUrl},
      },
    }),
  });
  const payBody = (await payRes.json()) as {orderId?: string; redirectUrl?: string};
  if (!payRes.ok || !payBody.redirectUrl || !payBody.orderId) {
    return {ok: false, error: 'PhonePe could not start checkout.'};
  }
  return {ok: true, checkoutUrl: payBody.redirectUrl, providerRef: payBody.orderId};
}
