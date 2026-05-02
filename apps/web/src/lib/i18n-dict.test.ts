import { describe, it, expect } from 'vitest';
import { makeT } from './i18n-dict';

describe('makeT (en)', () => {
  const t = makeT('en');

  it('returns translated string for a known key', () => {
    expect(t('home.heroLine1')).toBe('Less cost.');
    expect(t('home.heroLine2')).toBe('More care.');
  });

  it('returns the key itself when key is missing', () => {
    expect(t('does.not.exist')).toBe('does.not.exist');
  });

  it('substitutes a {{var}} placeholder', () => {
    expect(t('nav.switchTo', { lang: 'ภาษาไทย' })).toBe('Switch to ภาษาไทย');
  });

  it('escapes HTML in interpolated values', () => {
    expect(t('nav.switchTo', { lang: '<script>alert(1)</script>' })).toBe(
      'Switch to &lt;script&gt;alert(1)&lt;/script&gt;',
    );
  });

  it('drops the placeholder when the matching var is missing', () => {
    expect(t('footer.copyright', {})).toBe('©  Lesso. All rights reserved.');
    expect(t('footer.copyright', { other: 'x' })).toBe('©  Lesso. All rights reserved.');
  });
});

describe('makeT (th)', () => {
  it('returns Thai translation for a known key', () => {
    const t = makeT('th');
    expect(t('home.heroLine1')).toBe('ลดต้นทุน');
    expect(t('home.heroLine2')).toBe('เพิ่มคุณภาพการดูแล');
  });
});
