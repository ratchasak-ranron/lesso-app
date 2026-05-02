import {
  Building2,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { PageSeo } from '@/components/seo/page-seo';
import { PageIntro } from '@/components/marketing/page-intro';
import { FeatureSection } from '@/components/marketing/feature-section';
import { FinalCta } from '@/components/marketing/final-cta';
import { useResolvedLocale } from '@/lib/use-locale';

const ICONS: Record<string, LucideIcon> = {
  course: GraduationCap,
  branches: Building2,
  line: MessageCircle,
  ai: Sparkles,
  pdpa: ShieldCheck,
};

// Decorative-only placeholder until real illustrations land in B4. The
// surrounding `FeatureSection` already names the block via its h2, so the
// illustration adds no semantic value — `aria-hidden` stops screen readers
// from announcing the heading twice.
function Illustration({ Icon }: { Icon: LucideIcon }) {
  return (
    <div
      className="flex aspect-[4/3] w-full max-w-md items-center justify-center rounded-card bg-muted shadow-card"
      aria-hidden="true"
    >
      <Icon className="size-20 text-primary/50" aria-hidden="true" strokeWidth={1.25} />
    </div>
  );
}

export function FeaturesPage() {
  const { t, dict, locale } = useResolvedLocale();

  return (
    <>
      <PageSeo
        title={t('meta.features.title')}
        description={t('meta.features.description')}
        path="/features"
        locale={locale}
      />
      <PageIntro
        eyebrow={t('features.intro.eyebrow')}
        heading={t('features.intro.heading')}
        sub={t('features.intro.sub')}
      />

      {dict.features.sections.map((section, idx) => {
        const Icon = ICONS[section.id] ?? GraduationCap;
        return (
          <FeatureSection
            key={section.id}
            id={section.id}
            eyebrow={section.eyebrow}
            heading={section.heading}
            body={section.body}
            illustration={<Illustration Icon={Icon} />}
            align={idx % 2 === 0 ? 'right' : 'left'}
          />
        );
      })}

      <FinalCta
        eyebrow={t('finalCta.eyebrow')}
        heading={t('finalCta.heading')}
        body={t('finalCta.body')}
        cta={t('finalCta.cta')}
      />
    </>
  );
}
