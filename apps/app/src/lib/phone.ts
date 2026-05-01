/**
 * Strip non-digits from phone input. Use as Zod transform on patient input.
 * Accepts +66 / 0xx / mixed formats.
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('66')) return `0${digits.slice(2)}`;
  return digits;
}

/**
 * Format Thai phone for display: 0XX-XXX-XXXX (10-digit) or fallback original.
 */
export function displayPhone(digits: string): string {
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}
