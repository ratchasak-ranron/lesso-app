import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Wallet } from 'lucide-react';
import { sessionsRemaining, type Course, type Patient, type Receipt, type WalkIn } from '@lesso/domain';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PatientSearch } from '@/features/patient';
import { useActiveCoursesForPatient, useDecrementCourse } from '@/features/course';
import { PaymentDialog } from '@/features/receipt';
import { AiButton, AiOutputCard, useRecallMessage } from '@/features/ai';
import { useCtx } from '@/features/_shared/use-ctx';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { useCreateWalkIn, useUpdateWalkIn } from '../hooks/use-walk-ins';

interface CheckInFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: (walkIn: WalkIn) => void;
}

type Step = 'select_patient' | 'confirm' | 'done';

export function CheckInFlow({ open, onOpenChange, onCompleted }: CheckInFlowProps) {
  const { t, i18n } = useTranslation();
  const ctx = useCtx();
  const [step, setStep] = useState<Step>('select_patient');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [walkIn, setWalkIn] = useState<WalkIn | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<Receipt | null>(null);
  const [recallText, setRecallText] = useState<string | null>(null);
  const recallMessage = useRecallMessage();

  const createWalkIn = useCreateWalkIn();
  const updateWalkIn = useUpdateWalkIn();
  const decrementCourse = useDecrementCourse();

  // Single-submit fence — guards against fast double-tap dispatching duplicate
  // mutation chains before React re-renders the disabled state.
  const submittingRef = useRef(false);

  function reset() {
    setStep('select_patient');
    setPatient(null);
    setWalkIn(null);
    setSelectedCourse(null);
    setError(null);
    setPaymentOpen(false);
    setLastReceipt(null);
    setRecallText(null);
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  async function handlePatientSelect(p: Patient) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setPatient(p);
    setError(null);
    if (!ctx.branchId) {
      setError(t('common.noTenant'));
      submittingRef.current = false;
      return;
    }
    try {
      const created = await createWalkIn.mutateAsync({
        branchId: ctx.branchId,
        patientId: p.id,
      });
      setWalkIn(created);
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      submittingRef.current = false;
    }
  }

  async function handleComplete() {
    if (submittingRef.current) return;
    if (!walkIn || !ctx.branchId) return;
    submittingRef.current = true;
    setError(null);
    let courseDecremented = false;
    try {
      if (selectedCourse) {
        await decrementCourse.mutateAsync({
          id: selectedCourse.id,
          input: {
            branchId: ctx.branchId,
            performedByUserId: ctx.userId ?? undefined,
          },
        });
        courseDecremented = true;
      }
      const updated = await updateWalkIn.mutateAsync({
        id: walkIn.id,
        patch: { status: 'completed', courseId: selectedCourse?.id },
      });
      setWalkIn(updated);
      setStep('done');
      onCompleted?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
      // Compensating rollback: if the course session was already burned but
      // walk-in failed to update, restore sessionsUsed. Best-effort — failure
      // here is logged but not surfaced (the original error is what user sees).
      if (courseDecremented && selectedCourse) {
        try {
          await apiClient.courses.update(ctx, selectedCourse.id, {
            sessionsTotal: selectedCourse.sessionsTotal,
          });
          // The mock API doesn't expose a direct decrement-reverse endpoint;
          // this is a TODO for A7 backend (idempotency key + reverse op).
          logger.warn('walk-in.complete failed after decrement — manual reconciliation needed', {
            courseId: selectedCourse.id,
            walkInId: walkIn.id,
          });
        } catch (rollbackErr) {
          logger.error('rollback failed', {
            err: rollbackErr instanceof Error ? rollbackErr.message : 'unknown',
          });
        }
      }
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>{t('walkIn.newWalkIn')}</SheetTitle>
          <SheetDescription>
            {step === 'select_patient'
              ? t('walkIn.checkInFlow.selectPatient')
              : step === 'confirm'
                ? t('walkIn.checkInFlow.confirmCourse')
                : t('walkIn.checkInFlow.done')}
          </SheetDescription>
        </SheetHeader>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {step === 'select_patient' ? (
          <PatientSearch onSelect={handlePatientSelect} autoFocus />
        ) : null}

        {step === 'confirm' && patient ? (
          <div className="space-y-4">
            <Card>
              <div className="p-4">
                <div className="font-heading text-lg font-semibold">{patient.fullName}</div>
                <div className="text-sm text-muted-foreground tabular-nums">
                  {patient.phoneDisplay}
                </div>
              </div>
            </Card>
            <ActiveCoursesPicker
              patientId={patient.id}
              selected={selectedCourse}
              onSelect={setSelectedCourse}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => handleClose(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleComplete}
                disabled={
                  createWalkIn.isPending ||
                  updateWalkIn.isPending ||
                  decrementCourse.isPending
                }
              >
                {t('walkIn.checkInFlow.complete')}
              </Button>
            </div>
          </div>
        ) : null}

        {step === 'done' && patient ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
            <h3 className="font-heading text-xl font-semibold">{t('walkIn.checkInFlow.done')}</h3>
            <p className="text-sm text-muted-foreground">{patient.fullName}</p>
            {selectedCourse ? (
              <p className="text-sm text-muted-foreground">
                {t('walkIn.checkInFlow.courseDecremented')}
              </p>
            ) : null}
            {lastReceipt ? (
              <p className="text-sm font-medium">
                {t('payment.receiptCreated', { number: lastReceipt.number })}
              </p>
            ) : null}
            <div className="flex gap-2">
              {!lastReceipt ? (
                <Button onClick={() => setPaymentOpen(true)}>
                  <Wallet className="size-4" aria-hidden="true" />
                  {t('payment.takePayment')}
                </Button>
              ) : null}
              <AiButton
                loading={recallMessage.isPending}
                onClick={() =>
                  recallMessage.mutate(
                    {
                      patientId: patient.id,
                      // patientName intentionally NOT sent — server resolves
                      // from patientId so PII never enters the API contract.
                      // Real LLM at A7 must continue to receive ID-only input.
                      serviceName: selectedCourse?.serviceName ?? 'follow-up',
                      // Stub default; A7 backend derives from real visit history.
                      weeksSinceLastVisit: 4,
                      remainingSessions: selectedCourse
                        ? selectedCourse.sessionsTotal - selectedCourse.sessionsUsed
                        : 0,
                      locale: i18n.language === 'th' ? 'th' : 'en',
                    },
                    { onSuccess: (data) => setRecallText(data.text) },
                  )
                }
              >
                {t('ai.recall.cta')}
              </AiButton>
              <Button variant="outline" onClick={() => handleClose(false)}>
                {t('common.save')}
              </Button>
            </div>
            {recallText ? (
              <div className="mt-3 w-full max-w-md text-left">
                <AiOutputCard
                  text={recallText}
                  resourceId={patient.id}
                  resourceType="patient"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </SheetContent>
      {patient ? (
        <PaymentDialog
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          patient={patient}
          walkIn={walkIn}
          selectedCourse={selectedCourse}
          onPaid={(receipt) => {
            setLastReceipt(receipt);
            // Browser print stub: real PDF generation lands in A7.
            try {
              window.print();
            } catch {
              /* print disabled — silent skip */
            }
          }}
        />
      ) : null}
    </Sheet>
  );
}

function ActiveCoursesPicker({
  patientId,
  selected,
  onSelect,
}: {
  patientId: string;
  selected: Course | null;
  onSelect: (course: Course | null) => void;
}) {
  const { t } = useTranslation();
  const { data, isLoading } = useActiveCoursesForPatient(patientId);
  if (isLoading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('course.noCourses')}</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t('course.activeCourses')}</p>
      {data.map((c) => {
        const remaining = sessionsRemaining(c);
        const isSelected = selected?.id === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(isSelected ? null : c)}
            disabled={remaining === 0}
            className={cn(
              'w-full cursor-pointer rounded-md border p-3 text-left transition-colors',
              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40',
              remaining === 0 ? 'cursor-not-allowed opacity-50' : '',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{c.serviceName}</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {t('course.sessionsRemaining', { count: remaining })}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
