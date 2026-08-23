/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, LiveServerMessage, Modality, Session} from '@google/genai';
import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {createBlob, decode, decodeAudioData} from './src/audio/pcm';
import {
  INPUT_SAMPLE_RATE,
  LIVE_MODEL,
  LIVE_MODEL_FALLBACK,
  LIVE_VOICE,
  OUTPUT_SAMPLE_RATE,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
  SYSTEM_INSTRUCTION,
} from './src/product/identity';
import {
  INITIAL_SESSION,
  SessionSnapshot,
  canStartListening,
  reduceSession,
} from './src/session/machine';
import {track} from './src/telemetry/events';
import './visual-3d';

const API_KEY_STORAGE = 'GEMINI_API_KEY';

function readStoredApiKey(): string {
  const fromEnv = process.env.GEMINI_API_KEY;
  if (fromEnv) {
    return fromEnv;
  }

  try {
    return sessionStorage.getItem(API_KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state() apiKey = readStoredApiKey();
  @state() keyDraft = '';
  @state() sessionState: SessionSnapshot = this.apiKey
    ? reduceSession(INITIAL_SESSION, {type: 'CONNECT_STARTED'})
    : INITIAL_SESSION;
  @state() userTranscript = '';
  @state() orbTranscript = '';
  @state() inputNode?: GainNode;
  @state() outputNode?: GainNode;

  private client?: GoogleGenAI;
  private session?: Session;
  private inputAudioContext?: AudioContext;
  private outputAudioContext?: AudioContext;
  private nextStartTime = 0;
  private mediaStream?: MediaStream;
  private sourceNode?: MediaStreamAudioSourceNode;
  private workletNode?: AudioWorkletNode;
  private scriptProcessorNode?: ScriptProcessorNode;
  private sources = new Set<AudioBufferSourceNode>();

  static styles = css`
    #status {
      position: absolute;
      bottom: 4vh;
      left: 16px;
      right: 16px;
      z-index: 10;
      text-align: center;
      color: rgba(255, 255, 255, 0.82);
      font-family: Inter, system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    }

    #status[data-kind='error'] {
      color: #ffb4b4;
    }

    .transcript {
      position: absolute;
      top: 6vh;
      left: 16px;
      right: 16px;
      z-index: 10;
      max-width: 640px;
      margin: 0 auto;
      color: rgba(255, 255, 255, 0.78);
      font-family: Inter, system-ui, sans-serif;
      font-size: 15px;
      line-height: 1.45;
      text-align: center;
    }

    .transcript p {
      margin: 0 0 8px;
    }

    .controls {
      z-index: 10;
      position: absolute;
      bottom: 11vh;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .controls button {
      outline: none;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.1);
      min-width: 64px;
      height: 64px;
      cursor: pointer;
      padding: 0 16px;
      font-family: Inter, system-ui, sans-serif;
    }

    .controls button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    .controls button:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .controls button[data-kind='record'] {
      width: 72px;
      min-width: 72px;
      height: 72px;
      border-radius: 999px;
      background: #c80000;
      border-color: transparent;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }

    .key-gate {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(8, 6, 12, 0.72);
      padding: 24px;
    }

    .key-card {
      width: min(420px, 100%);
      color: white;
      text-align: center;
      font-family: Inter, system-ui, sans-serif;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 20px;
      padding: 24px;
      backdrop-filter: blur(16px);
    }

    .key-card h1 {
      margin: 0 0 8px;
      font-size: 22px;
    }

    .key-card p {
      margin: 0 0 16px;
      color: rgba(255, 255, 255, 0.72);
      line-height: 1.4;
    }

    .key-card input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.28);
      color: white;
      padding: 12px 14px;
      font-size: 16px;
    }

    .key-card button {
      margin-top: 12px;
      width: 100%;
      height: 48px;
      border: 0;
      border-radius: 12px;
      background: white;
      color: #100c14;
      font-weight: 600;
      cursor: pointer;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.apiKey) {
      void this.initClient();
    }
  }

  private applyEvent(event: Parameters<typeof reduceSession>[1]) {
    this.sessionState = reduceSession(this.sessionState, event);
  }

  private ensureAudio() {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error('Web Audio is not supported in this browser.');
    }

    if (!this.inputAudioContext) {
      this.inputAudioContext = new AudioContextCtor({
        sampleRate: INPUT_SAMPLE_RATE,
      });
      this.inputNode = this.inputAudioContext.createGain();
    }

    if (!this.outputAudioContext) {
      this.outputAudioContext = new AudioContextCtor({
        sampleRate: OUTPUT_SAMPLE_RATE,
      });
      this.outputNode = this.outputAudioContext.createGain();
      this.outputNode.connect(this.outputAudioContext.destination);
    }
  }

  private async initClient() {
    this.ensureAudio();
    await this.outputAudioContext?.resume();
    this.nextStartTime = this.outputAudioContext?.currentTime ?? 0;
    this.client = new GoogleGenAI({
      apiKey: this.apiKey,
    });
    await this.initSession();
  }

  private async initSession() {
    if (!this.client) {
      return;
    }

    this.applyEvent({type: 'CONNECT_STARTED'});
    track('session_connect_started', {model: LIVE_MODEL});

    const models = [LIVE_MODEL, LIVE_MODEL_FALLBACK];
    let lastError: unknown;

    for (const model of models) {
      try {
        this.session = await this.client.live.connect({
          model,
          callbacks: {
            onopen: () => {
              this.applyEvent({type: 'OPENED'});
              track('session_opened');
            },
            onmessage: async (message: LiveServerMessage) => {
              await this.handleLiveMessage(message);
            },
            onerror: (e: ErrorEvent) => {
              this.applyEvent({type: 'ERROR', message: e.message || 'Live session error'});
              track('session_error', {reason: 'callback'});
            },
            onclose: (e: CloseEvent) => {
              this.applyEvent({type: 'CLOSED', reason: e.reason});
              track('session_closed', {reason: e.reason ? 'remote' : 'empty'});
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: SYSTEM_INSTRUCTION,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              voiceConfig: {prebuiltVoiceConfig: {voiceName: LIVE_VOICE}},
            },
          },
        });
        return;
      } catch (error) {
        lastError = error;
      }
    }

    const message =
      lastError instanceof Error ? lastError.message : 'Could not open a live session.';
    this.applyEvent({type: 'ERROR', message});
    track('session_error', {reason: 'connect'});
  }

  private async handleLiveMessage(message: LiveServerMessage) {
    const inputText = message.serverContent?.inputTranscription?.text;
    if (inputText) {
      this.userTranscript = `${this.userTranscript} ${inputText}`.trim();
      track('transcript_received', {side: 'user'});
    }

    const outputText = message.serverContent?.outputTranscription?.text;
    if (outputText) {
      this.orbTranscript = `${this.orbTranscript} ${outputText}`.trim();
      track('transcript_received', {side: 'orb'});
    }

    const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData;
    if (audio?.data && this.outputAudioContext && this.outputNode) {
      this.applyEvent({type: 'AUDIO_OUT'});
      this.nextStartTime = Math.max(
        this.nextStartTime,
        this.outputAudioContext.currentTime,
      );

      const audioBuffer = await decodeAudioData(
        decode(audio.data),
        this.outputAudioContext,
        OUTPUT_SAMPLE_RATE,
        1,
      );
      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputNode);
      source.addEventListener('ended', () => {
        this.sources.delete(source);
      });
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
    }

    if (message.serverContent?.interrupted) {
      for (const source of this.sources.values()) {
        source.stop();
        this.sources.delete(source);
      }
      this.nextStartTime = 0;
      this.applyEvent({type: 'INTERRUPTED'});
      track('speech_interrupted');
    }
  }

  private sendPcm(pcmData: Float32Array) {
    if (this.sessionState.phase !== 'listening' && this.sessionState.phase !== 'speaking') {
      return;
    }
    if (!this.session) {
      return;
    }

    try {
      this.session.sendRealtimeInput({media: createBlob(pcmData)});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not send audio.';
      this.applyEvent({type: 'ERROR', message});
    }
  }

  private async attachCaptureGraph(source: MediaStreamAudioSourceNode) {
    if (!this.inputAudioContext || !this.inputNode) {
      throw new Error('Audio is not ready.');
    }

    source.connect(this.inputNode);

    try {
      await this.inputAudioContext.audioWorklet.addModule('/pcm-recorder-worklet.js');
      this.workletNode = new AudioWorkletNode(this.inputAudioContext, 'pcm-recorder');
      this.workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
        this.sendPcm(event.data);
      };
      source.connect(this.workletNode);
      return;
    } catch (error) {
      console.warn('AudioWorklet unavailable, falling back to ScriptProcessor', error);
    }

    this.scriptProcessorNode = this.inputAudioContext.createScriptProcessor(2048, 1, 1);
    this.scriptProcessorNode.onaudioprocess = (audioProcessingEvent) => {
      this.sendPcm(audioProcessingEvent.inputBuffer.getChannelData(0));
    };
    source.connect(this.scriptProcessorNode);
  }

  private async startRecording() {
    if (!canStartListening(this.sessionState.phase)) {
      this.applyEvent({
        type: 'ERROR',
        message: 'Wait until the orb is connected before talking.',
      });
      return;
    }

    this.ensureAudio();
    await this.inputAudioContext?.resume();
    await this.outputAudioContext?.resume();

    track('mic_requested');
    this.sessionState = {
      ...this.sessionState,
      status: 'Requesting microphone access…',
    };

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
        video: false,
      });
      track('mic_granted');

      this.sourceNode = this.inputAudioContext!.createMediaStreamSource(this.mediaStream);
      await this.attachCaptureGraph(this.sourceNode);
      this.applyEvent({type: 'LISTEN_STARTED'});
      track('listen_started');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Microphone access failed.';
      track('mic_denied');
      this.applyEvent({type: 'ERROR', message});
      this.stopRecording();
    }
  }

  private stopRecording() {
    const wasListening =
      this.sessionState.phase === 'listening' || this.sessionState.phase === 'speaking';

    this.workletNode?.disconnect();
    this.scriptProcessorNode?.disconnect();
    this.sourceNode?.disconnect();
    this.workletNode = undefined;
    this.scriptProcessorNode = undefined;
    this.sourceNode = undefined;

    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = undefined;

    if (wasListening) {
      this.applyEvent({type: 'LISTEN_STOPPED'});
      track('listen_stopped');
    }
  }

  private async reset() {
    this.stopRecording();
    this.session?.close();
    this.session = undefined;
    this.userTranscript = '';
    this.orbTranscript = '';
    this.applyEvent({type: 'RESET'});
    await this.initSession();
  }

  private async saveApiKey(event: Event) {
    event.preventDefault();
    const nextKey = this.keyDraft.trim();
    if (!nextKey) {
      this.applyEvent({type: 'ERROR', message: 'A Gemini API key is required.'});
      return;
    }

    try {
      sessionStorage.setItem(API_KEY_STORAGE, nextKey);
    } catch {
      // Session storage can be blocked; the in-memory key is enough for this tab.
    }

    this.apiKey = nextKey;
    this.applyEvent({type: 'KEY_SUBMITTED'});
    await this.initClient();
  }

  private updateKeyDraft(event: Event) {
    this.keyDraft = (event.target as HTMLInputElement).value;
  }

  render() {
    const {phase, status, error} = this.sessionState;
    const listening = phase === 'listening' || phase === 'speaking';

    return html`
      <div>
        ${this.apiKey
          ? ''
          : html`
              <form class="key-gate" @submit=${this.saveApiKey}>
                <div class="key-card">
                  <h1>${PRODUCT_NAME}</h1>
                  <p>${PRODUCT_TAGLINE}</p>
                  <p>
                    Paste a Gemini API key to start. It stays in this browser tab
                    only. This is for testing, not production.
                  </p>
                  <input
                    type="password"
                    autocomplete="off"
                    placeholder="GEMINI_API_KEY"
                    aria-label="Gemini API key"
                    .value=${this.keyDraft}
                    @input=${this.updateKeyDraft} />
                  <button type="submit">Start</button>
                </div>
              </form>
            `}
        <div class="transcript" aria-live="polite">
          ${this.userTranscript
            ? html`<p><strong>You:</strong> ${this.userTranscript}</p>`
            : ''}
          ${this.orbTranscript
            ? html`<p><strong>Orb:</strong> ${this.orbTranscript}</p>`
            : ''}
        </div>
        <div class="controls">
          <button
            id="resetButton"
            aria-label="Reset conversation"
            title="Reset conversation"
            @click=${this.reset}
            ?disabled=${listening}>
            Reset
          </button>
          <button
            id="startButton"
            data-kind="record"
            aria-label="Start talking"
            title="Start talking"
            @click=${this.startRecording}
            ?disabled=${listening || !canStartListening(phase)}>
            <span class="sr-only">Start talking</span>
          </button>
          <button
            id="stopButton"
            aria-label="Stop talking"
            title="Stop talking"
            @click=${this.stopRecording}
            ?disabled=${!listening}>
            Stop
          </button>
        </div>

        <div id="status" role="status" data-kind=${error ? 'error' : 'info'}>
          ${error || status}
        </div>
        <gdm-live-audio-visuals-3d
          .inputNode=${this.inputNode}
          .outputNode=${this.outputNode}></gdm-live-audio-visuals-3d>
      </div>
    `;
  }
}
