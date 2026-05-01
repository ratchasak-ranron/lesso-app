import {
  Calendar,
  Users,
  GraduationCap,
  Home,
  BarChart3,
  Package,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/' as const, icon: Home, labelKey: 'nav.today' as const, exact: true },
  { to: '/patients' as const, icon: Users, labelKey: 'nav.patients' as const, exact: false },
  { to: '/appointments' as const, icon: Calendar, labelKey: 'nav.appointments' as const, exact: false },
  { to: '/courses' as const, icon: GraduationCap, labelKey: 'nav.courses' as const, exact: false },
  { to: '/inventory' as const, icon: Package, labelKey: 'nav.inventory' as const, exact: false },
  { to: '/branches' as const, icon: Building2, labelKey: 'nav.branches' as const, exact: false },
  { to: '/reports' as const, icon: BarChart3, labelKey: 'nav.reports' as const, exact: false },
  { to: '/audit' as const, icon: ShieldCheck, labelKey: 'nav.audit' as const, exact: false },
];

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="hidden w-56 border-r border-border bg-card md:flex md:flex-col">
      <div className="px-6 py-5">
        <span className="font-heading text-2xl font-bold text-primary">{t('app.name')}</span>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label={t('nav.primary')}>
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted',
              '[&.active]:bg-primary/10 [&.active]:text-primary',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{t(labelKey)}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
