import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import type { AuditLog } from '@lesso/domain';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTime } from '@/lib/format';

interface AuditListProps {
  logs: AuditLog[] | undefined;
  isLoading: boolean;
}

export function AuditList({ logs, isLoading }: AuditListProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? 'th' : 'en';

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
    <ul className="divide-y divide-border" role="list">
      {logs.map((log) => (
        <li key={log.id} className="py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {formatDateTime(log.createdAt, locale)}
              </span>
              <Badge variant="outline">{t(`audit.action.${log.action}`)}</Badge>
              <span className="text-sm text-muted-foreground">{log.userName ?? '—'}</span>
            </div>
            {log.resourceId ? (
              <span className="font-mono text-xs text-muted-foreground" title={log.resourceId}>
                {log.resourceType}: <span className="break-all">{log.resourceId.slice(0, 8)}…</span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">{log.resourceType}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
