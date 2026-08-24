# Product Vision

## What this product is

Taskkorb is a **live voice companion**. The user speaks. A 3D orb listens, answers out loud, and moves with the conversation.

The repository evidence is an AI Studio export originally titled "Copy of Audio Orb". The GitHub repo is named `taskkorb`. There is no backend, no candidate profile store, no resume system, and no job-search workflow in this codebase.

## Who it is for

People who want to think out loud with a voice model and see that the system is actually listening. First-time testers on mobile are a current audience.

## Problem

Most voice demos fail the basic loop:

- the user does not know whether they are connected
- microphone and model errors are silent
- the API key is treated as an afterthought
- the visual is decorative while the conversation is opaque

## Final product direction

Keep the orb as the primary surface. Make the conversation loop trustworthy.

Later, durable architecture should allow Taskkorb to attach **tasks**, memory, or tools without rewriting the voice path. Those layers do not exist yet and must not be faked.

## Explicitly rejected for this repository

A career OS, candidate profile store, resume generator, interview coach, or job tracker is **not** the current product. Those concepts appeared only in a generic ownership prompt, not in the repository or user journeys.

If that pivot is required later, it is a separate product decision, not an incremental rename of this orb.

## Current user journey

1. Open the app (Safari or Chrome — not an in-app browser)
2. If hosted mint is off, get a Gemini key from AI Studio and paste it for this tab
3. Wait until the orb is connected
4. On a phone, tap Talk (hold is the desktop default) and allow the microphone
5. Speak
6. Hear and read the orb's reply
7. Deny of the mic leaves Talk available; a rejected key does not
