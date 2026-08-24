export function modelsToTry(
  hosted: boolean,
  primary: string,
  fallback: string,
): string[] {
  return hosted ? [primary] : [primary, fallback];
}
