export const PRODUCT_NAME = 'Taskkorb';
export const PRODUCT_TAGLINE = 'Speak, and the orb answers.';
export const GEMINI_KEY_HELP_URL = 'https://aistudio.google.com/apikey';

/**
 * Official Live Audio model used by current Gemini docs as of 2026-08.
 * The previous AI Studio export used preview-09-2025 and remains a fallback.
 */
export const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';
export const LIVE_MODEL_FALLBACK = 'gemini-2.5-flash-native-audio-preview-09-2025';
export const LIVE_VOICE = 'Orus';

export const SYSTEM_INSTRUCTION = `You are Taskkorb, a calm voice companion represented as a living orb.
Keep spoken replies short and clear.
Help the user think out loud, plan next steps, and decide.
Do not claim to have taken real-world actions you cannot take.
Never ask the user to paste secrets into chat.`;

export function buildSystemInstruction(languageLine: string): string {
  return `${SYSTEM_INSTRUCTION}\n${languageLine}`;
}

export const INPUT_SAMPLE_RATE = 16000;
export const OUTPUT_SAMPLE_RATE = 24000;
