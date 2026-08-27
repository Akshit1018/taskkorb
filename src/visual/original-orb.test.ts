import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

describe('original GitHub orb', () => {
  it('keeps the EXR environment map from main', () => {
    expect(existsSync('public/piz_compressed.exr')).toBe(true);
  });

  it('renders the original bloom bowl, not the stripped mesh', () => {
    const source = readFileSync('visual-3d.ts', 'utf8');
    expect(source).toContain("IcosahedronGeometry(1, 10)");
    expect(source).toContain('UnrealBloomPass');
    expect(source).toContain('piz_compressed.exr');
    expect(source).not.toContain('IcosahedronGeometry(1, 6)');
  });
});
