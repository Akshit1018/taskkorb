import {LIVE_MODEL, SYSTEM_INSTRUCTION} from '../product/identity';

export const TOKEN_TTL_MS = 30 * 60 * 1000;
export const NEW_SESSION_TTL_MS = 5 * 60 * 1000;

export interface MintedToken {
  token: string;
  expireTime: string;
}

export interface TokenCreateConfig {
  uses: number;
  expireTime: string;
  newSessionExpireTime: string;
  liveConnectConstraints: {
    model: string;
    config: {
      responseModalities: string[];
      systemInstruction: string;
    };
  };
  httpOptions: {apiVersion: 'v1alpha'};
}

export function buildTokenCreateConfig(nowMs: number): TokenCreateConfig {
  return {
    uses: 1,
    expireTime: new Date(nowMs + TOKEN_TTL_MS).toISOString(),
    newSessionExpireTime: new Date(nowMs + NEW_SESSION_TTL_MS).toISOString(),
    liveConnectConstraints: {
      model: LIVE_MODEL,
      config: {
        responseModalities: ['AUDIO'],
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    },
    httpOptions: {apiVersion: 'v1alpha'},
  };
}

export function readMintedToken(result: {name?: string}, expireTime: string): MintedToken {
  const token = result.name?.trim();
  if (!token) {
    throw new Error('Gemini returned an empty ephemeral token.');
  }
  return {token, expireTime};
}
