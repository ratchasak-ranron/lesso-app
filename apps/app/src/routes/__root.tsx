import { Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/page-shell';

export function RootLayout() {
  const { t } = useTranslation();
  return (
    <PageShell title={t('app.name')}>
      <Outlet />
    </PageShell>
  );
}
