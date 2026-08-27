import {describe, expect, it} from 'vitest';
import {
  applySpeakPlan,
  pickSpeechVoice,
  planTypedSpeak,
  shouldSpeakOrbText,
  speechLang,
  type SpeechVoiceLike,
  type SynthesisLike,
} from './typed-tts';

function voice(
  name: string,
  lang: string,
  localService: boolean,
): SpeechVoiceLike {
  return {name, lang, localService};
}

describe('pickSpeechVoice', () => {
  it('prefers a local voice that matches the requested language', () => {
    const voices = [
      voice('Remote Hindi', 'hi-IN', false),
      voice('Local Hindi', 'hi-IN', true),
      voice('Local English', 'en-US', true),
    ];
    expect(pickSpeechVoice(voices, 'hi-IN')?.name).toBe('Local Hindi');
  });

  it('falls back to a remote matching voice when no local voice exists', () => {
    const voices = [
      voice('Remote Hindi', 'hi-IN', false),
      voice('Local English', 'en-US', true),
    ];
    expect(pickSpeechVoice(voices, 'hi')?.name).toBe('Remote Hindi');
  });

  it('uses any local voice when none match the language', () => {
    const voices = [
      voice('Remote English', 'en-US', false),
      voice('Local English', 'en-GB', true),
    ];
    expect(pickSpeechVoice(voices, 'hi-IN')?.name).toBe('Local English');
  });

  it('returns undefined when the browser exposes no voices', () => {
    expect(pickSpeechVoice([], 'en-US')).toBeUndefined();
  });
});

describe('speechLang', () => {
  it('maps Hindi and English prefs to BCP-47 tags', () => {
    expect(speechLang('hi', 'en-US')).toBe('hi-IN');
    expect(speechLang('en', 'hi-IN')).toBe('en-US');
  });

  it('follows the browser language when prefs are auto', () => {
    expect(speechLang('auto', 'hi-IN')).toBe('hi-IN');
    expect(speechLang('auto', 'en-GB')).toBe('en-US');
  });
});

describe('planTypedSpeak', () => {
  it('skips blank typed text so we do not cancel a useful utterance', () => {
    expect(
      planTypedSpeak({
        text: '   ',
        lang: 'en-US',
        volume: 1,
        voices: [voice('Local English', 'en-US', true)],
      }),
    ).toEqual({action: 'skip'});
  });

  it('builds a cancel-and-speak plan with a local voice when one exists', () => {
    expect(
      planTypedSpeak({
        text: '  hello orb  ',
        lang: 'en-US',
        volume: 1.8,
        voices: [voice('Remote', 'en-US', false), voice('On Device', 'en-US', true)],
      }),
    ).toEqual({
      action: 'cancel-and-speak',
      text: 'hello orb',
      lang: 'en-US',
      volume: 1,
      voiceName: 'On Device',
      localService: true,
    });
  });

  it('does not claim an on-device voice when only remote voices exist', () => {
    const plan = planTypedSpeak({
      text: 'namaste',
      lang: 'hi-IN',
      volume: 0.4,
      voices: [voice('Cloud Hindi', 'hi-IN', false)],
    });
    expect(plan).toMatchObject({
      action: 'cancel-and-speak',
      voiceName: 'Cloud Hindi',
      localService: false,
      volume: 0.4,
    });
  });
});

describe('applySpeakPlan', () => {
  it('does not touch synthesis when the plan is skip', () => {
    const spoken: string[] = [];
    const synthesis = fakeSynthesis(spoken, {speaking: true, pending: true});
    expect(applySpeakPlan(synthesis, {action: 'skip'})).toBe('skipped');
    expect(synthesis.cancelCalls).toBe(0);
    expect(spoken).toEqual([]);
  });

  it('cancels in-flight speech before speaking so rapid sends do not stack', () => {
    const spoken: string[] = [];
    const synthesis = fakeSynthesis(spoken, {speaking: true, pending: true});
    const result = applySpeakPlan(
      synthesis,
      {
        action: 'cancel-and-speak',
        text: 'second note',
        lang: 'en-US',
        volume: 0.5,
        voiceName: 'On Device',
        localService: true,
      },
    );
    expect(result).toBe('spoke');
    expect(synthesis.cancelCalls).toBe(1);
    expect(spoken).toEqual(['second note']);
    expect(synthesis.lastUtterance).toMatchObject({
      text: 'second note',
      lang: 'en-US',
      volume: 0.5,
      voice: {name: 'On Device', lang: 'en-US', localService: true},
    });
  });

  it('cancels pending queued speech even when nothing is currently speaking', () => {
    const spoken: string[] = [];
    const synthesis = fakeSynthesis(spoken, {speaking: false, pending: true});
    applySpeakPlan(synthesis, {
      action: 'cancel-and-speak',
      text: 'only one',
      lang: 'hi-IN',
      volume: 1,
    });
    expect(synthesis.cancelCalls).toBe(1);
    expect(spoken).toEqual(['only one']);
  });
});

describe('shouldSpeakOrbText', () => {
  it('skips orb transcript speech while Live PCM is already playing', () => {
    expect(shouldSpeakOrbText({liveAudioPlaying: true})).toBe(false);
  });

  it('allows orb transcript speech when no Live audio is playing', () => {
    expect(shouldSpeakOrbText({liveAudioPlaying: false})).toBe(true);
  });
});

function fakeSynthesis(
  spoken: string[],
  state: {speaking: boolean; pending: boolean},
): SynthesisLike & {cancelCalls: number; lastUtterance?: Record<string, unknown>} {
  const voices = [voice('On Device', 'en-US', true)];
  const fake = {
    speaking: state.speaking,
    pending: state.pending,
    cancelCalls: 0,
    lastUtterance: undefined as Record<string, unknown> | undefined,
    cancel() {
      fake.cancelCalls += 1;
      fake.speaking = false;
      fake.pending = false;
    },
    getVoices() {
      return voices;
    },
    speak(utterance: {text: string; lang: string; volume: number; voice?: SpeechVoiceLike}) {
      spoken.push(utterance.text);
      fake.lastUtterance = {
        text: utterance.text,
        lang: utterance.lang,
        volume: utterance.volume,
        voice: utterance.voice,
      };
    },
  };
  return fake;
}
