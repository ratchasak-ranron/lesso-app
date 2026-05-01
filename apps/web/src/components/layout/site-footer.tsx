import { useResolvedLocale } from '@/lib/use-locale';
import type { Locale } from '@/lib/site-config';

interface SiteFooterProps {
  locale: Locale;
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const { t } = useResolvedLocale();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
        <span>{t('footer.copyright', { year })}</span>
        <span lang={locale} className="text-xs uppercase tracking-wide">
          {locale}
        </span>
      </div>
    </footer>
  );
}
