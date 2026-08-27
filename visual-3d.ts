/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// tslint:disable:organize-imports
// tslint:disable:ban-malformed-import-paths
// tslint:disable:no-new-decorators

import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Analyser} from './analyser';

import * as THREE from 'three';
import {fs as backdropFS, vs as backdropVS} from './backdrop-shader';
import {vs as sphereVS} from './sphere-shader';
import {preserveWebGlContext} from './src/platform/runtime';
import type {SessionPhase} from './src/session/machine';
import type {OrbEnhance} from './src/visual/orb-enhance';

/**
 * 3D live audio visual — GitHub Audio Orb bowl.
 * Core mesh draws immediately. Bloom/EXR attach after first frame.
 */
@customElement('gdm-live-audio-visuals-3d')
export class GdmLiveAudioVisuals3D extends LitElement {
  private inputAnalyser?: Analyser;
  private outputAnalyser?: Analyser;
  private camera!: THREE.PerspectiveCamera;
  private backdrop?: THREE.Mesh;
  private scene?: THREE.Scene;
  private enhance?: OrbEnhance;
  private renderer?: THREE.WebGLRenderer;
  private sphere?: THREE.Mesh;
  private sphereMaterial?: THREE.MeshStandardMaterial;
  private prevTime = 0;
  private rotation = new THREE.Vector3(0, 0, 0);

  @property() phase: SessionPhase = 'locked';
  @property({type: Boolean}) reducedMotion = false;
  @property({type: Boolean}) private webglReady = false;

  private _outputNode?: AudioNode;

  @property()
  set outputNode(node: AudioNode | undefined) {
    this._outputNode = node;
    if (node) {
      this.outputAnalyser = new Analyser(node);
    }
  }

  get outputNode() {
    return this._outputNode;
  }

  private _inputNode?: AudioNode;

  @property()
  set inputNode(node: AudioNode | undefined) {
    this._inputNode = node;
    if (node) {
      this.inputAnalyser = new Analyser(node);
    }
  }

  get inputNode() {
    return this._inputNode;
  }

  private canvas!: HTMLCanvasElement;
  private frame = 0;
  private reduceMotion = false;
  private onWindowResize?: () => void;
  private onVisibility?: () => void;
  private onContextLost?: (event: Event) => void;
  private onContextRestored?: () => void;

  static styles = css`
    :host {
      display: block;
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
      position: absolute;
      inset: 0;
      image-rendering: pixelated;
    }

    canvas[data-ready='false'] {
      opacity: 0;
    }

    .orb-fallback {
      position: absolute;
      left: 50%;
      top: 42%;
      width: min(58vw, 280px);
      height: min(58vw, 280px);
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background:
        radial-gradient(circle at 32% 28%, #8b8ba8 0%, #2a2a40 42%, #0a0a12 72%);
      box-shadow: 0 0 90px 20px rgba(80, 80, 120, 0.35);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
  }

  private init() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x100c14);
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(2, -2, 5);
    this.camera = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);
    this.renderer = renderer;

    try {
      const backdrop = new THREE.Mesh(
        new THREE.IcosahedronGeometry(10, 5),
        new THREE.RawShaderMaterial({
          uniforms: {
            resolution: {value: new THREE.Vector2(1, 1)},
            rand: {value: 0},
          },
          vertexShader: backdropVS,
          fragmentShader: backdropFS,
          glslVersion: THREE.GLSL3,
        }),
      );
      backdrop.material.side = THREE.BackSide;
      scene.add(backdrop);
      this.backdrop = backdrop;
    } catch (error) {
      console.warn('Orb backdrop unavailable', error);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 4, 5);
    scene.add(key);
    const fill = new THREE.PointLight(0x88a0ff, 1.4);
    fill.position.set(-4, -1, 3);
    scene.add(fill);

    const geometry = new THREE.IcosahedronGeometry(1, 10);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a28,
      metalness: 0.65,
      roughness: 0.18,
      emissive: 0x141428,
      emissiveIntensity: 1.2,
    });
    sphereMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.time = {value: 0};
      shader.uniforms.inputData = {value: new THREE.Vector4()};
      shader.uniforms.outputData = {value: new THREE.Vector4()};
      sphereMaterial.userData.shader = shader;
      shader.vertexShader = sphereVS;
    };

    const sphere = new THREE.Mesh(geometry, sphereMaterial);
    scene.add(sphere);
    this.sphere = sphere;
    this.sphereMaterial = sphereMaterial;

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const dPR = renderer.getPixelRatio();
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (this.backdrop) {
        const material = this.backdrop.material as THREE.RawShaderMaterial;
        material.uniforms.resolution.value.set(w * dPR, h * dPR);
      }
      renderer.setSize(w, h);
      this.enhance?.resize(w, h);
    };

    this.onWindowResize = onWindowResize;
    window.addEventListener('resize', onWindowResize);
    onWindowResize();

    this.onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(this.frame);
        return;
      }
      this.animation();
    };
    document.addEventListener('visibilitychange', this.onVisibility);

    this.onContextLost = (event: Event) => {
      preserveWebGlContext(event);
      cancelAnimationFrame(this.frame);
    };
    this.onContextRestored = () => {
      this.animation();
    };
    this.canvas.addEventListener('webglcontextlost', this.onContextLost);
    this.canvas.addEventListener('webglcontextrestored', this.onContextRestored);
    this.animation();
    this.loadEnhance();
  }

  private loadEnhance() {
    // Deferred: three/addons postprocessing has blanked the app on iOS
    // when imported at module top of this file.
    void import('./src/visual/orb-enhance').then((mod) => {
      if (!this.renderer || !this.scene || !this.sphereMaterial) {
        return;
      }
      try {
        this.enhance = mod.attachOrbEnhance({
          renderer: this.renderer,
          scene: this.scene,
          camera: this.camera,
          sphereMaterial: this.sphereMaterial,
        });
      } catch (error) {
        console.warn('Orb enhance skipped', error);
      }
    }).catch((error: unknown) => {
      console.warn('Orb enhance unavailable', error);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.onWindowResize) {
      window.removeEventListener('resize', this.onWindowResize);
    }
    if (this.onVisibility) {
      document.removeEventListener('visibilitychange', this.onVisibility);
    }
    if (this.onContextLost) {
      this.canvas?.removeEventListener('webglcontextlost', this.onContextLost);
    }
    if (this.onContextRestored) {
      this.canvas?.removeEventListener(
        'webglcontextrestored',
        this.onContextRestored,
      );
    }
    cancelAnimationFrame(this.frame);
  }

  private animation() {
    if (document.hidden) {
      return;
    }
    this.frame = requestAnimationFrame(() => this.animation());

    if (!this.renderer || !this.scene || !this.camera || !this.sphere) {
      return;
    }

    if (this.inputAnalyser) {
      this.inputAnalyser.update();
    }
    if (this.outputAnalyser) {
      this.outputAnalyser.update();
    }

    const t = performance.now();
    const dt = (t - this.prevTime) / (1000 / 60);
    this.prevTime = t;

    if (this.backdrop) {
      const backdropMaterial = this.backdrop.material as THREE.RawShaderMaterial;
      backdropMaterial.uniforms.rand.value = this.reduceMotion
        ? 0
        : Math.random() * 10000;
    }

    const sphereMaterial = this.sphere.material as THREE.MeshStandardMaterial;
    if (sphereMaterial.userData.shader) {
      const input = this.inputAnalyser?.data ?? new Uint8Array(3);
      const output = this.outputAnalyser?.data ?? new Uint8Array(3);
      this.sphere.scale.setScalar(
        this.reduceMotion ? 1 : 1 + (0.2 * output[1]) / 255,
      );

      const f = 0.001;
      this.rotation.x += (dt * f * 0.5 * output[1]) / 255;
      this.rotation.z += (dt * f * 0.5 * input[1]) / 255;
      this.rotation.y += (dt * f * 0.25 * input[2]) / 255;
      this.rotation.y += (dt * f * 0.25 * output[2]) / 255;

      if (!this.reduceMotion) {
        const euler = new THREE.Euler(
          this.rotation.x,
          this.rotation.y,
          this.rotation.z,
        );
        const quaternion = new THREE.Quaternion().setFromEuler(euler);
        const vector = new THREE.Vector3(0, 0, 5);
        vector.applyQuaternion(quaternion);
        this.camera.position.copy(vector);
        this.camera.lookAt(this.sphere.position);
      }

      sphereMaterial.userData.shader.uniforms.time.value +=
        (dt * 0.1 * output[0]) / 255;
      sphereMaterial.userData.shader.uniforms.inputData.value.set(
        (1 * input[0]) / 255,
        (0.1 * input[1]) / 255,
        (10 * input[2]) / 255,
        0,
      );
      sphereMaterial.userData.shader.uniforms.outputData.value.set(
        (2 * output[0]) / 255,
        (0.1 * output[1]) / 255,
        (10 * output[2]) / 255,
        0,
      );
    }

    if (this.enhance) {
      this.enhance.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    if (!this.webglReady) {
      this.webglReady = true;
    }
  }

  protected firstUpdated() {
    this.canvas = this.shadowRoot!.querySelector('canvas') as HTMLCanvasElement;
    this.reduceMotion =
      this.reducedMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      this.init();
    } catch (error) {
      console.warn('Orb failed to start', error);
    }
  }

  protected updated() {
    this.reduceMotion =
      this.reducedMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  protected render() {
    return html`
      ${this.webglReady ? '' : html`<div class="orb-fallback" aria-hidden="true"></div>`}
      <canvas data-ready=${this.webglReady ? 'true' : 'false'}></canvas>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gdm-live-audio-visuals-3d': GdmLiveAudioVisuals3D;
  }
}
