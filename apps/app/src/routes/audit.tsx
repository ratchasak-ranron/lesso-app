import { useTranslation } from 'react-i18next';
import { useDevToolbar } from '@/store/dev-toolbar';
import { AuditList, useAuditLog } from '@/features/audit';

export function AuditPage() {
  const { t } = useTranslation();
  const tenantId = useDevToolbar((s) => s.tenantId);
  const { data, isLoading, isError, error } = useAuditLog();

  if (!tenantId) {
    return <p className="text-muted-foreground">{t('common.noTenant')}</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl font-semibold tracking-tight">{t('audit.title')}</h2>
      <p className="text-sm text-muted-foreground">{t('audit.description')}</p>
      {isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t('common.error')}: {error.message}
        </p>
      ) : null}
      <AuditList logs={data} isLoading={isLoading} />
    </div>
  );
}
