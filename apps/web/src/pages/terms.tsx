import { PageSeo } from '@/components/seo/page-seo';
import { LegalDoc } from '@/components/marketing/legal-doc';
import { useResolvedLocale } from '@/lib/use-locale';

export function TermsPage() {
  const { locale, t, dict } = useResolvedLocale();
  return (
    <>
      <PageSeo
        title={t('meta.terms.title')}
        description={t('meta.terms.description')}
        path="/terms"
        locale={locale}
      />
      <LegalDoc
        eyebrow={dict.terms.eyebrow}
        heading={t('meta.terms.title')}
        draftLabel={dict.terms.draftLabel}
        lastUpdated={dict.terms.lastUpdated}
        sections={dict.terms.sections}
      />
    </>
  );
}
