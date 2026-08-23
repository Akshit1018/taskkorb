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
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {fs as backdropFS, vs as backdropVS} from './backdrop-shader';
import {vs as sphereVS} from './sphere-shader';

/**
 * 3D live audio visual.
 */
@customElement('gdm-live-audio-visuals-3d')
export class GdmLiveAudioVisuals3D extends LitElement {
  private inputAnalyser?: Analyser;
  private outputAnalyser?: Analyser;
  private camera!: THREE.PerspectiveCamera;
  private backdrop!: THREE.Mesh;
  private composer!: EffectComposer;
  private sphere!: THREE.Mesh;
  private prevTime = 0;
  private rotation = new THREE.Vector3(0, 0, 0);

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

  static styles = css`
    canvas {
      width: 100% !important;
      height: 100% !important;
      position: absolute;
      inset: 0;
      image-rendering: pixelated;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
  }

  private init() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x100c14);

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
      antialias: !true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));

    const geometry = new THREE.IcosahedronGeometry(1, 6);

    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x000010,
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0x000010,
      emissiveIntensity: 1.5,
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
    sphere.visible = true;

    this.sphere = sphere;

    const renderPass = new RenderPass(scene, camera);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    this.composer = composer;

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const dPR = renderer.getPixelRatio();
      const w = window.innerWidth;
      const h = window.innerHeight;
      backdrop.material.uniforms.resolution.value.set(w * dPR, h * dPR);
      renderer.setSize(w, h);
      composer.setSize(w, h);
    }

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
    this.animation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.onWindowResize) {
      window.removeEventListener('resize', this.onWindowResize);
    }
    if (this.onVisibility) {
      document.removeEventListener('visibilitychange', this.onVisibility);
    }
    cancelAnimationFrame(this.frame);
  }

  private animation() {
    if (document.hidden) {
      return;
    }
    this.frame = requestAnimationFrame(() => this.animation());

    if (!this.composer || !this.backdrop || !this.sphere) {
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
    const backdropMaterial = this.backdrop.material as THREE.RawShaderMaterial;
    const sphereMaterial = this.sphere.material as THREE.MeshStandardMaterial;

    backdropMaterial.uniforms.rand.value = Math.random() * 10000;

    if (sphereMaterial.userData.shader) {
      const input = this.inputAnalyser?.data ?? new Uint8Array(3);
      const output = this.outputAnalyser?.data ?? new Uint8Array(3);
      this.sphere.scale.setScalar(1 + (0.2 * output[1]) / 255);

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

    this.composer.render();
  }

  protected firstUpdated() {
    this.canvas = this.shadowRoot!.querySelector('canvas') as HTMLCanvasElement;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  protected render() {
    return html`<canvas></canvas>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gdm-live-audio-visuals-3d': GdmLiveAudioVisuals3D;
  }
}
