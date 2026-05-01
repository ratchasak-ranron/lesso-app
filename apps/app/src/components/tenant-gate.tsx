import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import { useDevToolbar } from '@/store/dev-toolbar';
import { EmptyState } from '@/components/ui/empty-state';

interface TenantGateProps {
  children: ReactNode;
}

export function TenantGate({ children }: TenantGateProps) {
  const tenantId = useDevToolbar((s) => s.tenantId);
  const { t } = useTranslation();
  if (!tenantId) {
    return <EmptyState icon={Building2} title={t('common.noTenant')} />;
  }
  return <>{children}</>;
}
