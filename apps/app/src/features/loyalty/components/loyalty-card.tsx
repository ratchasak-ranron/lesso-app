import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins } from 'lucide-react';
import type { Patient } from '@reinly/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import { useLoyaltyAccount } from '../hooks/use-loyalty';
import { RedeemDialog } from './redeem-dialog';

interface LoyaltyCardProps {
  patient: Patient;
}

export function LoyaltyCard({ patient }: LoyaltyCardProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data, isLoading, isError } = useLoyaltyAccount(patient.id);
  const [redeemOpen, setRedeemOpen] = useState(false);

  const balance = data?.balance ?? 0;
  const lifetime = data?.lifetimeEarned ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Coins className="size-5 text-primary" aria-hidden="true" />
          {t('loyalty.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-16" />
        ) : isError ? (
          <p className="text-sm text-destructive">{t('common.error')}</p>
        ) : (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">{t('loyalty.balance')}</span>
              <span className="font-heading text-3xl font-semibold tabular-nums">
                {formatNumber(balance, locale)}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-sm text-muted-foreground">
              <span>{t('loyalty.lifetimeEarned')}</span>
              <span className="tabular-nums">{formatNumber(lifetime, locale)}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setRedeemOpen(true)}
              disabled={balance < 100}
            >
              {t('loyalty.redeemCta')}
            </Button>
            {balance < 100 ? (
              <p className="text-xs text-muted-foreground">{t('loyalty.minBalanceHint')}</p>
            ) : null}
          </>
        )}
      </CardContent>
      <RedeemDialog
        open={redeemOpen}
        onOpenChange={setRedeemOpen}
        patient={patient}
        availableBalance={balance}
      />
    </Card>
  );
}
