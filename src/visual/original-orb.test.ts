import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

describe('original GitHub orb', () => {
  it('keeps the EXR environment map from main', () => {
    expect(existsSync('public/piz_compressed.exr')).toBe(true);
  });

  it('draws the detail-10 bowl even if bloom is still loading', () => {
    const core = readFileSync('visual-3d.ts', 'utf8');
    expect(core).toContain('IcosahedronGeometry(1, 10)');
    expect(core).not.toContain('IcosahedronGeometry(1, 6)');
    expect(core).toContain('AmbientLight');
  });

  it('keeps bloom and EXR as an after-first-frame enhance', () => {
    const enhance = readFileSync('src/visual/orb-enhance.ts', 'utf8');
    expect(enhance).toContain('UnrealBloomPass');
    expect(enhance).toContain('piz_compressed.exr');
  });
});
