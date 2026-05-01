import { describe, it, expect } from 'vitest';
import { localeFromPath, localeSwitchHref } from './locale-utils';

describe('localeFromPath', () => {
  it('returns en when first segment is en', () => {
    expect(localeFromPath('/en')).toBe('en');
    expect(localeFromPath('/en/pricing')).toBe('en');
  });

  it('returns th when first segment is th', () => {
    expect(localeFromPath('/th')).toBe('th');
    expect(localeFromPath('/th/about')).toBe('th');
  });

  it('falls back to default locale on unknown segment', () => {
    expect(localeFromPath('/fr')).toBe('en');
    expect(localeFromPath('/garbage/x')).toBe('en');
  });

  it('falls back to default locale on root path', () => {
    expect(localeFromPath('/')).toBe('en');
    expect(localeFromPath('')).toBe('en');
  });
});

describe('localeSwitchHref', () => {
  it('swaps the prefix for a non-root path', () => {
    expect(localeSwitchHref('/en/pricing', 'en', 'th')).toBe('/th/pricing');
    expect(localeSwitchHref('/th/about', 'th', 'en')).toBe('/en/about');
  });

  it('returns the locale root for an exact-locale path', () => {
    expect(localeSwitchHref('/en', 'en', 'th')).toBe('/th');
    expect(localeSwitchHref('/th', 'th', 'en')).toBe('/en');
  });

  it('returns the locale root for a trailing-slash root', () => {
    expect(localeSwitchHref('/en/', 'en', 'th')).toBe('/th');
  });

  it('returns the locale root when pathname has no recognised prefix', () => {
    expect(localeSwitchHref('/', 'en', 'th')).toBe('/th');
  });
});
