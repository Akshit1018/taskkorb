import {parseRetryAfterMs} from './mint-rate-limit';

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

async function requestLiveSession(fetcher: typeof fetch): Promise<{
  response: Response;
  body: LiveSessionResponse;
}> {
  const response = await fetcher('/api/live-session', {
    method: 'GET',
    headers: {Accept: 'application/json'},
  });
  const body = (await response.json()) as LiveSessionResponse;
  return {response, body};
}

export async function fetchHostedCredential(
  fetcher: typeof fetch = fetch,
  wait: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    }),
): Promise<HostedSession> {
  try {
    const first = await requestLiveSession(fetcher);
    if (first.response.status === 429) {
      await wait(parseRetryAfterMs(first.response.headers.get('Retry-After')));
      const second = await requestLiveSession(fetcher);
      return readSession(second.response, second.body);
    }
    return readSession(first.response, first.body);
  } catch {
    return {mode: 'byo'};
  }
}
