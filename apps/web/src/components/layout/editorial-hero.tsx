import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResolvedLocale } from '@/lib/use-locale';
import { track } from '@/lib/analytics';
import en from '@/locales/en.json';

// Trust-strip keys derived once at module load from the canonical `home.trust`
// shape in en.json. Adding a fourth bullet only requires editing both locale
// JSONs — the array adapts automatically.
const TRUST_KEYS = (Object.keys(en.home.trust) as Array<keyof typeof en.home.trust>).map(
  (k) => `home.trust.${k}` as const,
);

/**
 * Soft-modern hero — center-anchored, oversized geometric headline,
 * indigo accent dot + ghost gradient, single primary CTA. Copy comes
 * from `useResolvedLocale.t`; no inline strings.
 */
export function EditorialHero() {
  const { locale, t } = useResolvedLocale();
  const pilotHref = `/${locale}/pilot`;

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle gradient glow — sits behind the hero, doesn't render in
          screenshots aggressive enough to read as "AI gradient". */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--indigo-soft))_0%,transparent_70%)]"
      />

      <div className="mx-auto max-w-5xl px-6 py-24 md:py-36">
        <div className="flex flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-card">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-indigo" />
            {t('home.eyebrow')}
          </p>

          <h1 className="mt-8 font-heading text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            {t('home.heroLine1')}
            <br />
            <span className="text-muted-foreground">{t('home.heroLine2')}</span>
          </h1>

          <hr
            className="mt-10 h-0 w-16 border-0 border-t-2 border-indigo"
            aria-hidden="true"
          />

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {t('home.heroSubheading')}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="shadow-card" asChild>
              <a
                href={pilotHref}
                onClick={() => track('cta_click', { source: 'hero', locale })}
              >
                {t('home.pilotComingSoonCta')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {TRUST_KEYS.map((key) => (
              <li key={key} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 shrink-0 text-emerald-ink" aria-hidden="true" />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
