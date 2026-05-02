import { User } from 'lucide-react';
import { PageSeo } from '@/components/seo/page-seo';
import { PageIntro } from '@/components/marketing/page-intro';
import { Section } from '@/components/marketing/section';
import { FinalCta } from '@/components/marketing/final-cta';
import { Card } from '@/components/ui/card';
import { useResolvedLocale } from '@/lib/use-locale';

export function AboutPage() {
  const { t, dict, locale } = useResolvedLocale();

  return (
    <>
      <PageSeo
        title={t('meta.about.title')}
        description={t('meta.about.description')}
        path="/about"
        locale={locale}
      />
      <PageIntro
        eyebrow={t('about.intro.eyebrow')}
        heading={t('about.intro.heading')}
        sub={t('about.intro.sub')}
      />

      <Section id="about-founder" eyebrow="" heading="">
        <Card className="grid gap-8 p-6 md:grid-cols-[160px_1fr] md:gap-10 md:p-10">
          <div
            className="flex aspect-square w-40 items-center justify-center rounded-card bg-muted"
            role="img"
            aria-label={t('about.founder.name')}
          >
            <User className="size-16 text-primary/50" aria-hidden="true" strokeWidth={1.25} />
          </div>
          <div>
            <p className="font-heading text-2xl font-semibold text-foreground">
              {t('about.founder.name')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{t('about.founder.role')}</p>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              {t('about.founder.bio')}
            </p>
          </div>
        </Card>
      </Section>

      <Section
        id="about-mission"
        eyebrow={t('about.missionEyebrow')}
        variant="muted"
      >
        <blockquote className="border-l-4 border-secondary pl-6">
          <p className="font-heading text-2xl italic leading-relaxed text-foreground md:text-3xl">
            {t('about.mission')}
          </p>
        </blockquote>
      </Section>

      <Section
        id="about-vertical"
        eyebrow={t('about.verticalFocusEyebrow')}
        heading={t('about.verticalFocusHeading')}
      >
        <div className="grid gap-6 md:grid-cols-3">
          {dict.about.verticalFocus.map((item) => (
            <Card key={item.id} className="p-6">
              <p className="font-heading text-lg font-semibold text-foreground">{item.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <FinalCta
        eyebrow={t('finalCta.eyebrow')}
        heading={t('finalCta.heading')}
        body={t('finalCta.body')}
        cta={t('finalCta.cta')}
      />
    </>
  );
}
