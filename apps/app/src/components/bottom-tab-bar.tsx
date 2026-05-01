import { useTranslation } from 'react-i18next';
import { Link, useLocation } from '@tanstack/react-router';
import { NAV_ITEMS } from './nav-items';
import { cn } from '@/lib/utils';

export function BottomTabBar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const items = NAV_ITEMS.filter((i) => i.primary);

  return (
    <nav
      aria-label={t('nav.primary')}
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map(({ to, icon: Icon, labelKey, exact }) => {
        const active =
          exact || to === '/'
            ? pathname === to
            : pathname === to || pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors min-h-[56px]',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span>{t(labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
