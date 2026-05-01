import { Button } from '@/components/ui/button';
import { PageSeo } from '@/components/seo/page-seo';
import { JsonLd } from '@/components/seo/json-ld';
import { siteConfig } from '@/lib/site-config';
import { useResolvedLocale } from '@/lib/use-locale';

export function HomePage() {
  const { t, locale } = useResolvedLocale();

  return (
    <>
      <PageSeo
        title={siteConfig.name}
        description={t('meta.home.description')}
        path="/"
        locale={locale}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteConfig.name,
          url: siteConfig.hostname,
          slogan: siteConfig.tagline,
          inLanguage: siteConfig.locales,
        }}
      />
      <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6 px-4 py-16 text-center md:py-24">
        <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">
          {t('home.heroHeading')}
        </h1>
        <p className="text-lg text-muted-foreground md:text-xl">{t('home.heroSubheading')}</p>
        <Button size="lg" disabled aria-disabled="true">
          {t('home.pilotComingSoonCta')}
        </Button>
      </section>
    </>
  );
}
