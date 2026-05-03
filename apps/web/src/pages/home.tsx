import {
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { PageSeo } from '@/components/seo/page-seo';
import { EditorialHero } from '@/components/layout/editorial-hero';
import { Section } from '@/components/marketing/section';
import { Faq } from '@/components/marketing/faq';
import { FinalCta } from '@/components/marketing/final-cta';
import { Card } from '@/components/ui/card';
import { useResolvedLocale } from '@/lib/use-locale';

const HOME_FEATURE_ICONS: Record<string, LucideIcon> = {
  course: GraduationCap,
  branches: Building2,
  line: MessageCircle,
  ai: Sparkles,
};

// Per-feature accent — rotates across the 4 cards. Each card gets a tinted
// top border + tinted icon to make the feature grid scannable and memorable
// while keeping body text on bone+slate.
interface FeatureAccentClasses {
  icon: string;
  iconBg: string;
}

const FALLBACK_ACCENT: FeatureAccentClasses = {
  icon: 'text-violet-ink',
  iconBg: 'bg-violet-soft',
};

const HOME_FEATURE_ACCENTS: Record<string, FeatureAccentClasses> = {
  course: FALLBACK_ACCENT,
  branches: {
    icon: 'text-sky-ink',
    iconBg: 'bg-sky-soft',
  },
  line: {
    icon: 'text-emerald-ink',
    iconBg: 'bg-emerald-soft',
  },
  ai: {
    icon: 'text-indigo-ink',
    iconBg: 'bg-indigo-soft',
  },
};

export function HomePage() {
  const { t, dict, locale } = useResolvedLocale();
  const featuresHref = `/${locale}/features`;
  const pricingHref = `/${locale}/pricing`;

  return (
    <>
      {/* Organization + FAQPage JSON-LD are injected per-route by
          `vite.config.ts → ssgOptions.onPageRendered`. No `<JsonLd>` here
          (it would emit a duplicate Organization block in the prerendered HTML). */}
      <PageSeo
        title={t('meta.home.title')}
        description={t('meta.home.description')}
        path="/"
        locale={locale}
      />
      <EditorialHero />

      <Section
        id="home-problem-solution"
        eyebrow={t('home.problemSolution.eyebrow')}
        heading={t('home.problemSolution.heading')}
        variant="muted"
      >
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="font-heading text-xl font-semibold text-foreground">
              {t('home.problemSolution.problemHeading')}
            </p>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-muted-foreground" role="list">
              {dict.home.problemSolution.problems.map((p) => (
                <li key={p} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-heading text-xl font-semibold text-foreground">
              {t('home.problemSolution.solutionHeading')}
            </p>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-foreground" role="list">
              {dict.home.problemSolution.solutions.map((s) => (
                <li key={s} className="flex gap-3">
                  <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        id="home-features"
        eyebrow={t('home.features.eyebrow')}
        heading={t('home.features.heading')}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dict.home.features.items.map((item) => {
            const Icon = HOME_FEATURE_ICONS[item.id] ?? GraduationCap;
            const accent = HOME_FEATURE_ACCENTS[item.id] ?? FALLBACK_ACCENT;
            return (
              <Card
                key={item.id}
                className="group p-6 transition-shadow duration-200 hover:shadow-hover"
              >
                <span
                  className={`inline-flex size-12 items-center justify-center rounded-xl ${accent.iconBg}`}
                  aria-hidden="true"
                >
                  <Icon className={`size-6 ${accent.icon}`} strokeWidth={2} />
                </span>
                <p className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </Card>
            );
          })}
        </div>
        <div className="mt-8">
          <a
            href={featuresHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t('nav.features')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </Section>

      <Section
        id="home-social-proof"
        eyebrow={t('home.socialProof.eyebrow')}
        heading={t('home.socialProof.heading')}
        variant="muted"
      >
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {t('home.socialProof.body')}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="flex h-16 items-center justify-center rounded-card border border-dashed border-border bg-background text-xs uppercase tracking-wide text-muted-foreground"
              aria-hidden="true"
            >
              Pilot · 0{n}
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="home-pricing"
        eyebrow={t('home.pricingTeaser.eyebrow')}
        heading={t('home.pricingTeaser.heading')}
      >
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {t('home.pricingTeaser.body')}
        </p>
        <div className="mt-8">
          <a
            href={pricingHref}
            className="inline-flex h-12 items-center gap-2 rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t('home.pricingTeaser.cta')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </Section>

      <Section
        id="home-faq"
        eyebrow={t('home.faq.eyebrow')}
        heading={t('home.faq.heading')}
        variant="muted"
      >
        <Faq items={dict.home.faq.items} />
      </Section>

      <FinalCta
        eyebrow={t('finalCta.eyebrow')}
        heading={t('finalCta.heading')}
        body={t('finalCta.body')}
        cta={t('finalCta.cta')}
        href={`/${locale}/pilot`}
        analyticsSource="home-final"
        locale={locale}
      />
    </>
  );
}
