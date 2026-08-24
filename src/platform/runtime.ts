export type MobileKind = 'ios' | 'android' | 'other';

export function isAppleTouchDevice(
  userAgent: string,
  maxTouchPoints = 0,
): boolean {
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return true;
  }
  // iPadOS 13+ Safari can report itself as Macintosh.
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
}

export function mobileKind(
  userAgent: string,
  maxTouchPoints = 0,
): MobileKind {
  if (isAppleTouchDevice(userAgent, maxTouchPoints)) {
    return 'ios';
  }
  if (/Android/i.test(userAgent)) {
    return 'android';
  }
  return 'other';
}

/** Instagram / WhatsApp / Mail in-app browsers often cannot grant the mic. */
export function isEmbeddedBrowser(userAgent: string): boolean {
  return /FBAN|FBAV|Instagram|Line\/|WhatsApp|MicroMessenger|Snapchat|Twitter|TikTok|Pinterest|GSA\/|; wv\)/i.test(
    userAgent,
  );
}

/** Safari/Chrome web pages cannot start capture without a tap. */
export function shouldAutoStartMicrophone(): boolean {
  return false;
}

/**
 * Chrome Android records only while the site tab is in front.
 * We stop tracks ourselves so Talk state matches the OS mute.
 */
export function shouldReleaseMicrophoneOnHidden(): boolean {
  return true;
}

export function deniedMicInstructions(kind: MobileKind): string {
  switch (kind) {
    case 'ios':
      return 'Microphone is blocked. In Safari tap AA → Website Settings → Microphone → Allow. Or open Settings → Safari → Microphone. This page cannot open Settings for you.';
    case 'android':
      return 'Microphone is blocked. In Chrome tap the lock icon → Site settings → Microphone, allow this site, then use Talk. This page cannot jump into system settings.';
    case 'other':
      return 'Microphone was blocked. Allow it in the browser, then use Talk.';
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function preserveWebGlContext(event: {preventDefault?: () => void}): void {
  event.preventDefault?.();
}
