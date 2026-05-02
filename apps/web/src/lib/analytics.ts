type Props = Record<string, string | number | boolean>;

/**
 * Fire a Plausible custom event. No-op when the script is not loaded — safe
 * to call before hydration completes or when `VITE_PLAUSIBLE_DOMAIN` is unset
 * (dev). Errors inside `window.plausible` are swallowed: analytics must never
 * break the form submission path.
 */
export function track(eventName: string, props?: Props): void {
  if (typeof window === 'undefined') return;
  const fn = window.plausible;
  if (typeof fn !== 'function') return;
  try {
    fn(eventName, props ? { props } : undefined);
  } catch {
    /* swallow — analytics must not break callers */
  }
}
