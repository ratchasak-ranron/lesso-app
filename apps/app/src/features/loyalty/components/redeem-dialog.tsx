import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins } from 'lucide-react';
import type { Patient } from '@lesso/domain';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatNumber } from '@/lib/format';
import { useRedeemPoints } from '../hooks/use-loyalty';

interface RedeemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  availableBalance: number;
}

const PRESETS = [100, 200, 500, 1000];

export function RedeemDialog({ open, onOpenChange, patient, availableBalance }: RedeemDialogProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? 'th' : 'en';
  const redeem = useRedeemPoints();
  const [points, setPoints] = useState<number>(100);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  // Reset on open (mirror ConsentDialog pattern).
  useEffect(() => {
    if (open) {
      setPoints(Math.min(100, availableBalance));
      setError(null);
    }
  }, [open, availableBalance]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);
    // Fractional / NaN / over-balance / zero — all rejected client-side so the
    // user gets a typed message instead of a generic 4xx surface from Zod.
    if (
      !Number.isInteger(points) ||
      points < 1 ||
      points > availableBalance
    ) {
      setError(t('loyalty.errors.invalidPoints'));
      return;
    }
    submittingRef.current = true;
    try {
      await redeem.mutateAsync({ patientId: patient.id, points });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="size-5 text-primary" aria-hidden="true" />
            {t('loyalty.redeemTitle')}
          </DialogTitle>
          <DialogDescription>{patient.fullName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md border border-border p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('loyalty.balance')}</span>
              <span className="font-medium tabular-nums">
                {formatNumber(availableBalance, locale)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="redeem-points">{t('loyalty.pointsToRedeem')}</Label>
            <Input
              id="redeem-points"
              type="number"
              inputMode="numeric"
              step={1}
              min={1}
              max={availableBalance}
              value={points}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPoints(Number.isFinite(v) ? Math.trunc(v) : 0);
              }}
            />
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.filter((p) => p <= availableBalance).map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPoints(p)}
                >
                  {formatNumber(p, locale)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-between rounded-md bg-success/10 p-3 text-sm">
            <span>{t('loyalty.equivalentDiscount')}</span>
            <span className="font-medium tabular-nums">{formatCurrency(points, locale)}</span>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert" aria-live="polite">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={
                redeem.isPending ||
                !Number.isInteger(points) ||
                points < 1 ||
                points > availableBalance
              }
            >
              {t('loyalty.redeemCta')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
