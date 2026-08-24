export async function resumeAudioGraph(
  contexts: Array<{state?: string; resume?: () => Promise<unknown>} | undefined>,
): Promise<void> {
  await Promise.all(
    contexts.map(async (context) => {
      if (context?.state === 'suspended' && context.resume) {
        await context.resume();
      }
    }),
  );
}

export function applyPlayAndRecordHint(nav: {
  audioSession?: {type?: string};
}): void {
  if (nav.audioSession) {
    nav.audioSession.type = 'play-and-record';
  }
}
