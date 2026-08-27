/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, LiveServerMessage, Modality, Session} from '@google/genai';
import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {MAX_API_KEY_LENGTH, validateApiKey} from './src/auth/api-key';
import {HOSTED_SESSION_TIMEOUT_MS, fetchHostedCredential} from './src/auth/live-session';
import {
  readBillingClaim,
  requestCheckout,
  requestClaim,
  writeBillingClaim,
} from './src/billing/client';
import type {BillingProvider, PlanId} from './src/billing/types';
import {shouldRemint} from './src/auth/token-expiry';
import {isAudible} from './src/audio/level';
import {
  MAX_LISTEN_MS,
  formatListenRemaining,
  remainingListenMs,
} from './src/audio/listen-cap';
import {createBlob, decode, decodeAudioData} from './src/audio/pcm';
import {insecureMicMessage, isSecureAudioContext} from './src/audio/secure-context';
import {applyPlayAndRecordHint, resumeAudioGraph} from './src/audio/unlock';
import {
  applySpeakPlan,
  planTypedSpeak,
  shouldSpeakOrbText,
  speechLang,
  type SynthesisLike,
} from './src/audio/typed-tts';
import {classifyLiveFailure} from './src/errors/classify';
import {humanizeError} from './src/errors/humanize';
import {
  deniedMicInstructions,
  isAppleTouchDevice,
  isEmbeddedBrowser,
  mobileKind,
  shouldReleaseMicrophoneOnHidden,
} from './src/platform/runtime';
import {
  INPUT_SAMPLE_RATE,
  LIVE_MODEL,
  LIVE_MODEL_FALLBACK,
  OUTPUT_SAMPLE_RATE,
  buildSystemInstruction,
} from './src/product/identity';
import {copy, localizeStatus, talkHint, uiLanguage} from './src/product/copy';
import {
  DEFAULT_PREFS,
  LIVE_VOICES,
  REPLY_LANGUAGES,
  TALK_MODES,
  TalkMode,
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
import {
  nextBackoffMs,
  nextResumptionHandle,
  reconnectGaveUp,
  shouldAutoReconnect,
} from './src/session/reconnect';
import {modelsToTry} from './src/live/models';
import {track} from './src/telemetry/events';
import {isSheetDismissKey, pathDismissesMore} from './src/ui/dismiss';
import {demoTranscript, nextDemoExchange} from './src/demo/content';
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
  @state() hostedAvailable = false;
  @state() listenNow = 0;
  @state() typedDraft = '';
  @state() payEmail = '';
  @state() payPlan: PlanId = 'monthly_hosted';
  @state() paying = false;
  @state() payError = '';
  @state() gateDismissed = false;
  @state() demoMode = false;
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
  private listenTick = 0;
  private reconnectTimer = 0;
  private prefsTimer = 0;
  private reconnectAttempts = 0;
  private reconnectArmed = false;
  private userClosed = false;
  private resumptionHandle?: string;
  private hostedExpireTime?: string;
  private lastFocusedReady = false;
  private useAlphaLiveApi = false;
  private playbackChain: Promise<void> = Promise.resolve();
  private demoExchangeIndex = 0;

  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: system-ui, sans-serif;
    }

    main {
      position: absolute;
      inset: 0;
    }

    #status {
      position: absolute;
      bottom: calc(5vh + env(safe-area-inset-bottom, 0px));
      left: 16px;
      right: 16px;
      z-index: 10;
      text-align: center;
      color: rgba(255, 255, 255, 0.86);
      font-size: 14px;
      line-height: 1.4;
      pointer-events: none;
    }

    #status[data-kind='error'] {
      color: #ffb4b4;
    }

    .transcript {
      position: absolute;
      top: calc(12px + env(safe-area-inset-top, 0px));
      left: 16px;
      right: 16px;
      z-index: 10;
      max-width: 520px;
      max-height: 16vh;
      overflow: auto;
      margin: 0 auto;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      line-height: 1.4;
      text-align: center;
      pointer-events: auto;
    }

    .transcript p {
      margin: 0 0 6px;
    }

    .controls {
      z-index: 10;
      position: absolute;
      bottom: calc(10vh + env(safe-area-inset-bottom, 0px));
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 10px;
    }

    button {
      outline: none;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      border-radius: 12px;
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

    button[data-kind='talk'],
    button[data-kind='more'] {
      width: 64px;
      height: 64px;
      min-width: 64px;
      min-height: 64px;
      padding: 0;
      margin: 0;
      border-radius: 12px;
      font-size: 0;
    }

    button[data-kind='talk'] {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    button[data-kind='talk'][aria-pressed='true'] {
      background: rgba(255, 255, 255, 0.2);
    }

    button[data-kind='talk'] .talk-time {
      display: none;
    }

    .more-sheet {
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: calc(10vh + 150px + env(safe-area-inset-bottom, 0px));
      z-index: 12;
      max-height: min(52vh, 420px);
      overflow: auto;
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
      display: none;
    }

    .key-gate {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      background: rgba(8, 6, 12, 0.28);
      padding: 16px 16px calc(10vh + env(safe-area-inset-bottom, 0px));
      pointer-events: none;
    }

    .key-gate ~ .transcript {
      visibility: hidden;
    }

    .key-card {
      position: relative;
      pointer-events: auto;
      width: min(420px, 100%);
      max-height: min(58vh, 520px);
      overflow-y: auto;
      color: white;
      text-align: center;
      background: rgba(16, 12, 20, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 20px;
      padding: 20px 16px 16px;
    }

    .gate-lede {
      display: none;
    }

    @media (min-width: 800px) {
      .key-gate {
        align-items: center;
        padding: 24px;
      }

      .key-card {
        max-height: min(70vh, 560px);
      }

      .gate-lede {
        display: block;
      }
    }

    .key-card .gate-close {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 44px;
      height: 44px;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 26px;
      line-height: 1;
      font-weight: 400;
    }

    .key-card button.secondary {
      background: transparent;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.28);
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

    .key-card a {
      color: #d8d2e8;
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

    .composer {
      z-index: 11;
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: calc(10vh + 150px + env(safe-area-inset-bottom, 0px));
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 8px;
      max-width: 420px;
      margin: 0 auto;
    }

    .composer[data-with-talk='false'] {
      display: none;
    }

    .composer input {
      flex: 1 1 180px;
      min-height: 48px;
      box-sizing: border-box;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      background: rgba(0, 0, 0, 0.35);
      color: white;
      padding: 0 14px;
      font: inherit;
    }

    .composer input:focus-visible,
    .composer button:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }

    .composer button {
      min-width: 88px;
    }

    .composer-hint {
      display: none;
      flex: 1 0 100%;
      margin: 0;
      color: rgba(255, 255, 255, 0.55);
      font-size: 12px;
      text-align: center;
    }

    @media (min-width: 800px) {
      .composer-hint {
        display: block;
      }
    }

    .pay-rail {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.16);
      text-align: left;
    }

    .pay-rail h2 {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
    }

    .pay-rail p {
      margin: 0 0 12px;
      color: #d8d2e8;
      font-size: 14px;
      line-height: 1.4;
    }

    .pay-rail select {
      width: 100%;
      margin-bottom: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.28);
      color: white;
      padding: 12px 14px;
      font-size: 16px;
    }

    .pay-actions {
      display: flex;
      gap: 8px;
    }

    .pay-actions button {
      margin-top: 0;
      flex: 1;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.transcript = readStoredTranscript();
    this.prefs = readPrefs(
      localStorage,
      mobileKind(navigator.userAgent, navigator.maxTouchPoints),
    );
    window.addEventListener('keydown', this.onWindowKey);
    window.addEventListener('pointerdown', this.onWindowPointer);
    document.addEventListener('visibilitychange', this.onDocumentVisibility);
    void this.startAuth();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopRecording();
    this.cancelTypedSpeech();
    this.session?.close();
    window.clearTimeout(this.listenCapTimer);
    window.clearInterval(this.listenTick);
    window.clearTimeout(this.reconnectTimer);
    window.clearTimeout(this.prefsTimer);
    window.removeEventListener('keydown', this.onWindowKey);
    window.removeEventListener('pointerdown', this.onWindowPointer);
    document.removeEventListener('visibilitychange', this.onDocumentVisibility);
  }

  protected updated() {
    const canFocusTalk =
      this.sessionState.phase === 'ready' && !this.showKeyGate && !this.moreOpen;
    const root = this.renderRoot;
    const active = 'activeElement' in root ? root.activeElement : null;
    const typing = active instanceof HTMLInputElement && active.closest('.composer');
    if (canFocusTalk && !this.lastFocusedReady && !typing) {
      this.lastFocusedReady = true;
      const talk = this.renderRoot.querySelector<HTMLButtonElement>('[data-kind="talk"]');
      talk?.focus();
    }
    if (this.sessionState.phase !== 'ready') {
      this.lastFocusedReady = false;
    }
    document.documentElement.lang = uiLanguage(this.prefs, navigator.language);
  }

  private get showKeyGate(): boolean {
    if (this.gateDismissed && !this.editingKey) {
      return false;
    }
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

  private dismissGate() {
    this.gateDismissed = true;
    this.editingKey = false;
    this.moreOpen = false;
    const live = Boolean(this.session || (this.apiKey && this.authMode === 'hosted'));
    this.demoMode = !live;
    if (!this.demoMode) {
      return;
    }
    this.applyEvent({type: 'DEMO_OPENED'});
    if (this.transcript.turns.length === 0) {
      this.transcript = demoTranscript(
        Date.now(),
        uiLanguage(this.prefs, navigator.language),
      );
      this.persistTranscripts();
    }
    track('demo_opened');
  }

  private reopenGate() {
    this.gateDismissed = false;
    this.editingKey = true;
    this.moreOpen = false;
  }

  private playDemoExchange() {
    const lang = uiLanguage(this.prefs, navigator.language);
    const pair = nextDemoExchange(this.demoExchangeIndex, lang);
    this.demoExchangeIndex += 1;
    this.applyEvent({type: 'LISTEN_START_REQUESTED'});
    this.applyEvent({type: 'LISTEN_STARTED'});
    this.transcript = appendTurn(this.transcript, 'user', pair.user, Date.now());
    this.transcript = appendTurn(this.transcript, 'orb', pair.orb, Date.now() + 1);
    this.persistTranscripts();
    this.applyEvent({type: 'AUDIO_OUT'});
    this.speakPrepared(pair.orb, 'orb');
    window.setTimeout(() => {
      if (this.demoMode && this.sessionState.phase === 'speaking') {
        this.applyEvent({type: 'SPEAKING_DONE'});
      }
    }, 1400);
  }

  private billingClaim(): string {
    return readBillingClaim(typeof localStorage === 'undefined' ? null : localStorage);
  }

  private requestHosted() {
    return fetchHostedCredential(
      fetch,
      (ms) =>
        new Promise((resolve) => {
          setTimeout(resolve, ms);
        }),
      HOSTED_SESSION_TIMEOUT_MS,
      this.billingClaim(),
    );
  }

  private async finishBillingReturn() {
    if (typeof window === 'undefined') {
      return;
    }
    const paid = new URLSearchParams(window.location.search).get('billing') === 'ok';
    const claim = this.billingClaim();
    if (!paid || !claim) {
      return;
    }
    const claimed = await requestClaim(claim);
    if (!claimed.entitled) {
      return;
    }
    this.payError = '';
    const hosted = await this.requestHosted();
    if (hosted.mode === 'hosted') {
      await this.applyHostedToken(hosted.token, hosted.expireTime);
    }
  }

  private async onPay(provider: BillingProvider) {
    this.paying = true;
    this.payError = '';
    try {
      const started = await requestCheckout({
        provider,
        planId: this.payPlan,
        email: this.payEmail,
      });
      if (started.ok === false) {
        this.payError = started.error;
        return;
      }
      writeBillingClaim(localStorage, started.claimToken);
      track('billing_checkout', {provider, plan: this.payPlan});
      window.location.assign(started.checkoutUrl);
    } catch {
      this.payError = 'Could not start checkout.';
    } finally {
      this.paying = false;
    }
  }

  private async startAuth() {
    await this.finishBillingReturn();
    if (this.authMode === 'hosted') {
      return;
    }
    await this.bootstrapAuth();
  }

  private async bootstrapAuth() {
    const hosted = await this.requestHosted();
    if (this.demoMode || this.gateDismissed) {
      if (hosted.mode === 'hosted') {
        this.hostedAvailable = true;
      }
      if (this.authMode === 'unknown') {
        this.authMode = 'byo';
      }
      return;
    }
    if (hosted.mode === 'hosted') {
      this.hostedAvailable = true;
      await this.applyHostedToken(hosted.token, hosted.expireTime);
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

  private synthesis(): SynthesisLike | undefined {
    const synth = window.speechSynthesis;
    return synth ? (synth as unknown as SynthesisLike) : undefined;
  }

  private cancelTypedSpeech() {
    const synth = this.synthesis();
    if (synth && (synth.speaking || synth.pending)) {
      synth.cancel();
    }
  }

  private speakPrepared(text: string, side: 'user' | 'orb') {
    const synth = this.synthesis();
    const plan = planTypedSpeak({
      text,
      lang: speechLang(this.prefs.language, navigator.language),
      volume: this.prefs.volume,
      voices: synth?.getVoices() ?? [],
    });
    if (plan.action === 'skip') {
      return;
    }
    if (synth) {
      applySpeakPlan(synth, plan);
    }
    track('typed_spoke', {side});
  }

  private onTypedDraftInput(event: Event) {
    this.typedDraft = (event.target as HTMLInputElement).value;
  }

  private onTypedSubmit(event: Event) {
    event.preventDefault();
    const plan = planTypedSpeak({
      text: this.typedDraft,
      lang: speechLang(this.prefs.language, navigator.language),
      volume: this.prefs.volume,
      voices: this.synthesis()?.getVoices() ?? [],
    });
    if (plan.action === 'skip') {
      return;
    }
    this.transcript = appendTurn(this.transcript, 'user', plan.text);
    this.persistTranscripts();
    this.typedDraft = '';
    this.speakPrepared(plan.text, 'user');
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

    const models = modelsToTry(
      this.authMode === 'hosted',
      LIVE_MODEL,
      LIVE_MODEL_FALLBACK,
    );
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
              this.reconnectAttempts = 0;
              this.reconnectArmed = false;
              this.userClosed = false;
              this.applyEvent({type: 'OPENED'});
              track('session_opened', {resumed: Boolean(this.resumptionHandle)});
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
              const raw = e.message || 'Live session error';
              const kind = classifyLiveFailure(raw, this.authMode);
              this.applyEvent({
                type: 'ERROR',
                kind,
                message: humanizeError(kind, raw),
              });
              if (kind === 'key') {
                this.editingKey = true;
              }
              track('session_error', {reason: 'callback'});
            },
            onclose: (e: CloseEvent) => {
              if (generation !== this.connectGeneration) {
                return;
              }
              const closeKind = classifyLiveFailure(e.reason || '', this.authMode);
              if (this.sessionState.errorKind === 'key' || closeKind === 'key') {
                if (this.sessionState.errorKind !== 'key') {
                  this.applyEvent({
                    type: 'ERROR',
                    kind: 'key',
                    message: humanizeError('key', e.reason || 'That Gemini key was rejected.'),
                  });
                }
                if (this.authMode !== 'hosted') {
                  this.editingKey = true;
                }
                track('session_closed', {
                  reason: e.reason ? 'remote' : 'empty',
                  autoRetry: false,
                });
                return;
              }
              const autoRetry = shouldAutoReconnect({
                userClosed: this.userClosed,
                attempt: this.reconnectAttempts,
                errorKind: this.sessionState.errorKind,
              });
              this.applyEvent({type: 'CLOSED', reason: e.reason, autoRetry});
              track('session_closed', {
                reason: e.reason ? 'remote' : 'empty',
                autoRetry,
              });
              if (autoRetry) {
                this.armAutoReconnect();
              }
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
            sessionResumption: this.resumptionHandle
              ? {handle: this.resumptionHandle}
              : {},
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
    const kind = this.authMode === 'hosted' ? 'connect' : 'key';
    this.applyEvent({
      type: 'ERROR',
      kind,
      message: humanizeError(kind, raw),
    });
    if (this.authMode !== 'hosted') {
      this.editingKey = true;
    }
    track('session_error', {reason: 'connect'});
  }

  private async handleLiveMessage(message: LiveServerMessage) {
    if (message.goAway) {
      track('session_go_away');
    }

    if (message.sessionResumptionUpdate) {
      this.resumptionHandle = nextResumptionHandle(
        this.resumptionHandle,
        message.sessionResumptionUpdate,
      );
    }

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

    if (message.serverContent?.turnComplete) {
      const last = this.transcript.turns[this.transcript.turns.length - 1];
      if (
        last?.side === 'orb' &&
        shouldSpeakOrbText({liveAudioPlaying: this.sources.size > 0})
      ) {
        this.speakPrepared(last.text, 'orb');
      }
    }

    const parts = message.serverContent?.modelTurn?.parts ?? [];
    for (const part of parts) {
      const audio = part.inlineData?.data;
      if (!audio) {
        continue;
      }
      this.enqueuePlayback(audio);
    }

    if (message.serverContent?.interrupted) {
      for (const source of this.sources.values()) {
        source.stop();
        this.sources.delete(source);
      }
      this.nextStartTime = 0;
      this.applyEvent({type: 'INTERRUPTED', holding: Boolean(this.mediaStream)});
      track('speech_interrupted');
    }
  }

  private enqueuePlayback(audio: string) {
    this.playbackChain = this.playbackChain
      .then(() => this.playDecoded(audio))
      .catch(() => undefined);
  }

  private async playDecoded(audio: string) {
    if (!this.outputAudioContext || !this.outputNode) {
      return;
    }
    await resumeAudioGraph([this.inputAudioContext, this.outputAudioContext]);
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
      if (this.sources.size === 0) {
        this.applyEvent({
          type: 'SPEAKING_DONE',
          holding: Boolean(this.mediaStream),
        });
      }
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
    if (this.demoMode && !this.session) {
      event?.preventDefault();
      this.playDemoExchange();
      return;
    }
    if (this.listenInFlight || !canStartListening(this.sessionState.phase)) {
      return;
    }
    if (!isSecureAudioContext(window)) {
      this.applyEvent({
        type: 'ERROR',
        kind: 'mic',
        message: insecureMicMessage(),
      });
      return;
    }

    this.listenInFlight = true;
    this.listenCancelRequested = false;
    this.cancelTypedSpeech();
    this.applyEvent({type: 'LISTEN_START_REQUESTED'});
    this.ensureAudio();
    applyPlayAndRecordHint(navigator);
    await resumeAudioGraph([this.inputAudioContext, this.outputAudioContext]);
    this.nextStartTime = this.outputAudioContext?.currentTime ?? 0;
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
      this.listenNow = this.listenStartedAt;
      this.applyEvent({type: 'LISTEN_STARTED'});
      track('listen_started');
      window.clearTimeout(this.listenCapTimer);
      window.clearInterval(this.listenTick);
      this.listenCapTimer = window.setTimeout(() => {
        this.stopRecording('cap');
      }, MAX_LISTEN_MS);
      this.listenTick = window.setInterval(() => {
        this.listenNow = Date.now();
      }, 250);
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Microphone access failed.';
      track('mic_denied');
      const denied =
        /notallowed|permission|denied/i.test(raw) ||
        (error instanceof DOMException && error.name === 'NotAllowedError');
      this.applyEvent({
        type: 'ERROR',
        kind: 'mic',
        message: denied
          ? deniedMicInstructions(
              mobileKind(navigator.userAgent, navigator.maxTouchPoints),
            )
          : humanizeError('mic', raw),
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
    window.clearInterval(this.listenTick);
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

  private armAutoReconnect() {
    if (this.reconnectArmed || this.userClosed) {
      return;
    }
    const policy = {
      userClosed: this.userClosed,
      attempt: this.reconnectAttempts,
      errorKind: this.sessionState.errorKind,
    };
    if (!shouldAutoReconnect(policy)) {
      if (reconnectGaveUp(policy)) {
        track('session_reconnect_gave_up', {attempt: this.reconnectAttempts});
      }
      return;
    }

    this.reconnectArmed = true;
    const attempt = this.reconnectAttempts;
    this.reconnectAttempts += 1;
    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => {
      this.applyEvent({type: 'RECONNECT_SCHEDULED', attempt});
      track('session_reconnecting', {attempt});
      void this.reconnect();
    }, nextBackoffMs(attempt));
  }

  private onDocumentVisibility = () => {
    if (document.hidden && shouldReleaseMicrophoneOnHidden()) {
      this.stopRecording('teardown');
    }
  };

  private onWindowKey = (event: KeyboardEvent) => {
    if (this.moreOpen && isSheetDismissKey(event.key)) {
      this.moreOpen = false;
      this.lastFocusedReady = false;
    }
  };

  private onWindowPointer = (event: PointerEvent) => {
    if (!this.moreOpen) {
      return;
    }
    const path = event.composedPath().map((node) => {
      if (!(node instanceof Element)) {
        return {};
      }
      return {
        classList: {contains: (name: string) => node.classList.contains(name)},
        getAttribute: (name: string) => node.getAttribute(name),
      };
    });
    if (pathDismissesMore(path)) {
      this.moreOpen = false;
      this.lastFocusedReady = false;
    }
  };

  private async reconnect() {
    window.clearTimeout(this.reconnectTimer);
    this.reconnectArmed = true;
    this.stopRecording();
    this.editingKey = false;
    this.applyEvent({type: 'RETRY'});
    if (this.authMode === 'hosted') {
      const reuseToken =
        Boolean(this.apiKey) &&
        Boolean(this.resumptionHandle) &&
        !shouldRemint(this.hostedExpireTime, Date.now());
      if (!reuseToken) {
        const hosted = await this.requestHosted();
        if (hosted.mode !== 'hosted') {
          this.reconnectArmed = false;
          this.applyEvent({
            type: 'ERROR',
            kind: 'connect',
            message:
              hosted.mode === 'error'
                ? humanizeError('connect', hosted.message)
                : 'Hosted session expired. Reconnect or paste a Gemini key.',
          });
          return;
        }
        this.apiKey = hosted.token;
        this.hostedExpireTime = hosted.expireTime;
        this.useAlphaLiveApi = true;
      }
      await this.initClient();
      return;
    }
    await this.initSession();
  }

  private async applyHostedToken(token: string, expireTime?: string) {
    this.demoMode = false;
    this.authMode = 'hosted';
    this.hostedAvailable = true;
    this.apiKey = token;
    this.hostedExpireTime = expireTime;
    this.editingKey = false;
    this.useAlphaLiveApi = true;
    this.applyEvent({type: 'KEY_SUBMITTED'});
    await this.initClient();
  }

  private async useHostedSession() {
    const hosted = await this.requestHosted();
    if (hosted.mode !== 'hosted') {
      this.applyEvent({
        type: 'ERROR',
        kind: 'connect',
        message:
          hosted.mode === 'error'
            ? humanizeError('connect', hosted.message)
            : 'Hosted session is unavailable. Paste a Gemini key to test locally.',
      });
      return;
    }
    this.resumptionHandle = undefined;
    await this.applyHostedToken(hosted.token, hosted.expireTime);
  }

  private async saveApiKey(event: Event) {
    event.preventDefault();
    if (this.connectInFlight) {
      return;
    }

    this.demoMode = false;
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
    this.userClosed = true;
    this.resumptionHandle = undefined;
    this.hostedExpireTime = undefined;
    this.reconnectAttempts = 0;
    this.reconnectArmed = false;
    window.clearTimeout(this.reconnectTimer);
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
    const lang = uiLanguage(this.prefs, navigator.language);
    if (!window.confirm(copy(lang).confirmClear)) {
      return;
    }
    this.undoTranscript = this.transcript;
    this.transcript = EMPTY_TRANSCRIPT;
    this.cancelTypedSpeech();
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
      window.clearTimeout(this.prefsTimer);
      this.prefsTimer = window.setTimeout(() => {
        this.resumptionHandle = undefined;
        void this.applyLiveSettings();
      }, 400);
    }
  }

  private async applyLiveSettings() {
    const phase = this.sessionState.phase;
    if (phase === 'listening' || phase === 'speaking') {
      this.stopRecording('teardown');
    }
    const nextPhase = this.sessionState.phase;
    if (nextPhase !== 'ready' && !canRetry(nextPhase)) {
      return;
    }
    this.stopRecording('teardown');
    if (this.authMode === 'hosted') {
      const hosted = await this.requestHosted();
      if (hosted.mode !== 'hosted') {
        this.applyEvent({
          type: 'ERROR',
          kind: 'connect',
          message: humanizeError(
            'connect',
            hosted.mode === 'error'
              ? hosted.message
              : 'Could not refresh the hosted session after changing settings.',
          ),
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

  private toggleTalk(event?: Event) {
    const listening =
      this.sessionState.phase === 'listening' || this.sessionState.phase === 'speaking';
    if (listening) {
      this.stopRecording();
      return;
    }
    void this.startRecording(event);
  }

  private onTalkPointerDown(event: PointerEvent) {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    if (this.prefs.talkMode === 'tap') {
      this.toggleTalk(event);
      return;
    }
    void this.startRecording(event);
  }

  private onTalkPointerUp(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    if (this.prefs.talkMode === 'tap') {
      return;
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

  private onTalkModeInput(event: Event) {
    this.updatePrefs({
      talkMode: (event.target as HTMLSelectElement).value as TalkMode,
    });
  }

  private onReduceMotionInput(event: Event) {
    this.updatePrefs({
      reduceMotion: (event.target as HTMLInputElement).checked,
    });
  }

  private onTalkKeydown(event: KeyboardEvent) {
    if (event.code !== 'Space' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    if (event.repeat) {
      return;
    }
    if (this.prefs.talkMode === 'tap') {
      this.toggleTalk();
      return;
    }
    void this.startRecording();
  }

  private onTalkKeyup(event: KeyboardEvent) {
    if (event.code !== 'Space' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    if (this.prefs.talkMode === 'tap') {
      return;
    }
    this.stopRecording();
  }

  render() {
    const {phase, status, error} = this.sessionState;
    const listening = phase === 'listening' || phase === 'speaking';
    const hasTurns = this.transcript.turns.length > 0;
    const remaining = formatListenRemaining(
      remainingListenMs(this.listenStartedAt, this.listenNow || Date.now()),
    );
    const insecure = !isSecureAudioContext(window);
    const embedded = isEmbeddedBrowser(navigator.userAgent);
    const appleTouch = isAppleTouchDevice(
      navigator.userAgent,
      navigator.maxTouchPoints,
    );
    const talkDisabled = listening
      ? false
      : insecure || (!this.demoMode && !canStartListening(phase));
    const lang = uiLanguage(this.prefs, navigator.language);
    const strings = copy(lang);
    const keyReady = validateApiKey(this.keyDraft).ok;
    const talkLabel =
      this.prefs.talkMode === 'tap' ? strings.tapMode : strings.holdMode;
    const shownStatus = localizeStatus(
      error || (insecure ? insecureMicMessage() : status),
      lang,
      this.prefs.talkMode,
    );

    return html`
      <main>
        ${this.showKeyGate
          ? html`
              <form class="key-gate" @submit=${this.saveApiKey}>
                <div class="key-card">
                  <button
                    type="button"
                    class="gate-close"
                    data-kind="gate-close"
                    aria-label=${strings.closeGate}
                    @click=${() => this.dismissGate()}>
                    ×
                  </button>
                  <h1>${strings.name}</h1>
                  <p>${strings.tagline}</p>
                  ${this.authMode === 'unknown'
                    ? html`<p>${strings.opening}</p>`
                    : ''}
                  <p class="gate-lede">${strings.pasteKey}</p>
                  <p>
                    <a
                      href=${strings.getKeyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      >${strings.getKey}</a
                    >
                  </p>
                  ${error
                    ? html`<p class="error" role="alert">${shownStatus}</p>`
                    : ''}
                  <input
                    type="password"
                    autocomplete="off"
                    maxlength=${MAX_API_KEY_LENGTH}
                    placeholder=${strings.keyLabel}
                    aria-label=${strings.keyLabel}
                    aria-invalid=${!this.keyDraft || keyReady ? 'false' : 'true'}
                    .value=${this.keyDraft}
                    @input=${this.updateKeyDraft} />
                  <button
                    type="submit"
                    ?disabled=${this.connectInFlight || !keyReady}>
                    ${this.connectInFlight ? strings.connecting : strings.connect}
                  </button>
                  ${this.apiKey
                    ? html`<button
                        type="button"
                        @click=${() => {
                          this.editingKey = false;
                        }}>
                        ${strings.back}
                      </button>`
                    : ''}
                  <button
                    type="button"
                    class="secondary"
                    data-kind="skip-demo"
                    @click=${() => this.dismissGate()}>
                    ${strings.skipDemo}
                  </button>
                  <div class="pay-rail">
                    <h2>${strings.payTitle}</h2>
                    <p>${strings.payHint}</p>
                    <input
                      type="email"
                      autocomplete="email"
                      placeholder=${strings.payEmail}
                      aria-label=${strings.payEmail}
                      .value=${this.payEmail}
                      @input=${(event: Event) => {
                        this.payEmail = (event.target as HTMLInputElement).value;
                      }} />
                    <select
                      aria-label=${strings.payMonthly}
                      .value=${this.payPlan}
                      @change=${(event: Event) => {
                        this.payPlan = (event.target as HTMLSelectElement)
                          .value as PlanId;
                      }}>
                      <option value="monthly_hosted">${strings.payMonthly}</option>
                      <option value="credit_pack">${strings.payCredits}</option>
                    </select>
                    ${this.payError
                      ? html`<p class="error" role="alert">${this.payError}</p>`
                      : ''}
                    <div class="pay-actions">
                      <button
                        type="button"
                        ?disabled=${this.paying}
                        @click=${() => this.onPay('paypal')}>
                        ${this.paying ? strings.paying : strings.payPaypal}
                      </button>
                      <button
                        type="button"
                        ?disabled=${this.paying}
                        @click=${() => this.onPay('phonepe')}>
                        ${this.paying ? strings.paying : strings.payPhonepe}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            `
          : ''}
        <section class="transcript" aria-label="Conversation" aria-live="polite">
          ${hasTurns
            ? this.transcript.turns.map(
                (turn) => html`
                  <p>
                    <strong>${turn.side === 'user' ? strings.you : strings.orb}</strong>
                    <span class="empty">
                      ${new Date(turn.at).toLocaleTimeString()}</span
                    >
                    ${turn.text}
                  </p>
                `,
              )
            : html`<p class="empty">${talkHint(this.prefs.talkMode, lang)}</p>`}
          ${this.transcript.clipped
            ? html`<p class="clip-note">${strings.clipped}</p>`
            : ''}
          ${this.undoTranscript
            ? html`<p>
                <button type="button" class="undo" @click=${this.undoClear}>
                  ${strings.undoClear}
                </button>
              </p>`
            : ''}
        </section>
        ${this.moreOpen
          ? html`
              <div
                class="more-sheet"
                role="dialog"
                aria-modal="true"
                aria-label=${strings.more}>
                <label>
                  ${strings.voice}
                  <select .value=${this.prefs.voice} @change=${this.onVoiceInput}>
                    ${LIVE_VOICES.map(
                      (voice) => html`<option value=${voice}>${voice}</option>`,
                    )}
                  </select>
                </label>
                <label>
                  ${strings.replyLanguage}
                  <select .value=${this.prefs.language} @change=${this.onLanguageInput}>
                    ${REPLY_LANGUAGES.map(
                      (language) => html`<option value=${language}>
                        ${language === 'auto'
                          ? strings.matchSpeech
                          : language === 'hi'
                            ? strings.hindi
                            : strings.english}
                      </option>`,
                    )}
                  </select>
                </label>
                <label>
                  ${strings.talkMode}
                  <select .value=${this.prefs.talkMode} @change=${this.onTalkModeInput}>
                    ${TALK_MODES.map(
                      (mode) => html`<option value=${mode}>
                        ${mode === 'tap' ? strings.tapMode : strings.holdMode}
                      </option>`,
                    )}
                  </select>
                </label>
                <label>
                  ${strings.volume} ${Math.round(this.prefs.volume * 100)}%
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    .value=${String(this.prefs.volume)}
                    @input=${this.onVolumeInput} />
                </label>
                <label>
                  <input
                    type="checkbox"
                    .checked=${this.prefs.reduceMotion}
                    @change=${this.onReduceMotionInput} />
                  ${strings.reduceMotion}
                </label>
                <p class="empty">${strings.privacyTitle}: ${strings.privacy}</p>
                <div class="more-actions">
                  <button type="button" data-kind="show-pay" @click=${() => this.reopenGate()}>
                    ${strings.showPay}
                  </button>
                  <button type="button" @click=${this.clearKey}>
                    ${this.authMode === 'hosted' ? strings.useMyKey : strings.changeKey}
                  </button>
                  ${this.authMode === 'byo' && this.hostedAvailable
                    ? html`<button type="button" @click=${this.useHostedSession}>
                        ${strings.useHosted}
                      </button>`
                    : ''}
                  <button
                    type="button"
                    @click=${this.reconnect}
                    ?disabled=${!canRetry(phase)}>
                    ${strings.reconnect}
                  </button>
                  <button type="button" @click=${this.exportChat} ?disabled=${!hasTurns}>
                    ${strings.export}
                  </button>
                  <button type="button" @click=${this.clearChat} ?disabled=${!hasTurns}>
                    ${strings.clear}
                  </button>
                </div>
              </div>
            `
          : ''}
        ${this.showKeyGate
          ? ''
          : html`
        <form
          class="composer"
          data-with-talk="true"
          @submit=${this.onTypedSubmit}>
          <input
            type="text"
            autocomplete="off"
            enterkeyhint="send"
            maxlength="500"
            placeholder=${strings.typeNote}
            aria-label=${strings.typeNote}
            .value=${this.typedDraft}
            @input=${this.onTypedDraftInput} />
          <button type="submit" ?disabled=${!this.typedDraft.trim()}>
            ${strings.speak}
          </button>
          <p class="composer-hint">${this.demoMode ? strings.demoHint : strings.typedHint}</p>
        </form>
            `}
        ${this.showKeyGate
          ? ''
          : html`
              <div class="controls" role="toolbar" aria-label=${strings.talk}>
                <button
                  type="button"
                  data-kind="more"
                  aria-expanded=${this.moreOpen}
                  aria-label=${strings.more}
                  @click=${() => {
                    this.moreOpen = !this.moreOpen;
                    if (!this.moreOpen) {
                      this.lastFocusedReady = false;
                    }
                  }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="40px"
                    viewBox="0 -960 960 960"
                    width="40px"
                    fill="#ffffff">
                    <path
                      d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  data-kind="talk"
                  aria-label=${listening
                    ? `${strings.talk}, ${remaining}`
                    : `${talkLabel} ${strings.talk}`}
                  aria-pressed=${listening}
                  title=${insecure ? insecureMicMessage() : `${talkLabel} ${strings.talk}`}
                  @pointerdown=${this.onTalkPointerDown}
                  @pointerup=${this.onTalkPointerUp}
                  @pointercancel=${this.onTalkPointerUp}
                  @keydown=${this.onTalkKeydown}
                  @keyup=${this.onTalkKeyup}
                  ?disabled=${talkDisabled}>
                  ${listening
                    ? html`<svg
                        viewBox="0 0 100 100"
                        width="32px"
                        height="32px"
                        fill="#000000"
                        xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="100" height="100" rx="15" />
                      </svg>`
                    : html`<svg
                        viewBox="0 0 100 100"
                        width="32px"
                        height="32px"
                        fill="#c80000"
                        xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" />
                      </svg>`}
                </button>
              </div>
            `}
        <p class="privacy">
          ${insecure
            ? insecureMicMessage()
            : html`${embedded ? `${strings.embeddedBrowser} ` : ''}${strings.privacy}
                ${appleTouch ? ` ${strings.silentIos}` : ''}`}
        </p>
        <div id="status" role="status" data-kind=${error || insecure ? 'error' : 'info'}>
          ${shownStatus}
        </div>
        <gdm-live-audio-visuals-3d
          .phase=${phase}
          .reducedMotion=${this.prefs.reduceMotion}
          .inputNode=${this.inputNode}
          .outputNode=${this.outputNode}></gdm-live-audio-visuals-3d>
      </main>
    `;
  }
}
