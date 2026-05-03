import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  id: string;
  eyebrow?: string;
  heading?: string;
  /** Optional sub-heading paragraph. */
  sub?: string;
  variant?: 'default' | 'muted';
  children: ReactNode;
  className?: string;
}

/**
 * Generic section wrapper — same horizontal rhythm as `EditorialHero`.
 * `id` provides the `aria-labelledby` target for the section heading.
 */
export function Section({ id, eyebrow, heading, sub, variant = 'default', children, className }: SectionProps) {
  return (
    <section
      aria-labelledby={heading ? `${id}-heading` : undefined}
      className={cn(
        'border-t border-border',
        variant === 'muted' ? 'bg-muted' : 'bg-background',
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        {eyebrow ? (
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-ink">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-indigo" />
            {eyebrow}
          </p>
        ) : null}
        {heading ? (
          <h2
            id={`${id}-heading`}
            className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl"
          >
            {heading}
          </h2>
        ) : null}
        {sub ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {sub}
          </p>
        ) : null}
        <div className={cn(eyebrow || heading || sub ? 'mt-12' : '')}>{children}</div>
      </div>
    </section>
  );
}
