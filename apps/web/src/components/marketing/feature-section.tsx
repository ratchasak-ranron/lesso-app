import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeatureSectionProps {
  id: string;
  eyebrow: string;
  heading: string;
  body: string;
  illustration: ReactNode;
  /** Alternates the column order. `right` puts the illustration on the right (default for odd index). */
  align?: 'left' | 'right';
}

/**
 * One feature block — text column + illustration slot column. Anchor `id`
 * lets the pricing page deep-link (`/en/features#course`).
 */
export function FeatureSection({
  id,
  eyebrow,
  heading,
  body,
  illustration,
  align = 'right',
}: FeatureSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="border-t border-border bg-background"
    >
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-2 md:gap-14 md:py-24">
        <div className={cn(align === 'left' ? 'md:order-2' : '')}>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
          <h2
            id={`${id}-heading`}
            className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            {heading}
          </h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground md:text-lg">
            {body}
          </p>
        </div>
        <div className={cn('flex items-center justify-center', align === 'left' ? 'md:order-1' : '')}>
          {illustration}
        </div>
      </div>
    </section>
  );
}
