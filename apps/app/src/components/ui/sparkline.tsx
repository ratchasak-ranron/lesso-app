/* eslint-disable security/detect-object-injection -- variant is a constant union literal */
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: ReadonlyArray<number>;
  ariaLabel: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const STROKE = {
  default: 'stroke-primary',
  success: 'stroke-success',
  warning: 'stroke-warning',
  destructive: 'stroke-destructive',
} as const;

/**
 * Tiny inline-SVG sparkline. Stays a stub — no axis, no tooltips, no animation
 * (Accessible & Ethical excludes motion-heavy decoration). Renders nothing
 * when data is empty so the call-site can stay declarative.
 */
export function Sparkline({ data, ariaLabel, className, variant = 'default' }: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = 100 / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = 100 - ((v - min) / range) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn('h-8 w-full', className)}
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={STROKE[variant]}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
