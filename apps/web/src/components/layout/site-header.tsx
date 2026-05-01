import { useLocation } from 'react-router-dom';
import { useResolvedLocale } from '@/lib/use-locale';
import { siteConfig, type Locale } from '@/lib/site-config';

interface SiteHeaderProps {
  locale: Locale;
}

const NEXT_LANG: Record<Locale, Locale> = { en: 'th', th: 'en' };
const NEXT_LABEL: Record<Locale, string> = { en: 'ภาษาไทย', th: 'English' };

export function SiteHeader({ locale }: SiteHeaderProps) {
  const { t } = useResolvedLocale();
  const { pathname } = useLocation();

  // eslint-disable-next-line security/detect-object-injection -- locale is a constant union
  const next = NEXT_LANG[locale];
  // eslint-disable-next-line security/detect-object-injection -- locale is a constant union
  const nextLabel = NEXT_LABEL[locale];
  // Strip the current `/<locale>` prefix and rewrite to the other locale.
  // Real anchor (not Link) — full reload keeps SSG-prerendered `<html lang>`
  // in sync without a client-side flicker.
  // eslint-disable-next-line security/detect-non-literal-regexp -- `locale` is a constant union ('en' | 'th'), not user input
  const stripPrefix = new RegExp(`^/${locale}(/|$)`);
  const restOfPath = pathname.replace(stripPrefix, '/').replace(/^\/+$/, '/');
  const switchHref = `/${next}${restOfPath === '/' ? '' : restOfPath}`;

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <a
          href={`/${locale}`}
          className="font-heading text-xl font-bold text-primary"
        >
          {siteConfig.name}
        </a>
        <a
          href={switchHref}
          className="touch-target inline-flex items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={t('nav.switchTo', { lang: nextLabel })}
        >
          {nextLabel}
        </a>
      </div>
    </header>
  );
}
