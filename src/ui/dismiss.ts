export function isSheetDismissKey(key: string): boolean {
  return key === 'Escape';
}

export function pathDismissesMore(
  path: Array<{
    classList?: {contains(name: string): boolean};
    getAttribute?(name: string): string | null;
  }>,
): boolean {
  return !path.some(
    (node) =>
      node.classList?.contains('more-sheet') ||
      node.getAttribute?.('data-kind') === 'more',
  );
}
