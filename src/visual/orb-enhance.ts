/**
 * Optional original-orb finish. Loaded after the first frame so a
 * failed three/addons parse cannot blank the host page.
 */
import * as THREE from 'three';
import {EXRLoader} from 'three/addons/loaders/EXRLoader.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

export interface OrbEnhanceTarget {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sphereMaterial: THREE.MeshStandardMaterial;
}

export interface OrbEnhance {
  composer: EffectComposer;
  resize: (width: number, height: number) => void;
}

export function attachOrbEnhance(target: OrbEnhanceTarget): OrbEnhance {
  const {renderer, scene, camera, sphereMaterial} = target;
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  new EXRLoader().load(
    'piz_compressed.exr',
    (texture: THREE.Texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      const env = pmremGenerator.fromEquirectangular(texture);
      sphereMaterial.envMap = env.texture;
      sphereMaterial.needsUpdate = true;
    },
  );

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(
    new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.25,
      0.4,
      0.15,
    ),
  );

  return {
    composer,
    resize(width: number, height: number) {
      composer.setSize(width, height);
    },
  };
}
