import { cn } from '@/lib/utils';

interface PageIntroProps {
  eyebrow: string;
  heading: string;
  sub: string;
  className?: string;
}

/**
 * Top-of-page header for non-Home routes. Mirrors `EditorialHero`'s rhythm
 * but smaller (h1 instead of hero-scale, terracotta rule below). Each
 * non-Home page renders this once at the top.
 */
export function PageIntro({ eyebrow, heading, sub, className }: PageIntroProps) {
  return (
    <section className={cn('bg-background', className)}>
      <div className="mx-auto max-w-4xl px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
        <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
          {heading}
        </h1>
        <hr className="mt-6 h-0 w-16 border-0 border-t-2 border-secondary" aria-hidden="true" />
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {sub}
        </p>
      </div>
    </section>
  );
}
