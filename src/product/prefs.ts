import type {MobileKind} from '../platform/runtime';
import {LIVE_VOICE} from './identity';

export const PREFS_STORAGE = 'taskkorb.prefs';

export const LIVE_VOICES = ['Orus', 'Puck', 'Kore', 'Fenrir', 'Aoede', 'Charon'] as const;
export type LiveVoice = (typeof LIVE_VOICES)[number];

export const REPLY_LANGUAGES = ['auto', 'en', 'hi'] as const;
export type ReplyLanguage = (typeof REPLY_LANGUAGES)[number];

export const TALK_MODES = ['hold', 'tap'] as const;
export type TalkMode = (typeof TALK_MODES)[number];

export interface UserPrefs {
  voice: LiveVoice;
  language: ReplyLanguage;
  volume: number;
  talkMode: TalkMode;
  reduceMotion: boolean;
}

export const DEFAULT_PREFS: UserPrefs = {
  voice: LIVE_VOICE as LiveVoice,
  language: 'auto',
  volume: 1,
  talkMode: 'hold',
  reduceMotion: false,
};

export function defaultTalkMode(kind: MobileKind): TalkMode {
  switch (kind) {
    case 'ios':
    case 'android':
      return 'tap';
    case 'other':
      return 'hold';
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function isVoice(value: unknown): value is LiveVoice {
  return typeof value === 'string' && (LIVE_VOICES as readonly string[]).includes(value);
}

function isLanguage(value: unknown): value is ReplyLanguage {
  return typeof value === 'string' && (REPLY_LANGUAGES as readonly string[]).includes(value);
}

function isTalkMode(value: unknown): value is TalkMode {
  return typeof value === 'string' && (TALK_MODES as readonly string[]).includes(value);
}

export function clampVolume(value: number): number {
  if (Number.isNaN(value)) {
    return 1;
  }
  return Math.min(1, Math.max(0, value));
}

export function normalizePrefs(raw: unknown): UserPrefs {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_PREFS;
  }
  const value = raw as Partial<UserPrefs>;
  return {
    voice: isVoice(value.voice) ? value.voice : DEFAULT_PREFS.voice,
    language: isLanguage(value.language) ? value.language : DEFAULT_PREFS.language,
    volume: clampVolume(typeof value.volume === 'number' ? value.volume : DEFAULT_PREFS.volume),
    talkMode: isTalkMode(value.talkMode) ? value.talkMode : DEFAULT_PREFS.talkMode,
    reduceMotion:
      typeof value.reduceMotion === 'boolean' ? value.reduceMotion : DEFAULT_PREFS.reduceMotion,
  };
}

export function readPrefs(
  storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage,
  kind: MobileKind = 'other',
): UserPrefs {
  const fallback: UserPrefs = {
    ...DEFAULT_PREFS,
    talkMode: defaultTalkMode(kind),
  };
  try {
    const raw = storage?.getItem(PREFS_STORAGE);
    return raw ? normalizePrefs(JSON.parse(raw)) : fallback;
  } catch {
    return fallback;
  }
}

export function writePrefs(prefs: UserPrefs): void {
  try {
    localStorage.setItem(PREFS_STORAGE, JSON.stringify(normalizePrefs(prefs)));
  } catch {
    // ignore
  }
}

export function languageInstruction(language: ReplyLanguage): string {
  switch (language) {
    case 'en':
      return 'Reply in English.';
    case 'hi':
      return 'Reply in Hindi.';
    case 'auto':
      return 'If the user speaks Hindi or Hinglish, reply in the same language.';
    default: {
      const exhaustive: never = language;
      return exhaustive;
    }
  }
}
