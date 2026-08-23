export const MIN_API_KEY_LENGTH = 20;
export const MAX_API_KEY_LENGTH = 200;

export type ApiKeyValidation =
  | {ok: true; key: string}
  | {ok: false; message: string};

export function validateApiKey(raw: string): ApiKeyValidation {
  const key = raw.trim();

  if (!key) {
    return {ok: false, message: 'Paste a Gemini API key to connect.'};
  }

  if (/\s/.test(key)) {
    return {ok: false, message: 'That does not look like a Gemini API key.'};
  }

  if (key.length < MIN_API_KEY_LENGTH) {
    return {ok: false, message: 'That does not look like a Gemini API key.'};
  }

  if (key.length > MAX_API_KEY_LENGTH) {
    return {ok: false, message: 'That key is too long. Paste the Gemini API key only.'};
  }

  if (/^(your-?api-?key|xxx+|placeholder|changeme)$/i.test(key)) {
    return {ok: false, message: 'That does not look like a Gemini API key.'};
  }

  return {ok: true, key};
}
