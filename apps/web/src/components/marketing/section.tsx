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
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
        ) : null}
        {heading ? (
          <h2
            id={`${id}-heading`}
            className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            {heading}
          </h2>
        ) : null}
        {sub ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {sub}
          </p>
        ) : null}
        <div className={cn(eyebrow || heading || sub ? 'mt-10' : '')}>{children}</div>
      </div>
    </section>
  );
}
