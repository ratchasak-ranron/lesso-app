import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export interface TierCardProps {
  name: string;
  price: string;
  period: string;
  currency: string;
  description: string;
  bullets: string[];
  cta: string;
  featured?: boolean;
  /** Localised label for the featured-tier badge — pass via the locale dict. */
  featuredBadge?: string;
  /** Optional CTA href. When set, the CTA renders as a link instead of a
   *  disabled button. Pilot CTAs land on `/{locale}/pilot`. */
  href?: string;
  /** Tag forwarded to Plausible for cta_click attribution. */
  analyticsSource?: string;
  locale?: string;
}

export function TierCard({
  name,
  price,
  period,
  currency,
  description,
  bullets,
  cta,
  featured = false,
  featuredBadge,
  href,
  analyticsSource,
  locale,
}: TierCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col p-6 md:p-8',
        featured ? 'border-primary border-2 shadow-popover' : '',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-2xl font-semibold text-foreground">{name}</h3>
        {featured && featuredBadge ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            {featuredBadge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-heading text-4xl font-semibold tabular-nums text-foreground">
          {price}
        </span>
        <span className="text-sm text-muted-foreground">{currency}</span>
      </div>
      <p className="text-sm text-muted-foreground">{period}</p>
      <ul className="mt-6 space-y-2 text-sm" role="list">
        {bullets.map((b, i) => (
          // Composite key — bullets are translated free-text strings and
          // duplicates can occur across tiers ("Email support" appears in
          // both Solo and Clinic). `${name}-${i}` is stable per render
          // since `name` is the tier id and order is fixed.
          <li key={`${name}-${i}`} className="flex items-start gap-2">
            <Check
              className="mt-0.5 size-4 shrink-0 text-success"
              aria-hidden="true"
            />
            <span className="leading-relaxed text-foreground">{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex-1" />
      {href ? (
        <Button
          size="lg"
          variant={featured ? 'default' : 'outline'}
          className={cn('w-full', featured ? 'shadow-card' : '')}
          asChild
        >
          <a
            href={href}
            onClick={() =>
              track('cta_click', {
                source: analyticsSource ?? `tier-${name}`,
                locale: locale ?? 'unknown',
              })
            }
          >
            {cta}
          </a>
        </Button>
      ) : (
        <Button
          size="lg"
          variant={featured ? 'default' : 'outline'}
          className={cn('w-full', featured ? 'shadow-card' : '')}
          disabled
        >
          {cta}
        </Button>
      )}
    </Card>
  );
}
