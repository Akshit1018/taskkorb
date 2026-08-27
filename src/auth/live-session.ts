import {parseRetryAfterMs} from './mint-rate-limit';

export const HOSTED_SESSION_TIMEOUT_MS = 4000;

export type HostedSession =
  | {mode: 'hosted'; token: string; expireTime?: string}
  | {mode: 'byo'}
  | {mode: 'error'; message: string};

interface LiveSessionResponse {
  available?: boolean;
  token?: string;
  expireTime?: string;
  error?: string;
}

function readSession(response: Response, body: LiveSessionResponse): HostedSession {
  if (response.status === 404) {
    return {mode: 'byo'};
  }

  if (response.ok && body.available && typeof body.token === 'string' && body.token) {
    return {
      mode: 'hosted',
      token: body.token,
      expireTime: typeof body.expireTime === 'string' ? body.expireTime : undefined,
    };
  }

  if (response.status === 429 || response.status >= 500 || body.available) {
    return {
      mode: 'error',
      message: body.error || 'Hosted session is unavailable. Paste a Gemini key to test locally.',
    };
  }

  return {mode: 'byo'};
}

async function requestLiveSession(
  fetcher: typeof fetch,
  claimToken = '',
): Promise<{
  response: Response;
  body: LiveSessionResponse;
}> {
  const headers: Record<string, string> = {Accept: 'application/json'};
  if (claimToken) {
    headers['x-taskkorb-claim'] = claimToken;
  }
  const response = await fetcher('/api/live-session', {
    method: 'GET',
    headers,
  });
  const body = (await response.json()) as LiveSessionResponse;
  return {response, body};
}

function withTimeout<T>(work: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('hosted-timeout'));
    }, timeoutMs);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function fetchHostedCredential(
  fetcher: typeof fetch = fetch,
  wait: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    }),
  timeoutMs = HOSTED_SESSION_TIMEOUT_MS,
  claimToken = '',
): Promise<HostedSession> {
  try {
    const first = await withTimeout(requestLiveSession(fetcher, claimToken), timeoutMs);
    if (first.response.status === 429) {
      await wait(parseRetryAfterMs(first.response.headers.get('Retry-After')));
      const second = await withTimeout(requestLiveSession(fetcher, claimToken), timeoutMs);
      return readSession(second.response, second.body);
    }
    return readSession(first.response, first.body);
  } catch {
    return {mode: 'byo'};
  }
}
