import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuditActionSchema, type AuditAction } from '@lesso/domain';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { AuditList, useAuditLog } from '@/features/audit';
import { PageHeader } from '@/components/page-header';
import { TenantGate } from '@/components/tenant-gate';
import { FormError } from '@/components/ui/form-feedback';

// Derive from the domain enum so new actions land in the filter automatically.
const ACTION_OPTIONS: readonly AuditAction[] = AuditActionSchema.options;

function toAuditAction(value: string): AuditAction | undefined {
  if (!value) return undefined;
  const parsed = AuditActionSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function AuditPage() {
  const { t } = useTranslation();
  const [action, setAction] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  // Surface inverted-range mistakes directly — server `inRange` would
  // silently return an empty list otherwise.
  const rangeError = from && to && from > to ? t('audit.filter.invalidRange') : null;

  const query = useMemo(
    () => ({
      action: toAuditAction(action),
      from: !rangeError && from ? from : undefined,
      to: !rangeError && to ? to : undefined,
    }),
    [action, from, to, rangeError],
  );

  const { data, isLoading, isError, error } = useAuditLog(query);

  const actionOptions = useMemo(
    () => [
      { value: '', label: t('audit.filter.allActions') },
      ...ACTION_OPTIONS.map((a) => ({ value: a, label: t(`audit.action.${a}`) })),
    ],
    [t],
  );

  return (
    <TenantGate>
    <div className="space-y-4">
      <PageHeader title={t('audit.title')} description={t('audit.description')} />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="audit-action">{t('audit.filter.action')}</Label>
          <Select
            id="audit-action"
            options={actionOptions}
            value={action}
            onValueChange={setAction}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-from">{t('audit.filter.from')}</Label>
          <Input
            id="audit-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-invalid={!!rangeError}
            aria-describedby={rangeError ? 'audit-range-error' : undefined}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-to">{t('audit.filter.to')}</Label>
          <Input
            id="audit-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-invalid={!!rangeError}
            aria-describedby={rangeError ? 'audit-range-error' : undefined}
          />
        </div>
      </div>

      {rangeError ? (
        <p
          id="audit-range-error"
          className="rounded-md border border-warning/40 bg-warning/5 p-3 text-sm text-warning-foreground"
          role="alert"
          aria-live="polite"
        >
          {rangeError}
        </p>
      ) : null}
      {isError ? (
        <FormError className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
          {`${t('common.error')}: ${error instanceof Error ? error.message : 'unknown'}`}
        </FormError>
      ) : null}
      <AuditList logs={data} isLoading={isLoading} />
    </div>
    </TenantGate>
  );
}
