import { PageSeo } from '@/components/seo/page-seo';
import { JsonLd } from '@/components/seo/json-ld';
import { EditorialHero } from '@/components/layout/editorial-hero';
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
      <EditorialHero />
    </>
  );
}
