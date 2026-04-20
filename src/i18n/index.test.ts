import { describe, it, expect } from 'vitest';
import { t, assertParity } from './index';

describe('t()', () => {
  it('returns IT string for known key', () => {
    expect(t('lang.it', 'it')).toBe('IT');
  });

  it('returns EN string for known key', () => {
    expect(t('lang.en', 'en')).toBe('EN');
  });

  it('interpolates variables', () => {
    expect(t('footer.copyright', 'en', { year: 2026 })).toContain('2026');
  });

  it('throws on unknown key', () => {
    expect(() => t('nope', 'it')).toThrow(/missing key/);
  });

  it('throws on missing variable', () => {
    expect(() => t('footer.copyright', 'it')).toThrow(/missing variable/);
  });
});

describe('assertParity()', () => {
  it('passes for parity IT/EN dictionaries', () => {
    expect(() => assertParity()).not.toThrow();
  });
});
