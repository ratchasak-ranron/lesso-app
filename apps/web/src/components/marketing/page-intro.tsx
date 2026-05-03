import { cn } from '@/lib/utils';

interface PageIntroProps {
  eyebrow: string;
  heading: string;
  sub: string;
  className?: string;
}

/**
 * Top-of-page header for non-Home routes. Mirrors `EditorialHero`'s rhythm
 * but smaller (h1 instead of hero-scale). Each non-Home page renders this
 * once at the top.
 */
export function PageIntro({ eyebrow, heading, sub, className }: PageIntroProps) {
  return (
    <section className={cn('relative bg-background', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[400px] bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--indigo-soft))_0%,transparent_70%)]"
      />
      <div className="mx-auto max-w-4xl px-6 pb-14 pt-16 md:pb-20 md:pt-24">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-ink">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-indigo" />
          {eyebrow}
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground md:text-6xl lg:text-7xl">
          {heading}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {sub}
        </p>
      </div>
    </section>
  );
}
