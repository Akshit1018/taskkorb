import {describe, expect, it} from 'vitest';
import {isSheetDismissKey, pathDismissesMore} from './dismiss';

describe('more sheet dismiss', () => {
  it('closes on Escape', () => {
    expect(isSheetDismissKey('Escape')).toBe(true);
    expect(isSheetDismissKey('Enter')).toBe(false);
  });

  it('closes on an outside click but not on the sheet or More button', () => {
    expect(
      pathDismissesMore([{classList: {contains: () => false}, getAttribute: () => null}]),
    ).toBe(true);
    expect(
      pathDismissesMore([{classList: {contains: (name) => name === 'more-sheet'}}]),
    ).toBe(false);
    expect(pathDismissesMore([{getAttribute: (name) => (name === 'data-kind' ? 'more' : null)}])).toBe(
      false,
    );
  });
});
