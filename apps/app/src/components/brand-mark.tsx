import { cn } from '@/lib/utils';

type BrandMarkSize = 'sm' | 'md' | 'lg';

interface BrandMarkProps {
  size?: BrandMarkSize;
  className?: string;
}

const SIZE_CLASS: Record<BrandMarkSize, string> = {
  sm: 'size-8',
  md: 'size-9',
  lg: 'size-14',
};

/**
 * Reinly brand mark — favicon-aligned shape (rounded tile + lowercase
 * serif `r`) on the brand indigo→violet gradient. Used by the sidebar,
 * mobile nav, and login. Keep this component and
 * apps/app/public/favicon.svg in sync so the in-app emblem and the
 * browser tab read as the same mark.
 */
export function BrandMark({ size = 'md', className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'shrink-0 shadow-card',
        // eslint-disable-next-line security/detect-object-injection -- size is a constant union literal
        SIZE_CLASS[size],
        className,
      )}
    >
      <defs>
        <linearGradient id="reinly-brand-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="60%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="6" fill="url(#reinly-brand-grad)" />
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        fill="#F5F2EC"
        fontSize="22"
        fontFamily='Georgia, "Playfair Display", serif'
        fontWeight="700"
      >
        r
      </text>
    </svg>
  );
}
