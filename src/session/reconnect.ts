import type {ErrorKind} from './machine';

export const MAX_AUTO_RECONNECT = 3;

export function nextBackoffMs(attempt: number): number {
  if (attempt <= 0) {
    return 500;
  }
  if (attempt === 1) {
    return 1500;
  }
  return 4000;
}

export function shouldAutoReconnect(input: {
  userClosed: boolean;
  attempt: number;
  errorKind?: ErrorKind;
}): boolean {
  if (input.userClosed) {
    return false;
  }
  if (input.errorKind === 'key' || input.errorKind === 'mic') {
    return false;
  }
  return input.attempt < MAX_AUTO_RECONNECT;
}

export function nextResumptionHandle(
  current: string | undefined,
  update: {resumable?: boolean; newHandle?: string} | undefined,
): string | undefined {
  if (!update) {
    return current;
  }
  if (update.resumable === false) {
    return current;
  }
  if (typeof update.newHandle === 'string' && update.newHandle) {
    return update.newHandle;
  }
  return current;
}
