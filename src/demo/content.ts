import type {UiLang} from '../product/copy';
import type {TranscriptState} from '../transcript/store';

const SEED_EN: Array<{side: 'user' | 'orb'; text: string}> = [
  {side: 'user', text: 'Remind me to call the shop at six.'},
  {side: 'orb', text: 'Held. Speak, and the orb answers.'},
];

const SEED_HI: Array<{side: 'user' | 'orb'; text: string}> = [
  {side: 'user', text: 'दुकान को छह बजे याद दिलाना।'},
  {side: 'orb', text: 'रख लिया। बोलो, और ऑर्ब जवाब दे।'},
];

const EXCHANGE_EN = [
  {user: 'Hello orb.', orb: 'Hello. This is a demo reply, not Gemini Live.'},
  {user: 'Can you hear me?', orb: 'In demo I play a sample. Paste a key to talk for real.'},
  {user: 'What can I try?', orb: 'Type a note, open More, or tap Talk again for another sample.'},
];

const EXCHANGE_HI = [
  {user: 'नमस्ते ऑर्ब।', orb: 'नमस्ते। यह डेमो जवाब है, Gemini Live नहीं।'},
  {user: 'सुन रहे हो?', orb: 'डेमो में सैंपल चलता है। असली बात के लिए कुंजी डालो।'},
  {user: 'और क्या देखूँ?', orb: 'नोट लिखो, और खोलो, या बात फिर टैप करो।'},
];

export function demoTranscript(now: number, lang: UiLang): TranscriptState {
  const seed = lang === 'hi' ? SEED_HI : SEED_EN;
  return {
    clipped: false,
    turns: seed.map((turn, index) => ({
      side: turn.side,
      text: turn.text,
      at: now + index * 1000,
    })),
  };
}

export function nextDemoExchange(
  index: number,
  lang: UiLang,
): {user: string; orb: string} {
  const list = lang === 'hi' ? EXCHANGE_HI : EXCHANGE_EN;
  const safe = ((index % list.length) + list.length) % list.length;
  return list[safe] ?? list[0];
}
