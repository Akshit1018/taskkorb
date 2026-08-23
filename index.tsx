/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, LiveServerMessage, Modality, Session} from '@google/genai';
import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {MAX_API_KEY_LENGTH, validateApiKey} from './src/auth/api-key';
import {fetchHostedCredential} from './src/auth/live-session';
import {isAudible} from './src/audio/level';
import {createBlob, decode, decodeAudioData} from './src/audio/pcm';
import {humanizeError} from './src/errors/humanize';
import {
  INPUT_SAMPLE_RATE,
  LIVE_MODEL,
  LIVE_MODEL_FALLBACK,
  OUTPUT_SAMPLE_RATE,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
  buildSystemInstruction,
} from './src/product/identity';
import {
  DEFAULT_PREFS,
  LIVE_VOICES,
  REPLY_LANGUAGES,
  UserPrefs,
  clampVolume,
  languageInstruction,
  readPrefs,
  writePrefs,
} from './src/product/prefs';
import {
  INITIAL_SESSION,
  SessionSnapshot,
  canRetry,
  canStartListening,
  reduceSession,
} from './src/session/machine';
import {track} from './src/telemetry/events';
import {
  EMPTY_TRANSCRIPT,
  TranscriptState,
  appendTurn,
  clearStoredTranscript,
  exportTranscript,
  readStoredTranscript,
  writeStoredTranscript,
} from './src/transcript/store';
import './visual-3d';

const MAX_LISTEN_MS = 180_000;

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state() apiKey = '';
  @state() keyDraft = '';
  @state() editingKey = true;
  @state() authMode: 'unknown' | 'hosted' | 'byo' = 'unknown';
  @state() connectInFlight = false;
  @state() sessionState: SessionSnapshot = INITIAL_SESSION;
  @state() transcript: TranscriptState = EMPTY_TRANSCRIPT;
  @state() undoTranscript: TranscriptState | null = null;
  @state() prefs: UserPrefs = DEFAULT_PREFS;
  @state() moreOpen = false;
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
  private connectGeneration = 0;
  private listenInFlight = false;
  private listenCancelRequested = false;
  private listenStartedAt = 0;
  private listenCapTimer = 0;
  private useAlphaLiveApi = false;

  static styles = css`
    :host {
      font-family: system-ui, sans-serif;
    }

    #status {
      position: absolute;
      bottom: calc(12px + env(safe-area-inset-bottom, 0px));
      left: 16px;
      right: 16px;
      z-index: 10;
      text-align: center;
      color: rgba(255, 255, 255, 0.86);
      font-size: 14px;
      line-height: 1.4;
    }

    #status[data-kind='error'] {
      color: #ffb4b4;
    }

    .transcript {
      position: absolute;
      top: calc(16px + env(safe-area-inset-top, 0px));
      left: 16px;
      right: 16px;
      z-index: 10;
      max-width: 640px;
      max-height: 28vh;
      overflow: auto;
      margin: 0 auto;
      color: rgba(255, 255, 255, 0.8);
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
      bottom: calc(10vh + env(safe-area-inset-bottom, 0px));
      left: 16px;
      right: 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    button {
      outline: none;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.1);
      min-height: 48px;
      min-width: 48px;
      cursor: pointer;
      padding: 0 14px;
      font: inherit;
    }

    button:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }

    button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    button:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    button[data-kind='talk'] {
      min-width: 148px;
      min-height: 148px;
      border-radius: 999px;
      background: #c80000;
      border-color: transparent;
      font-weight: 700;
      font-size: 22px;
      letter-spacing: 0.02em;
    }

    button[data-kind='talk'][aria-pressed='true'] {
      background: #7a0000;
      transform: scale(0.96);
    }

    .more-sheet {
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: calc(28vh + env(safe-area-inset-bottom, 0px));
      z-index: 12;
      margin: 0 auto;
      max-width: 420px;
      padding: 16px;
      border-radius: 20px;
      background: rgba(16, 12, 20, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #fff;
      display: grid;
      gap: 10px;
    }

    .more-sheet label {
      display: grid;
      gap: 6px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.72);
    }

    .more-sheet select,
    .more-sheet input[type='range'] {
      width: 100%;
    }

    .more-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .empty {
      color: rgba(255, 255, 255, 0.55);
    }

    .clip-note,
    .undo {
      color: #ffd79a;
      font-size: 13px;
    }

    .privacy {
      position: absolute;
      bottom: calc(52px + env(safe-area-inset-bottom, 0px));
      left: 16px;
      right: 16px;
      z-index: 10;
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
    }

    .key-gate {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(8, 6, 12, 0.78);
      padding: 24px;
    }

    .key-card {
      width: min(420px, 100%);
      color: white;
      text-align: center;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 20px;
      padding: 24px;
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

    .key-card input:focus-visible,
    .key-card button:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 2px;
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
    }

    .error {
      color: #ffb4b4;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.transcript = readStoredTranscript();
    this.prefs = readPrefs();
    void this.bootstrapAuth();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopRecording();
    this.session?.close();
    window.clearTimeout(this.listenCapTimer);
  }

  private get showKeyGate(): boolean {
    if (this.authMode === 'unknown') {
      return true;
    }
    if (this.authMode === 'hosted' && !this.editingKey) {
      return false;
    }
    return (
      this.editingKey ||
      !this.apiKey ||
      this.sessionState.phase === 'locked' ||
      this.sessionState.errorKind === 'key'
    );
  }

  private async bootstrapAuth() {
    const hosted = await fetchHostedCredential();
    if (hosted.mode === 'hosted') {
      this.authMode = 'hosted';
      this.apiKey = hosted.token;
      this.editingKey = false;
      this.useAlphaLiveApi = true;
      this.applyEvent({type: 'KEY_SUBMITTED'});
      await this.initClient();
      return;
    }
    if (hosted.mode === 'error') {
      this.authMode = 'byo';
      this.editingKey = true;
      this.applyEvent({
        type: 'ERROR',
        kind: 'connect',
        message: hosted.message,
      });
      return;
    }
    this.authMode = 'byo';
  }

  private applyEvent(event: Parameters<typeof reduceSession>[1]) {
    this.sessionState = reduceSession(this.sessionState, event);
  }

  private persistTranscripts() {
    writeStoredTranscript(this.transcript);
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
    if (this.outputNode) {
      this.outputNode.gain.value = this.prefs.volume;
    }
  }

  private async initClient() {
    this.ensureAudio();
    await this.outputAudioContext?.resume();
    this.nextStartTime = this.outputAudioContext?.currentTime ?? 0;
    this.client = new GoogleGenAI({
      apiKey: this.apiKey,
      ...(this.useAlphaLiveApi ? {httpOptions: {apiVersion: 'v1alpha'}} : {}),
    });
    await this.initSession();
  }

  private async initSession() {
    if (!this.client) {
      return;
    }

    const generation = ++this.connectGeneration;
    this.session?.close();
    this.session = undefined;
    this.applyEvent({type: 'CONNECT_STARTED'});
    track('session_connect_started', {model: LIVE_MODEL});

    const models = [LIVE_MODEL, LIVE_MODEL_FALLBACK];
    let lastError: unknown;

    for (const model of models) {
      if (generation !== this.connectGeneration) {
        return;
      }
      try {
        const session = await this.client.live.connect({
          model,
          callbacks: {
            onopen: () => {
              if (generation !== this.connectGeneration) {
                return;
              }
              this.applyEvent({type: 'OPENED'});
              track('session_opened');
            },
            onmessage: async (message: LiveServerMessage) => {
              if (generation !== this.connectGeneration) {
                return;
              }
              await this.handleLiveMessage(message);
            },
            onerror: (e: ErrorEvent) => {
              if (generation !== this.connectGeneration) {
                return;
              }
              this.applyEvent({
                type: 'ERROR',
                kind: 'session',
                message: humanizeError('session', e.message || 'Live session error'),
              });
              track('session_error', {reason: 'callback'});
            },
            onclose: (e: CloseEvent) => {
              if (generation !== this.connectGeneration) {
                return;
              }
              this.applyEvent({type: 'CLOSED', reason: e.reason});
              track('session_closed', {reason: e.reason ? 'remote' : 'empty'});
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: buildSystemInstruction(
              languageInstruction(this.prefs.language),
            ),
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              voiceConfig: {prebuiltVoiceConfig: {voiceName: this.prefs.voice}},
            },
          },
        });
        if (generation !== this.connectGeneration) {
          session.close();
          return;
        }
        this.session = session;
        return;
      } catch (error) {
        lastError = error;
      }
    }

    if (generation !== this.connectGeneration) {
      return;
    }

    const raw = lastError instanceof Error ? lastError.message : 'Could not open a live session.';
    this.applyEvent({
      type: 'ERROR',
      kind: 'key',
      message: humanizeError('key', raw),
    });
    this.editingKey = true;
    track('session_error', {reason: 'connect'});
  }

  private async handleLiveMessage(message: LiveServerMessage) {
    const inputText = message.serverContent?.inputTranscription?.text;
    if (inputText) {
      this.transcript = appendTurn(this.transcript, 'user', inputText);
      this.persistTranscripts();
      track('transcript_received', {side: 'user'});
      if (this.transcript.clipped) {
        track('transcript_clipped', {side: 'user'});
      }
    }

    const outputText = message.serverContent?.outputTranscription?.text;
    if (outputText) {
      this.transcript = appendTurn(this.transcript, 'orb', outputText);
      this.persistTranscripts();
      track('transcript_received', {side: 'orb'});
      if (this.transcript.clipped) {
        track('transcript_clipped', {side: 'orb'});
      }
    }

    const parts = message.serverContent?.modelTurn?.parts ?? [];
    for (const part of parts) {
      const audio = part.inlineData?.data;
      if (!audio || !this.outputAudioContext || !this.outputNode) {
        continue;
      }
      this.applyEvent({type: 'AUDIO_OUT'});
      this.nextStartTime = Math.max(
        this.nextStartTime,
        this.outputAudioContext.currentTime,
      );
      const audioBuffer = await decodeAudioData(
        decode(audio),
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
      try {
        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.sources.add(source);
      } catch {
        try {
          source.start();
          this.sources.add(source);
          this.nextStartTime = this.outputAudioContext.currentTime + audioBuffer.duration;
        } catch {
          // Drop a late chunk rather than breaking the handler.
        }
      }
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
    if (!this.session || !isAudible(pcmData)) {
      return;
    }

    try {
      this.session.sendRealtimeInput({media: createBlob(pcmData)});
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Could not send audio.';
      this.applyEvent({
        type: 'ERROR',
        kind: 'session',
        message: humanizeError('session', raw),
      });
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

  private async startRecording(event?: Event) {
    event?.preventDefault();
    if (this.listenInFlight || !canStartListening(this.sessionState.phase)) {
      return;
    }

    this.listenInFlight = true;
    this.listenCancelRequested = false;
    this.applyEvent({type: 'LISTEN_START_REQUESTED'});
    this.ensureAudio();
    await this.inputAudioContext?.resume();
    await this.outputAudioContext?.resume();
    track('mic_requested');

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
      if (this.listenCancelRequested) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = undefined;
        this.applyEvent({type: 'LISTEN_STOPPED'});
        return;
      }
      this.sourceNode = this.inputAudioContext!.createMediaStreamSource(this.mediaStream);
      await this.attachCaptureGraph(this.sourceNode);
      this.listenStartedAt = Date.now();
      this.applyEvent({type: 'LISTEN_STARTED'});
      track('listen_started');
      window.clearTimeout(this.listenCapTimer);
      this.listenCapTimer = window.setTimeout(() => {
        this.stopRecording('cap');
      }, MAX_LISTEN_MS);
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Microphone access failed.';
      track('mic_denied');
      this.applyEvent({
        type: 'ERROR',
        kind: 'mic',
        message: humanizeError('mic', raw),
      });
      this.stopRecording();
    } finally {
      this.listenInFlight = false;
    }
  }

  private stopRecording(reason: 'release' | 'cap' | 'teardown' = 'release') {
    this.listenCancelRequested = true;
    const wasListening =
      this.sessionState.phase === 'listening' || this.sessionState.phase === 'speaking';

    window.clearTimeout(this.listenCapTimer);
    this.workletNode?.disconnect();
    this.scriptProcessorNode?.disconnect();
    this.sourceNode?.disconnect();
    this.workletNode = undefined;
    this.scriptProcessorNode = undefined;
    this.sourceNode = undefined;
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = undefined;

    if (wasListening) {
      this.applyEvent({type: reason === 'cap' ? 'LISTEN_CAPPED' : 'LISTEN_STOPPED'});
      track(reason === 'cap' ? 'talk_capped' : 'listen_stopped', {
        ms: Date.now() - this.listenStartedAt,
      });
    }
  }

  private async reconnect() {
    this.stopRecording();
    this.editingKey = false;
    this.applyEvent({type: 'RETRY'});
    if (this.authMode === 'hosted') {
      const hosted = await fetchHostedCredential();
      if (hosted.mode !== 'hosted') {
        this.applyEvent({
          type: 'ERROR',
          kind: 'connect',
          message:
            hosted.mode === 'error'
              ? hosted.message
              : 'Hosted session expired. Reconnect or paste a Gemini key.',
        });
        return;
      }
      this.apiKey = hosted.token;
      this.useAlphaLiveApi = true;
      await this.initClient();
      return;
    }
    await this.initSession();
  }

  private async saveApiKey(event: Event) {
    event.preventDefault();
    if (this.connectInFlight) {
      return;
    }

    const validated = validateApiKey(this.keyDraft);
    if (validated.ok === false) {
      this.applyEvent({
        type: 'ERROR',
        kind: 'key',
        message: validated.message,
      });
      this.editingKey = true;
      return;
    }

    this.connectInFlight = true;
    this.apiKey = validated.key;
    this.keyDraft = '';
    this.editingKey = false;
    this.authMode = 'byo';
    this.useAlphaLiveApi = false;
    this.applyEvent({type: 'KEY_SUBMITTED'});
    try {
      await this.initClient();
    } finally {
      this.connectInFlight = false;
    }
  }

  private clearKey() {
    this.stopRecording();
    this.session?.close();
    this.session = undefined;
    this.client = undefined;
    this.apiKey = '';
    this.keyDraft = '';
    this.editingKey = true;
    this.applyEvent({type: 'KEY_CLEARED'});
  }

  private updateKeyDraft(event: Event) {
    this.keyDraft = (event.target as HTMLInputElement).value;
  }

  private exportChat() {
    const blob = new Blob(
      [exportTranscript(this.transcript)],
      {type: 'text/plain'},
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'taskkorb-transcript.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private clearChat() {
    if (!this.transcript.turns.length) {
      return;
    }
    if (!window.confirm('Clear this conversation from this browser?')) {
      return;
    }
    this.undoTranscript = this.transcript;
    this.transcript = EMPTY_TRANSCRIPT;
    clearStoredTranscript();
  }

  private undoClear() {
    if (!this.undoTranscript) {
      return;
    }
    this.transcript = this.undoTranscript;
    this.undoTranscript = null;
    this.persistTranscripts();
  }

  private updatePrefs(patch: Partial<UserPrefs>) {
    const next = {
      ...this.prefs,
      ...patch,
      volume: clampVolume(patch.volume ?? this.prefs.volume),
    };
    this.prefs = next;
    writePrefs(next);
    if (this.outputNode) {
      this.outputNode.gain.value = next.volume;
    }
    track('prefs_changed', {
      voice: next.voice,
      language: next.language,
    });
    if (patch.voice || patch.language) {
      void this.applyLiveSettings();
    }
  }

  private async applyLiveSettings() {
    const phase = this.sessionState.phase;
    if (phase !== 'ready' && !canRetry(phase)) {
      return;
    }
    this.stopRecording('teardown');
    if (this.authMode === 'hosted') {
      const hosted = await fetchHostedCredential();
      if (hosted.mode !== 'hosted') {
        this.applyEvent({
          type: 'ERROR',
          kind: 'connect',
          message: 'Could not refresh the hosted session after changing settings.',
        });
        return;
      }
      this.apiKey = hosted.token;
      this.applyEvent({type: 'CONNECT_STARTED'});
      await this.initClient();
      return;
    }
    this.applyEvent({type: canRetry(phase) ? 'RETRY' : 'CONNECT_STARTED'});
    await this.initSession();
  }

  private onTalkPointerDown(event: PointerEvent) {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    void this.startRecording(event);
  }

  private onTalkPointerUp(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    this.stopRecording();
  }

  private onVoiceInput(event: Event) {
    this.updatePrefs({voice: (event.target as HTMLSelectElement).value as UserPrefs['voice']});
  }

  private onLanguageInput(event: Event) {
    this.updatePrefs({
      language: (event.target as HTMLSelectElement).value as UserPrefs['language'],
    });
  }

  private onVolumeInput(event: Event) {
    this.updatePrefs({volume: Number((event.target as HTMLInputElement).value)});
  }

  private onTalkKeydown(event: KeyboardEvent) {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      void this.startRecording();
    }
  }

  private onTalkKeyup(event: KeyboardEvent) {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      this.stopRecording();
    }
  }

  render() {
    const {phase, status, error} = this.sessionState;
    const listening = phase === 'listening' || phase === 'speaking';
    const hasTurns = this.transcript.turns.length > 0;

    return html`
      <div>
        ${this.showKeyGate
          ? html`
              <form class="key-gate" @submit=${this.saveApiKey}>
                <div class="key-card">
                  <h1>${PRODUCT_NAME}</h1>
                  <p>${PRODUCT_TAGLINE}</p>
                  ${this.authMode === 'unknown'
                    ? html`<p>Opening session…</p>`
                    : html`
                        <p>
                          Paste a Gemini key only for local testing. It stays in
                          this tab’s memory. Prefer a server key so testers never
                          paste one.
                        </p>
                        ${error
                          ? html`<p class="error" role="alert">${error}</p>`
                          : ''}
                        <input
                          type="password"
                          autocomplete="off"
                          maxlength=${MAX_API_KEY_LENGTH}
                          placeholder="Gemini API key"
                          aria-label="Gemini API key"
                          .value=${this.keyDraft}
                          @input=${this.updateKeyDraft} />
                        <button type="submit" ?disabled=${this.connectInFlight}>
                          ${this.connectInFlight ? 'Connecting…' : 'Connect'}
                        </button>
                        ${this.apiKey
                          ? html`<button
                              type="button"
                              @click=${() => {
                                this.editingKey = false;
                              }}>
                              Back
                            </button>`
                          : ''}
                      `}
                </div>
              </form>
            `
          : ''}
        <div class="transcript" aria-live="polite">
          ${hasTurns
            ? this.transcript.turns.map(
                (turn) => html`
                  <p>
                    <strong>${turn.side === 'user' ? 'You' : 'Orb'}</strong>
                    <span class="empty">
                      ${new Date(turn.at).toLocaleTimeString()}</span
                    >
                    ${turn.text}
                  </p>
                `,
              )
            : html`<p class="empty">Hold Talk and speak. Release to pause.</p>`}
          ${this.transcript.clipped
            ? html`<p class="clip-note">Older lines were dropped to keep this device light.</p>`
            : ''}
          ${this.undoTranscript
            ? html`<p>
                <button type="button" class="undo" @click=${this.undoClear}>
                  Undo clear
                </button>
              </p>`
            : ''}
        </div>
        ${this.moreOpen
          ? html`
              <div class="more-sheet" role="dialog" aria-label="More controls">
                <label>
                  Voice
                  <select .value=${this.prefs.voice} @change=${this.onVoiceInput}>
                    ${LIVE_VOICES.map(
                      (voice) => html`<option value=${voice}>${voice}</option>`,
                    )}
                  </select>
                </label>
                <label>
                  Reply language
                  <select .value=${this.prefs.language} @change=${this.onLanguageInput}>
                    ${REPLY_LANGUAGES.map(
                      (language) => html`<option value=${language}>
                        ${language === 'auto'
                          ? 'Match what I speak'
                          : language === 'hi'
                            ? 'Hindi'
                            : 'English'}
                      </option>`,
                    )}
                  </select>
                </label>
                <label>
                  Volume ${Math.round(this.prefs.volume * 100)}%
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    .value=${String(this.prefs.volume)}
                    @input=${this.onVolumeInput} />
                </label>
                <div class="more-actions">
                  <button type="button" @click=${this.clearKey}>
                    ${this.authMode === 'hosted' ? 'Use my key' : 'Change key'}
                  </button>
                  <button
                    type="button"
                    @click=${this.reconnect}
                    ?disabled=${!canRetry(phase)}>
                    Reconnect
                  </button>
                  <button type="button" @click=${this.exportChat} ?disabled=${!hasTurns}>
                    Export
                  </button>
                  <button type="button" @click=${this.clearChat} ?disabled=${!hasTurns}>
                    Clear
                  </button>
                </div>
              </div>
            `
          : ''}
        <div class="controls">
          <button
            type="button"
            data-kind="talk"
            aria-label="Hold to talk"
            aria-pressed=${listening}
            title="Hold to talk"
            @pointerdown=${this.onTalkPointerDown}
            @pointerup=${this.onTalkPointerUp}
            @pointercancel=${this.onTalkPointerUp}
            @keydown=${this.onTalkKeydown}
            @keyup=${this.onTalkKeyup}
            ?disabled=${listening ? false : !canStartListening(phase)}>
            Talk
          </button>
          <button
            type="button"
            aria-expanded=${this.moreOpen}
            aria-label="More controls"
            @click=${() => {
              this.moreOpen = !this.moreOpen;
            }}>
            More
          </button>
        </div>
        <p class="privacy">
          Audio leaves this device only while Talk is held.
          ${this.authMode === 'hosted'
            ? ' This preview uses a short-lived token, not your long-lived key.'
            : ' This is still test-only.'}
        </p>
        <div id="status" role="status" data-kind=${error ? 'error' : 'info'}>
          ${error || status}
        </div>
        <gdm-live-audio-visuals-3d
          .phase=${phase}
          .inputNode=${this.inputNode}
          .outputNode=${this.outputNode}></gdm-live-audio-visuals-3d>
      </div>
    `;
  }
}
