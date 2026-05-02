import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResolvedLocale } from '@/lib/use-locale';

const TRUST_KEYS = ['home.trust.pdpa', 'home.trust.thaiFirst', 'home.trust.noLockIn'] as const;

/**
 * Editorial premium hero — left-anchored, italic-accent serif headline,
 * terracotta eyebrow + rule, deep-teal CTA, sage-tinted trust strip.
 * Pulls all copy from `useResolvedLocale.t`; no inline strings.
 */
export function EditorialHero() {
  const { t } = useResolvedLocale();

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-36">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
          {t('home.eyebrow')}
        </p>

        <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl">
          {t('home.heroLine1')}
          <br />
          <span className="font-normal italic">{t('home.heroLine2')}</span>
        </h1>

        <hr
          className="mt-8 h-0 w-16 border-0 border-t-2 border-secondary"
          aria-hidden="true"
        />

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {t('home.heroSubheading')}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button size="lg" className="shadow-card" disabled aria-disabled="true">
            {t('home.pilotComingSoonCta')}
          </Button>
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          {TRUST_KEYS.map((key) => (
            <li key={key} className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 shrink-0 text-success" aria-hidden="true" />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
