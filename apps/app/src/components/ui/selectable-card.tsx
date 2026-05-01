import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SelectableCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Explicit accessible name. List rows often concatenate name + meta + status,
   * which a screen-reader reads as a long mumble; pass a curated label here.
   */
  ariaLabel: string;
  selected?: boolean;
  children: ReactNode;
}

export const SelectableCard = forwardRef<HTMLButtonElement, SelectableCardProps>(
  function SelectableCard(
    { ariaLabel, selected = false, className, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        aria-pressed={selected}
        className={cn(
          'group relative w-full cursor-pointer rounded-xl border border-border bg-card text-card-foreground text-left transition-colors',
          'min-h-[44px]',
          'hover:border-primary/40 hover:bg-muted/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'aria-pressed:border-primary aria-pressed:bg-primary/5',
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
