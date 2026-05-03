/* eslint-disable security/detect-object-injection -- accent is a constant union literal */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EyebrowAccent = 'indigo' | 'sky' | 'emerald' | 'violet' | 'amber' | 'rose';

const EYEBROW_TEXT: Record<EyebrowAccent, string> = {
  indigo: 'text-indigo-ink',
  sky: 'text-sky-ink',
  emerald: 'text-emerald-ink',
  violet: 'text-violet-ink',
  amber: 'text-amber-ink',
  rose: 'text-rose-ink',
};

const EYEBROW_DOT: Record<EyebrowAccent, string> = {
  indigo: 'bg-indigo',
  sky: 'bg-sky',
  emerald: 'bg-emerald',
  violet: 'bg-violet',
  amber: 'bg-amber',
  rose: 'bg-rose',
};

interface FeatureSectionProps {
  id: string;
  eyebrow: string;
  heading: string;
  body: string;
  illustration: ReactNode;
  /** Alternates the column order. `right` puts illustration on the right. */
  align?: 'left' | 'right';
  /** Section accent — colors the eyebrow + dot. Defaults to indigo. */
  accent?: EyebrowAccent;
}

/**
 * One feature block — text column + illustration column. Anchor `id`
 * lets the pricing page deep-link (`/en/features#course`).
 */
export function FeatureSection({
  id,
  eyebrow,
  heading,
  body,
  illustration,
  align = 'right',
  accent = 'indigo',
}: FeatureSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="border-t border-border bg-background"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28">
        <div className={cn(align === 'left' ? 'md:order-2' : '')}>
          <p
            className={cn(
              'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]',
              EYEBROW_TEXT[accent],
            )}
          >
            <span aria-hidden="true" className={cn('size-1.5 rounded-full', EYEBROW_DOT[accent])} />
            {eyebrow}
          </p>
          <h2
            id={`${id}-heading`}
            className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl"
          >
            {heading}
          </h2>
          <p className="mt-5 max-w-prose text-base leading-relaxed text-muted-foreground md:text-lg">
            {body}
          </p>
        </div>
        <div
          className={cn(
            'flex items-center justify-center',
            align === 'left' ? 'md:order-1' : '',
          )}
        >
          {illustration}
        </div>
      </div>
    </section>
  );
}
