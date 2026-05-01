import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { NAV_ITEMS, type NavItem } from './nav-items';
import { useIsRouteActive } from './use-is-route-active';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="hidden w-56 border-r border-border bg-card md:flex md:flex-col">
      <div className="px-6 py-5">
        <span className="font-heading text-2xl font-bold text-primary">{t('app.name')}</span>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label={t('nav.primary')}>
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.to} item={item} />
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const active = useIsRouteActive(item);
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted',
        active ? 'bg-primary/10 text-primary' : '',
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span>{t(item.labelKey)}</span>
    </Link>
  );
}
