# Three.js audio-reactive sphere / orb repos (Taskkorb ball)

Research only. **No product code in this change.** Written 26 Aug 2026.

**Method:** User asked for Firecrawl search. Firecrawl CLI v1.23.1 is installed but **unauthenticated**. Keyless search and scrape both failed (`You've hit Firecrawl's keyless free tier rate limit`). A `FIRECRAWL_API_KEY` was requested. Discovery and verification used the authenticated GitHub API (`gh api search/repositories`, `gh api repos/…/contents/…`) so every URL and license below is a live repo, not an invented name.

This is **not legal advice**. Licenses change.

**Taskkorb baseline (this repo):** `analyser.ts` uses `AnalyserNode` with `fftSize = 32` (16 bins) and `getByteFrequencyData`. `visual-3d.ts` builds `IcosahedronGeometry(1, 10)`, scales the mesh from **output** bin 1, orbits the camera from bins 1–2, and feeds bins 0–2 of **input** and **output** into `sphere-shader.ts` as `inputData` / `outputData`. The vertex shader displaces along the radial direction with `sin(freq * pos + time)`. Bloom is `UnrealBloomPass`. License on those files is Apache-2.0.

---

## Five verified GitHub repos

| # | Repo | License (file on default branch) | Stars (API) | Mesh | FFT → mesh |
|---|---|---|---|---|---|
| 1 | [desertcache/velvet](https://github.com/desertcache/velvet) | MIT, Copyright (c) 2026 desertcache (`LICENSE`) | 1 | `SphereGeometry(1, 128, 128)` + custom GLSL | `fftSize = 512` → **mean of all bins** → noise-gated scalar `uAmplitude` |
| 2 | [kuhung/audiovisualizer](https://github.com/kuhung/audiovisualizer) | MIT, Copyright (c) 2024 kuhung (`LICENSE`) | 26 | `IcosahedronGeometry(3, 30)` wireframe + bloom | `fftSize = 64` → **average frequency** → `u_frequency` * Perlin along normals |
| 3 | [dcyoung/r3f-audio-visualizer](https://github.com/dcyoung/r3f-audio-visualizer) | MIT, Copyright (c) 2022 David Young (`app/LICENSE`) | 136 | `SphereGeometry(1, 32, 24)` + SPH fluid shell | `fftSize = 8192` → **1/12-octave bars** → polar `(θ, φ)` radius |
| 4 | [nehasriva/phonon](https://github.com/nehasriva/phonon) | MIT, Copyright (c) 2026 Neha Srivastava (`LICENSE`) | 0 | 800 tiny spheres on a **Fibonacci sphere** | `fftSize = 256` → **one bin per particle** (index-mapped) |
| 5 | [soniaboller/audible-visuals](https://github.com/soniaboller/audible-visuals) | Apache-2.0 (`LICENSE`) | 164 | ~1024 radial **lines** from a unit-sphere sample | default AnalyserNode bins → **per-line Z** + color bands |

---

### 1. desertcache/velvet — closest product analog

**URL:** https://github.com/desertcache/velvet  
**License:** MIT (`LICENSE` on `master`).  
**What it is:** Electron + faster-whisper desktop STT. Frameless glass window. Three.js “SoulOrb” that morphs and recolors from the live mic.

**FFT → mesh (verified in `index.html` + `orb.js`):**

1. `getUserMedia` → `AnalyserNode` with **`fftSize = 512`** (256 bins).
2. Each frame: `getByteFrequencyData`. Mean of **all** bins, then `volume = (average / 128) * 1.5`. Values `< 0.05` are gated to 0.
3. That scalar is `orb.setAmplitude(volume)` → shader uniform `uAmplitude`.
4. Comment in HTML notes bins ~10–100 as the voice range but the shipped loop still averages the whole spectrum.
5. Mesh is `SphereGeometry(1, 128, 128)` + `ShaderMaterial`.
6. Vertex shader: layered 3D **simplex noise**. Idle “blob” displacement vs speaking “liquid silk” (flow + Y ripples). `mix(..., uShapeMorph)`. Final position = `position + normal * finalDisplacement`.
7. App states `IDLE | LISTENING | PROCESSING | SPEAKING` lerp colors, noise frequency, scale, and morph. Volume `> 0.15` flips LISTENING → SPEAKING.

**Taskkorb takeaway:** Keep dual analysers (mic + model). Add a **voice-band average + noise gate** for a single “talk energy” uniform, and **lerp visual states** instead of only driving three raw bins. High-res `SphereGeometry` + simplex is smoother than Taskkorb’s `IcosahedronGeometry(1, 10)` facets.

---

### 2. kuhung/audiovisualizer — closest mesh / bloom analog

**URL:** https://github.com/kuhung/audiovisualizer  
**License:** MIT (`LICENSE` on `main`). GitHub API: this repo is a **fork** of [WaelYasmina/audiovisualizer](https://github.com/WaelYasmina/audiovisualizer) (100 stars, **no SPDX / no LICENSE file**). Use kuhung’s MIT tree, not the parent, if you copy.

**FFT → mesh (verified in `src/js/audio/AudioManager.js`, `src/js/core/SceneManager.js`, `src/shaders/vertex.glsl`, `src/js/main.js`):**

1. File path: `THREE.AudioAnalyser(sound, 64)`. Mic path: native `AnalyserNode` with **`fftSize = 64`**.
2. `getAverageFrequency()` (THREE helper or mean of `getByteFrequencyData`).
3. That **one number** is `u_frequency` each frame.
4. Geometry: **`IcosahedronGeometry(3, 30)`**, wireframe `ShaderMaterial`, bloom post.
5. Vertex shader: classic 3D Perlin (`pnoise` from ashima/webgl-noise).  
   `displacement = clamp(u_frequency / 30, 0, 2) * noise * 0.5`  
   `newPosition = position + normal * displacement`.

**Taskkorb takeaway:** Same family as the current ball (icosahedron + bloom + radial displacement). Difference: they collapse FFT to **one average** and use **Perlin** for organic lumps; Taskkorb uses **three bins** and a sine. Combining both (few named bands * noise) is the obvious next look.

---

### 3. dcyoung/r3f-audio-visualizer — spatial FFT on a sphere

**URL:** https://github.com/dcyoung/r3f-audio-visualizer  
**License:** MIT in `app/LICENSE` (root has no LICENSE; GitHub still reports MIT).  
**What it is:** React Three Fiber playground. Several visuals; **fluidBall** is the sphere/orb.

**FFT → mesh (verified in `app/src/lib/analyzers/fft.ts`, `…/fftAnalyzerControls.tsx`, `…/coordinateMappers/data/mapper.ts`, `…/fluidBall/base.tsx`):**

1. `AnalyserNode.fftSize = 8192`, `smoothingTimeConstant = 0.5`, dB window `[-85, -25]`. Inspired by [hvianna/audioMotion-analyzer](https://github.com/hvianna/audioMotion-analyzer).
2. Raw bins are regrouped into **equal-tempered octave bands** (default mode `2` = 1/12-octave). Each bar = max (interpolated) amplitude in that Hz range, then `/ 255`.
3. Bars copy into a 1D `Float32Array`. Polar map: vertex `(θ, φ)` → `xNorm = (θ+π)/2π`, `yNorm = φ/π` → `map_2D` uses **radial offset from the UV center** to index the bar array (linear interpolation).
4. `MorphingSphereShell`: for each vertex, `r = baseRadius + morphScale * baseRadius * mapVal`, then write `dir * r`. Same radius field also drives an SPH “morphing_sphere” fluid.

**Taskkorb takeaway:** This is the mapping Taskkorb does **not** do. Today every vertex sees the same three globals. A **polar lookup** (low frequencies on one hemisphere / equator, highs elsewhere) would make the ball read as a spectrum, not a pulse.

---

### 4. nehasriva/phonon — particle orb, per-bin index map

**URL:** https://github.com/nehasriva/phonon  
**License:** MIT (`LICENSE` on `main`).  
**What it is:** Single-page Three.js particle sphere. Mic only.

**FFT → mesh (verified in `script.js`):**

1. Mic → `AnalyserNode` **`fftSize = 256`** (128 bins).
2. Particles: 800 `SphereGeometry(0.1, 8, 8)` placed with a **Fibonacci sphere** (`phi = acos(1 - 2i/N)`, golden-angle `theta`).
3. `frequencyIndex = floor((i / particleCount) * dataArray.length)` — particle index → bin index.
4. That bin (0–1) scales XYZ wobble from the rest position, particle scale, and lerp between base/accent colors. Also computes a global average (unused for position).

**Taskkorb takeaway:** If the ball should feel like a **cloud of dots** (voice-assistant “thinking orb”) instead of a chrome icosahedron, this is the cheapest pattern. Mapping is naive (index ≠ Hz), so prefer velvet/dcyoung for frequency meaning.

---

### 5. soniaboller/audible-visuals — Apache-2.0 line sphere

**URL:** https://github.com/soniaboller/audible-visuals  
**License:** Apache License 2.0 (`LICENSE` on `master`) — **same SPDX as Taskkorb’s visual files**.  
**What it is:** Classic Web Audio + THREE experiments. Default route `/` renders the sphere (`controllers/audio.js`).

**FFT → mesh (verified in `public/scripts/sphere.js`, `public/scripts/audioLoader.js`):**

1. `createMediaElementSource` + `createAnalyser()` — **no `fftSize` set** (browser default, typically 2048 → 1024 bins).
2. Builds **1024 lines**. Each line is two vertices: a random point on a sphere (normalized × 125) and a point 1.25× further out.
3. Each frame: `getByteFrequencyData`; line `j` sets `vertices[1].z = uintFrequencyData[j] * intensity + 50` and `vertices[0].z = -uintFrequencyData[j]`.
4. Color bands by that Z: inner / mid / outer hex colors, else black.

**Taskkorb takeaway:** License-safe. The “sphere” is a **radial spike ball**, not a closed mesh. Useful if you want a spectrum-readable silhouette. Renderer is old `CanvasRenderer` (not WebGL) — do not copy that stack.

---

## Inspiration map for the Taskkorb ball

| Want | Steal this idea (not the code wholesale) | From |
|---|---|---|
| Voice-assistant states (idle / listen / speak) | Lerp uniforms; gate FFT mean; `fftSize` 512 | velvet |
| Organic chrome blob like today’s ball | Icosahedron + bloom + Perlin * frequency | kuhung |
| Spectrum readable on the surface | Octave-band FFT → polar radius | dcyoung fluidBall |
| Soft particle orb | Fibonacci sphere + per-index bin | phonon |
| Same Apache-2.0 family | Radial lines / spikes from bins | soniaboller |

Taskkorb already has something the others mostly lack: **two analysers** (user mic vs model audio) and a **tiny FFT (32)** that is cheap on mobile. If you take ideas from these repos, keep `fftSize` modest on phone; dcyoung’s 8192 is a desktop analyser.

---

## Looked at, not in the five

Verified via GitHub API, excluded for a stated reason:

| Repo | Why not in the five |
|---|---|
| [WaelYasmina/audiovisualizer](https://github.com/WaelYasmina/audiovisualizer) | Parent of kuhung. **No license file.** |
| [Napoleon0007/Audio-Visualizer-Take-2](https://github.com/Napoleon0007/Audio-Visualizer-Take-2) | Claims “audio-reactive orb”; `LICENSE` still says “Copyright (c) 2024 kuhung” — treat as a kuhung copy. |
| [patrickheng/three-js-audio-experiment-v2](https://github.com/patrickheng/three-js-audio-experiment-v2) | Real `SphereGeometry(60,40,40)`; each vertex `*= audioData[i]`. License is **CC BY-NC-SA 4.0** (`LICENSE.md`) — poor fit for a product. |
| [jtr-dev/Icosahedron-Geometry](https://github.com/jtr-dev/Icosahedron-Geometry) | MIT. Wallpaper Engine `wallpaperRegisterAudioListener`; vertex `i` uses `audioArray[i]` * simplex. Tied to that host, not the Web Audio graph. |
| [amunozdev/voiceorbs](https://github.com/amunozdev/voiceorbs) | MIT voice-assistant orbs, but **React / not Three.js**. |
| [mahdidavoodi7/expo-thinking-orbs](https://github.com/mahdidavoodi7/expo-thinking-orbs) | MIT audio-reactive orb for RN/Expo **Skia**, not Three.js. |
| [l1ve4code/3d-music-visualizer](https://github.com/l1ve4code/3d-music-visualizer) | MIT Three.js music viz; mesh is a **plane**, not an orb. |
| [google-gemini live visualizer](https://github.com/search?q=gdm-live-audio-visuals-3d) | Search for `gdm-live-audio-visuals-3d` returned **no** standalone Google repo in this environment. Taskkorb already *is* that Apache-2.0 pattern. |

---

## Sources

- GitHub REST: `GET /repos/{owner}/{repo}`, `GET /repos/{owner}/{repo}/contents/{path}`, `GET /search/repositories?q=…`
- Raw files cited above (LICENSE, shaders, analyser modules).
- Firecrawl: **not used for hits** (keyless rate limit). Do not treat this memo as a Firecrawl scrape of those GitHub pages.
