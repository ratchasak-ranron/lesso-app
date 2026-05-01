import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuditActionSchema, type AuditAction } from '@lesso/domain';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useDevToolbar } from '@/store/dev-toolbar';
import { AuditList, useAuditLog } from '@/features/audit';

// Derive from the domain enum so new actions land in the filter automatically.
const ACTION_OPTIONS: readonly AuditAction[] = AuditActionSchema.options;

function toAuditAction(value: string): AuditAction | undefined {
  if (!value) return undefined;
  const parsed = AuditActionSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function AuditPage() {
  const { t } = useTranslation();
  const tenantId = useDevToolbar((s) => s.tenantId);
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

  if (!tenantId) {
    return <p className="text-muted-foreground">{t('common.noTenant')}</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl font-semibold tracking-tight">{t('audit.title')}</h2>
      <p className="text-sm text-muted-foreground">{t('audit.description')}</p>

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
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-to">{t('audit.filter.to')}</Label>
          <Input id="audit-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {rangeError ? (
        <p
          className="rounded-md border border-warning/40 bg-warning/5 p-3 text-sm text-warning-foreground"
          role="alert"
          aria-live="polite"
        >
          {rangeError}
        </p>
      ) : null}
      {isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t('common.error')}: {error instanceof Error ? error.message : 'unknown'}
        </p>
      ) : null}
      <AuditList logs={data} isLoading={isLoading} />
    </div>
  );
}
