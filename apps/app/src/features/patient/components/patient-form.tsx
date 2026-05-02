import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { PatientCreateInput } from '@reinly/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormError } from '@/components/ui/form-feedback';
import { normalizePhone } from '@/lib/phone';

interface PatientFormProps {
  initial?: Partial<PatientCreateInput>;
  onSubmit: (input: PatientCreateInput) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function PatientForm({ initial, onSubmit, isSubmitting, onCancel }: PatientFormProps) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [phoneInput, setPhoneInput] = useState(initial?.phoneDisplay ?? '');
  const [lineId, setLineId] = useState(initial?.lineId ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) {
      setError(t('patient.errors.fullNameRequired'));
      return;
    }
    const digits = normalizePhone(phoneInput);
    if (digits.length < 8) {
      setError(t('patient.errors.phoneInvalid'));
      return;
    }
    onSubmit({
      fullName: fullName.trim(),
      phoneDigits: digits,
      phoneDisplay: phoneInput.trim(),
      lineId: lineId.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">{t('patient.fullName')}</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">{t('patient.phone')}</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lineId">{t('patient.lineId')}</Label>
        <Input id="lineId" value={lineId} onChange={(e) => setLineId(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">{t('patient.notes')}</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <FormError>{error ? `${t('common.error')}: ${error}` : null}</FormError>
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
