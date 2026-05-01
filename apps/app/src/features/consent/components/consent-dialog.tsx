import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import {
  REQUIRED_CONSENT_SCOPES,
  type ConsentScope,
  type Patient,
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
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useCaptureConsent } from '../hooks/use-consent';

const ALL_SCOPES: ConsentScope[] = ['medical_records', 'recall_contact', 'photo_marketing'];

interface ConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
}

export function ConsentDialog({ open, onOpenChange, patient }: ConsentDialogProps) {
  const { t } = useTranslation();
  const capture = useCaptureConsent();
  const submittingRef = useRef(false);
  const [scopes, setScopes] = useState<Set<ConsentScope>>(new Set(REQUIRED_CONSENT_SCOPES));
  const [duration, setDuration] = useState<string>('12');
  const [error, setError] = useState<string | null>(null);

  // Radix Dialog keeps the subtree mounted when `open` is false. Reset every
  // time the dialog opens so the previous patient's selections + error state
  // never leak across open/close cycles.
  useEffect(() => {
    if (open) {
      setScopes(new Set(REQUIRED_CONSENT_SCOPES));
      setDuration('12');
      setError(null);
    }
  }, [open]);

  function toggle(scope: ConsentScope): void {
    setScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope);
      else next.add(scope);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);
    if (scopes.size === 0) {
      setError(t('consent.errors.atLeastOneScope'));
      return;
    }
    submittingRef.current = true;
    try {
      await capture.mutateAsync({
        patientId: patient.id,
        scopes: Array.from(scopes),
        durationMonths: Number(duration),
      });
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
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            {t('consent.title')}
          </DialogTitle>
          <DialogDescription>{t('consent.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md border border-border p-3">
            <div className="font-medium">{patient.fullName}</div>
            <div className="text-sm text-muted-foreground tabular-nums">
              {patient.phoneDisplay}
            </div>
          </div>

          <fieldset className="space-y-2" aria-labelledby="consent-scopes-legend">
            <legend id="consent-scopes-legend" className="text-sm font-medium">
              {t('consent.scopesLegend')}
            </legend>
            {ALL_SCOPES.map((scope) => {
              const required = (REQUIRED_CONSENT_SCOPES as ConsentScope[]).includes(scope);
              return (
                <label
                  key={scope}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 rounded border-input accent-primary"
                    checked={scopes.has(scope)}
                    onChange={() => toggle(scope)}
                    disabled={required}
                    aria-describedby={`consent-scope-${scope}-desc`}
                  />
                  <span className="space-y-0.5">
                    <span className="font-medium">{t(`consent.scope.${scope}.label`)}</span>
                    <span
                      id={`consent-scope-${scope}-desc`}
                      className="block text-xs text-muted-foreground"
                    >
                      {t(`consent.scope.${scope}.description`)}
                      {required ? ` · ${t('consent.required')}` : ''}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor="consent-duration">{t('consent.duration')}</Label>
            <Select
              id="consent-duration"
              options={[
                { value: '6', label: t('consent.durationOptions.6m') },
                { value: '12', label: t('consent.durationOptions.12m') },
                { value: '24', label: t('consent.durationOptions.24m') },
                { value: '60', label: t('consent.durationOptions.60m') },
              ]}
              value={duration}
              onValueChange={setDuration}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={capture.isPending}>
              {t('consent.captureCta')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
