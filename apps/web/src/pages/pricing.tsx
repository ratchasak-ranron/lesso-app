import { PageSeo } from '@/components/seo/page-seo';
import { PageIntro } from '@/components/marketing/page-intro';
import { Section } from '@/components/marketing/section';
import { TierCard } from '@/components/marketing/tier-card';
import { Faq } from '@/components/marketing/faq';
import { FinalCta } from '@/components/marketing/final-cta';
import { useResolvedLocale } from '@/lib/use-locale';

export function PricingPage() {
  const { t, dict, locale } = useResolvedLocale();

  return (
    <>
      <PageSeo
        title={t('meta.pricing.title')}
        description={t('meta.pricing.description')}
        path="/pricing"
        locale={locale}
      />
      <PageIntro
        eyebrow={t('pricing.intro.eyebrow')}
        heading={t('pricing.intro.heading')}
        sub={t('pricing.intro.sub')}
      />

      <Section
        id="pricing-pilot"
        eyebrow={t('pricing.pilotBanner.eyebrow')}
        heading={t('pricing.pilotBanner.heading')}
        variant="muted"
      >
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {t('pricing.pilotBanner.body')}
        </p>
      </Section>

      <Section id="pricing-tiers" heading={t('pricing.tiersHeading')}>
        <div className="grid gap-6 md:grid-cols-3">
          {dict.pricing.tiers.map((tier) => (
            <TierCard
              key={tier.id}
              name={tier.name}
              price={tier.price}
              period={tier.period}
              currency={dict.pricing.currency}
              description={tier.description}
              bullets={tier.bullets}
              cta={tier.cta}
              featured={tier.featured}
              featuredBadge={dict.pricing.featuredBadge}
            />
          ))}
        </div>
      </Section>

      <Section id="pricing-faq" heading={dict.pricing.faq.heading}>
        <Faq items={dict.pricing.faq.items} />
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
