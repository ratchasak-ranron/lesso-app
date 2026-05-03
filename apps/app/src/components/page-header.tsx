/* eslint-disable security/detect-object-injection -- accent is a constant union literal */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionAccent = 'indigo' | 'sky' | 'emerald' | 'violet' | 'amber' | 'rose' | 'zinc';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  /** Optional eyebrow rendered above the title. */
  eyebrow?: string;
  /** Section accent — colors the eyebrow dot. */
  accent?: SectionAccent;
}

const ACCENT_DOT: Record<SectionAccent, string> = {
  indigo: 'bg-indigo',
  sky: 'bg-sky',
  emerald: 'bg-emerald',
  violet: 'bg-violet',
  amber: 'bg-amber',
  rose: 'bg-rose',
  zinc: 'bg-foreground',
};

const ACCENT_TEXT: Record<SectionAccent, string> = {
  indigo: 'text-indigo-ink',
  sky: 'text-sky-ink',
  emerald: 'text-emerald-ink',
  violet: 'text-violet-ink',
  amber: 'text-amber-ink',
  rose: 'text-rose-ink',
  zinc: 'text-muted-foreground',
};

export function PageHeader({
  title,
  description,
  actions,
  className,
  eyebrow,
  accent = 'indigo',
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-3 sm:flex-nowrap',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p
            className={cn(
              'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider',
              ACCENT_TEXT[accent],
            )}
          >
            <span aria-hidden="true" className={cn('size-1.5 rounded-full', ACCENT_DOT[accent])} />
            {eyebrow}
          </p>
        ) : null}
        <h2 className={cn('text-3xl font-semibold tracking-[-0.02em]', eyebrow ? 'mt-1' : '')}>
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
