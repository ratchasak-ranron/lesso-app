import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        {featured ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            Pilot
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
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <Check
              className="mt-0.5 size-4 shrink-0 text-success"
              aria-hidden="true"
            />
            <span className="leading-relaxed text-foreground">{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex-1" />
      <Button
        size="lg"
        variant={featured ? 'default' : 'outline'}
        className={cn('w-full', featured ? 'shadow-card' : '')}
      >
        {cta}
      </Button>
    </Card>
  );
}
