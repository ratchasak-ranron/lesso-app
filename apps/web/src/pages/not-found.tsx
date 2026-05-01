import { PageSeo } from '@/components/seo/page-seo';
import { useResolvedLocale } from '@/lib/use-locale';

export function NotFoundPage() {
  const { t, locale } = useResolvedLocale();

  return (
    <>
      <PageSeo
        title={t('meta.notFound.title')}
        description={t('meta.notFound.description')}
        path="/404"
        locale={locale}
      />
      <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-heading text-7xl font-semibold text-primary">{t('notFound.heading')}</p>
        <p className="text-lg text-muted-foreground">{t('notFound.body')}</p>
        <a
          href={`/${locale}`}
          className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t('notFound.backHome')}
        </a>
      </section>
    </>
  );
}
