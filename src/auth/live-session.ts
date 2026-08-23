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

export async function fetchHostedCredential(
  fetcher: typeof fetch = fetch,
): Promise<HostedSession> {
  try {
    const response = await fetcher('/api/live-session', {
      method: 'GET',
      headers: {Accept: 'application/json'},
    });

    if (response.status === 404) {
      return {mode: 'byo'};
    }

    const body = (await response.json()) as LiveSessionResponse;

    if (response.ok && body.available && typeof body.token === 'string' && body.token) {
      return {
        mode: 'hosted',
        token: body.token,
        expireTime: typeof body.expireTime === 'string' ? body.expireTime : undefined,
      };
    }

    if (response.status >= 500 || body.available) {
      return {
        mode: 'error',
        message: body.error || 'Hosted session is unavailable. Paste a Gemini key to test locally.',
      };
    }

    return {mode: 'byo'};
  } catch {
    return {mode: 'byo'};
  }
}
