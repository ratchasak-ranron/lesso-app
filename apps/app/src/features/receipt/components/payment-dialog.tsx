import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer } from 'lucide-react';
import {
  SERVICE_PRICE_TIERS,
  type Course,
  type Patient,
  type Receipt,
  type WalkIn,
} from '@lesso/domain';
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
import { Select, type SelectOption } from '@/components/ui/select';
import { FormError } from '@/components/ui/form-feedback';
import { formatCurrency } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import { useCtx } from '@/features/_shared/use-ctx';
import { useCreateReceipt } from '../hooks/use-receipts';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  walkIn: WalkIn | null;
  selectedCourse: Course | null;
  onPaid: (receipt: Receipt) => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  patient,
  walkIn,
  selectedCourse,
  onPaid,
}: PaymentDialogProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const ctx = useCtx();
  const createReceipt = useCreateReceipt();

  const [servicePrice, setServicePrice] = useState<number>(SERVICE_PRICE_TIERS[1]!);
  const [tip, setTip] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'line_pay'>(
    'cash',
  );
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const isCourseRedeem = !!selectedCourse;
  const subtotal = isCourseRedeem ? 0 : servicePrice;
  const total = Math.max(0, subtotal + tip - discount);

  const methodOptions: SelectOption[] = useMemo(
    () => [
      { value: 'cash', label: t('payment.method.cash') },
      { value: 'card', label: t('payment.method.card') },
      { value: 'transfer', label: t('payment.method.transfer') },
      { value: 'line_pay', label: t('payment.method.line_pay') },
    ],
    [t],
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!ctx.branchId) {
      setError(t('common.noTenant'));
      return;
    }
    submittingRef.current = true;
    setError(null);
    try {
      const lineItem = isCourseRedeem
        ? {
            description: selectedCourse!.serviceName,
            quantity: 1,
            unitPrice: 0,
            amount: 0,
            courseId: selectedCourse!.id,
            serviceName: selectedCourse!.serviceName,
            isCourseRedeem: true,
          }
        : {
            description: t('payment.walkInService'),
            quantity: 1,
            unitPrice: servicePrice,
            amount: servicePrice,
            isCourseRedeem: false,
          };
      const receipt = await createReceipt.mutateAsync({
        branchId: ctx.branchId,
        patientId: patient.id,
        appointmentId: undefined,
        walkInId: walkIn?.id,
        lineItems: [lineItem],
        tip,
        discount,
        paymentMethod: isCourseRedeem ? 'course_redeem' : paymentMethod,
      });
      onPaid(receipt);
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
          <DialogTitle>{t('payment.title')}</DialogTitle>
          <DialogDescription>{patient.fullName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isCourseRedeem ? (
            <div className="rounded-md bg-success/10 p-3 text-sm">
              <div className="font-medium">{selectedCourse!.serviceName}</div>
              <div className="text-muted-foreground">{t('payment.courseRedeemNote')}</div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="service-price">{t('payment.servicePrice')}</Label>
                <Input
                  id="service-price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={servicePrice}
                  onChange={(e) => setServicePrice(Number(e.target.value) || 0)}
                />
                <div className="flex flex-wrap gap-1.5">
                  {SERVICE_PRICE_TIERS.map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setServicePrice(p)}
                    >
                      {formatCurrency(p, locale)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tip">{t('payment.tip')}</Label>
                  <Input
                    id="tip"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={tip}
                    onChange={(e) => setTip(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="discount">{t('payment.discount')}</Label>
                  <Input
                    id="discount"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payment-method">{t('payment.method.label')}</Label>
                <Select
                  id="payment-method"
                  options={methodOptions}
                  value={paymentMethod}
                  onValueChange={(v) =>
                    setPaymentMethod(v as 'cash' | 'card' | 'transfer' | 'line_pay')
                  }
                />
              </div>
            </>
          )}

          <div className="rounded-md border border-border p-3">
            <div className="flex justify-between text-sm">
              <span>{t('payment.subtotal')}</span>
              <span className="tabular-nums">{formatCurrency(subtotal, locale)}</span>
            </div>
            {tip > 0 ? (
              <div className="flex justify-between text-sm">
                <span>{t('payment.tip')}</span>
                <span className="tabular-nums">{formatCurrency(tip, locale)}</span>
              </div>
            ) : null}
            {discount > 0 ? (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('payment.discount')}</span>
                <span className="tabular-nums">-{formatCurrency(discount, locale)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
              <span>{t('payment.total')}</span>
              <span className="tabular-nums">{formatCurrency(total, locale)}</span>
            </div>
          </div>

          <FormError>{error}</FormError>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createReceipt.isPending}>
              <Printer className="size-4" aria-hidden="true" />
              {t('payment.payAndPrint')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
