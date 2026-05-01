import { useTranslation } from 'react-i18next';
import { Link, useLocation } from '@tanstack/react-router';
import { NAV_ITEMS } from './nav-items';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <aside className="hidden w-56 border-r border-border bg-card md:flex md:flex-col">
      <div className="px-6 py-5">
        <span className="font-heading text-2xl font-bold text-primary">{t('app.name')}</span>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label={t('nav.primary')}>
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted',
                '[&.active]:bg-primary/10 [&.active]:text-primary',
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
