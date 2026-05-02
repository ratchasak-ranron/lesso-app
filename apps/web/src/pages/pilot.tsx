import { useState } from 'react';
import { PageSeo } from '@/components/seo/page-seo';
import { PageIntro } from '@/components/marketing/page-intro';
import { Section } from '@/components/marketing/section';
import { PilotForm } from '@/components/marketing/pilot-form';
import { useResolvedLocale } from '@/lib/use-locale';

const FALLBACK_TO = 'hello@lesso.clinic';

export function PilotPage() {
  const { locale, t } = useResolvedLocale();
  const [submitted, setSubmitted] = useState(false);
  // Recipient is public anyway (it ends up in the user's mail-client `to:`),
  // so leaking via VITE_ is fine.
  const to = (import.meta.env.VITE_WAITLIST_TO as string | undefined) ?? FALLBACK_TO;

  return (
    <>
      <PageSeo
        title={t('meta.pilot.title')}
        description={t('meta.pilot.description')}
        path="/pilot"
        locale={locale}
      />
      <PageIntro
        eyebrow={t('pilot.intro.eyebrow')}
        heading={t('pilot.intro.heading')}
        sub={t('pilot.intro.sub')}
      />

      {submitted ? (
        <Section
          id="pilot-success"
          eyebrow={t('pilot.intro.eyebrow')}
          heading={t('pilot.success.heading')}
          variant="muted"
        >
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('pilot.success.body')}
          </p>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            {t('pilot.success.fallback', { email: to })}
          </p>
        </Section>
      ) : (
        // PageIntro already provides the page h1; emit a plain div instead
        // of <Section> so we don't ship an unlabelled <section> landmark.
        <div className="mx-auto max-w-3xl px-6 pb-16 md:pb-24">
          <PilotForm to={to} onSubmitted={() => setSubmitted(true)} />
          <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
            {t('pilot.legalPrefix')}{' '}
            <a className="underline hover:text-primary" href={`/${locale}/privacy`}>
              {t('pilot.privacyLinkText')}
            </a>{' '}
            {t('pilot.and')}{' '}
            <a className="underline hover:text-primary" href={`/${locale}/terms`}>
              {t('pilot.termsLinkText')}
            </a>
            .
          </p>
        </div>
      )}
    </>
  );
}
