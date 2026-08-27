import {uiLanguage} from '../product/copy';
import {clampVolume} from '../product/prefs';

export interface SpeechVoiceLike {
  name: string;
  lang: string;
  localService: boolean;
}

export interface SpeakableUtterance {
  text: string;
  lang: string;
  volume: number;
  voice?: SpeechVoiceLike;
}

export interface SynthesisLike {
  speaking: boolean;
  pending: boolean;
  cancel(): void;
  getVoices(): readonly SpeechVoiceLike[];
  speak(utterance: SpeakableUtterance): void;
}

export type SpeakPlan =
  | {action: 'skip'}
  | {
      action: 'cancel-and-speak';
      text: string;
      lang: string;
      volume: number;
      voiceName?: string;
      localService: boolean;
    };

function languagePrefix(lang: string): string {
  return lang.slice(0, 2).toLowerCase();
}

export function pickSpeechVoice(
  voices: readonly SpeechVoiceLike[],
  lang: string,
): SpeechVoiceLike | undefined {
  if (voices.length === 0) {
    return undefined;
  }

  const prefix = languagePrefix(lang);
  const matching = voices.filter((voice) => languagePrefix(voice.lang) === prefix);
  const localMatch = matching.find((voice) => voice.localService);
  if (localMatch) {
    return localMatch;
  }
  if (matching[0]) {
    return matching[0];
  }
  return voices.find((voice) => voice.localService) ?? voices[0];
}

export function speechLang(
  language: 'auto' | 'en' | 'hi',
  navigatorLanguage = '',
): string {
  return uiLanguage({language}, navigatorLanguage) === 'hi' ? 'hi-IN' : 'en-US';
}

export function planTypedSpeak(input: {
  text: string;
  lang: string;
  volume: number;
  voices: readonly SpeechVoiceLike[];
}): SpeakPlan {
  const text = input.text.replace(/\s+/g, ' ').trim();
  if (!text) {
    return {action: 'skip'};
  }

  const voice = pickSpeechVoice(input.voices, input.lang);
  return {
    action: 'cancel-and-speak',
    text,
    lang: input.lang,
    volume: clampVolume(input.volume),
    voiceName: voice?.name,
    localService: Boolean(voice?.localService),
  };
}

export function shouldSpeakOrbText(input: {liveAudioPlaying: boolean}): boolean {
  return !input.liveAudioPlaying;
}

function defaultUtterance(text: string): SpeakableUtterance {
  if (typeof SpeechSynthesisUtterance === 'function') {
    return new SpeechSynthesisUtterance(text);
  }
  return {text, lang: '', volume: 1};
}

export function applySpeakPlan(
  synthesis: SynthesisLike,
  plan: SpeakPlan,
  createUtterance: (text: string) => SpeakableUtterance = defaultUtterance,
): 'skipped' | 'spoke' {
  switch (plan.action) {
    case 'skip':
      return 'skipped';
    case 'cancel-and-speak': {
      if (synthesis.speaking || synthesis.pending) {
        synthesis.cancel();
      }
      const utterance = createUtterance(plan.text);
      utterance.lang = plan.lang;
      utterance.volume = plan.volume;
      if (plan.voiceName) {
        const voice = synthesis.getVoices().find((item) => item.name === plan.voiceName);
        if (voice) {
          utterance.voice = voice;
        }
      }
      synthesis.speak(utterance);
      return 'spoke';
    }
    default: {
      const exhaustive: never = plan;
      return exhaustive;
    }
  }
}
