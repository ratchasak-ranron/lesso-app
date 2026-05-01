/**
 * Deterministic non-cryptographic hash. Used to pick a template index from a
 * stable input (patient + service + session etc.). Real LLM swap at A7
 * replaces these stubs entirely; the hash is fixture-only.
 */
export function hashIndex(input: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % Math.max(1, modulo);
}

export type AiLocale = 'th' | 'en';
