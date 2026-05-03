import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';

interface FinalCtaProps {
  eyebrow: string;
  heading: string;
  body: string;
  cta: string;
  /** Required when `asLink` is true. Pilot CTAs link to `/{locale}/pilot`. */
  href?: string;
  /** Tag forwarded to Plausible for cta_click attribution. */
  analyticsSource?: string;
  locale?: string;
}

/** Repeated bottom-of-page CTA block. Same voice as the hero. */
export function FinalCta({ eyebrow, heading, body, cta, href, analyticsSource, locale }: FinalCtaProps) {
  return (
    <section className="relative overflow-hidden border-t border-border bg-card">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[400px] bg-[radial-gradient(60%_70%_at_50%_100%,hsl(var(--indigo-soft))_0%,transparent_70%)]"
      />
      <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-ink">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-indigo" />
          {eyebrow}
        </p>
        <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground md:text-5xl lg:text-6xl">
          {heading}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {body}
        </p>
        {href ? (
          <Button size="lg" className="mt-10 shadow-card" asChild>
            <a
              href={href}
              onClick={() =>
                track('cta_click', {
                  source: analyticsSource ?? 'final-cta',
                  locale: locale ?? 'unknown',
                })
              }
            >
              {cta}
            </a>
          </Button>
        ) : (
          <Button size="lg" className="mt-10 shadow-card" disabled>
            {cta}
          </Button>
        )}
      </div>
    </section>
  );
}
