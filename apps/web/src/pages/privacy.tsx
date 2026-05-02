import { PageSeo } from '@/components/seo/page-seo';
import { LegalDoc } from '@/components/marketing/legal-doc';
import { useResolvedLocale } from '@/lib/use-locale';

export function PrivacyPage() {
  const { locale, t, dict } = useResolvedLocale();
  return (
    <>
      <PageSeo
        title={t('meta.privacy.title')}
        description={t('meta.privacy.description')}
        path="/privacy"
        locale={locale}
      />
      <LegalDoc
        eyebrow={dict.privacy.eyebrow}
        heading={t('meta.privacy.title')}
        draftLabel={dict.privacy.draftLabel}
        lastUpdated={dict.privacy.lastUpdated}
        sections={dict.privacy.sections}
      />
    </>
  );
}
