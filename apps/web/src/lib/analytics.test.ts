import { describe, it, expect, vi, afterEach } from 'vitest';
import { track } from './analytics';

afterEach(() => {
  delete (window as Window).plausible;
});

describe('track', () => {
  it('no-ops when window.plausible is undefined', () => {
    expect(() => track('cta_click')).not.toThrow();
  });

  it('forwards eventName + props to window.plausible', () => {
    const spy = vi.fn();
    window.plausible = spy;
    track('pilot_submit', { locale: 'th' });
    expect(spy).toHaveBeenCalledWith('pilot_submit', { props: { locale: 'th' } });
  });

  it('forwards eventName without options when props omitted', () => {
    const spy = vi.fn();
    window.plausible = spy;
    track('lang_toggle');
    expect(spy).toHaveBeenCalledWith('lang_toggle', undefined);
  });

  it('swallows errors thrown by window.plausible', () => {
    window.plausible = () => {
      throw new Error('plausible blew up');
    };
    expect(() => track('cta_click')).not.toThrow();
  });
});
