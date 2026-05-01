import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import type { AuditLog } from '@lesso/domain';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTime } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';

interface AuditListProps {
  logs: AuditLog[] | undefined;
  isLoading: boolean;
}

export function AuditList({ logs, isLoading }: AuditListProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  }
  if (!logs || logs.length === 0) {
    return <EmptyState icon={ShieldCheck} title={t('audit.empty')} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">
              {t('audit.col.when')}
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              {t('audit.col.action')}
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              {t('audit.col.actor')}
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              {t('audit.col.resource')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                {formatDateTime(log.createdAt, locale)}
              </td>
              <td className="px-4 py-2">
                <Badge variant="outline">{t(`audit.action.${log.action}`)}</Badge>
              </td>
              <td className="px-4 py-2 text-muted-foreground">{log.userName ?? '—'}</td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {log.resourceId ? (
                  <span title={log.resourceId}>
                    {log.resourceType}:{' '}
                    <span className="break-all">{log.resourceId.slice(0, 8)}…</span>
                  </span>
                ) : (
                  log.resourceType
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
