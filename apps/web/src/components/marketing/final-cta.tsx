import { Button } from '@/components/ui/button';

interface FinalCtaProps {
  eyebrow: string;
  heading: string;
  body: string;
  cta: string;
}

/** Repeated bottom-of-page CTA block. Same voice as the hero. */
export function FinalCta({ eyebrow, heading, body, cta }: FinalCtaProps) {
  return (
    <section className="border-t border-border bg-muted">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
          {heading}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {body}
        </p>
        <Button size="lg" className="mt-10 shadow-card" disabled>
          {cta}
        </Button>
      </div>
    </section>
  );
}
