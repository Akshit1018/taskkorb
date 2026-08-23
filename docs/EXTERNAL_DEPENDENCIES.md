# External Dependencies

## GEMINI_API_KEY

- Provider: Google Gemini API
- Use: Live Audio session
- Status: **EXTERNAL_DEPENDENCY_REQUIRED** for real conversation
- Current integration: user-pasted browser key, **test-only**
- Production interface: ephemeral token minted by a backend
- Fallback: app explains that a key is required and does not fake a conversation

## Cloudflare Quick Tunnel

- Use: temporary public preview
- Status: ephemeral, can 1033
- Not a production host

## Local EXR environment map

- File: `public/piz_compressed.exr`
- If missing, the orb still renders without a reflection map
