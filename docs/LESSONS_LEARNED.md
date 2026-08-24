# Lessons Learned

- An ownership prompt is not a product spec. The repo is the spec until a human says otherwise.
- A voice demo that hides connection state is not a product.
- Preview model IDs rot. Keep them in one constants file.
- Tunnels are not releases.
- Removing sessionStorage is not a credential boundary. A token issuer is.
- Five equal buttons is how a voice product hides its only action.
- Gemini Live sockets die around 10 minutes. Reconnect without a resumption handle is a new conversation pretending to be the same one.
- A 2-second mint cooldown without Retry-After turns settings into an error.
- Do not invent candidate/resume systems on top of an audio orb to look complete.
- A generic “autonomous product owner” prompt is not an explicit pivot. Reconstruct from the repo.
- Mic permission denial is not a broken Gemini session. Do not disable Talk for it.
- A Live `onerror` that says PERMISSION_DENIED is a rejected key. Do not auto-reconnect it as a dropped socket.
