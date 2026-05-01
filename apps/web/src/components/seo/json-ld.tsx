interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Renders nothing in the React tree. JSON-LD is injected per route in
 * `vite.config.ts → ssgOptions.onPageRendered` (see `PageSeo` notes).
 */
export function JsonLd(_props: JsonLdProps): null {
  return null;
}
