# Unverified Assumptions

Marked explicitly. Do not treat these as confirmed defects.

| ID | Assumption | Why unverified |
| --- | --- | --- |
| UA-001 | `gemini-2.5-flash-native-audio-preview-12-2025` accepts this key and this config | No Gemini key in the audit environment |
| UA-002 | `systemInstruction` is honored by the chosen preview models | Prior js-genai issue #1199 shows some setups appear to ignore it |
| UA-003 | `inputAudioTranscription` / `outputAudioTranscription` populate in this SDK version | Types were not proven at runtime |
| UA-004 | AudioWorklet path runs on iOS Safari / cheap Android | Only the file is served (HTTP 200). No device lab. |
| UA-005 | Mic echo is gone in a real room | Code no longer routes capture to destination; acoustic echo was not measured |
| UA-006 | Users want an orb more than ChatGPT/Gemini voice | Hypothesis only |
| UA-007 | Hindi/Hinglish replies actually happen | Prompt asks for it; no live test |
| UA-008 | Cloudflare Quick Tunnel stays up for a real tester | Already failed once (1033). Current tunnel returned 200 at audit time. |

## What was actually tested

- Read `index.tsx`, session machine, PCM, visual, Vite config, docs
- `npm test` previously: 11 unit tests, none of the live path
- Local `:3000` HTML 200
- Tunnel HTML 200
- Worklet file HTTP 200
- Production bundle size 833 KB JS
- EXR size 3.2 MB
