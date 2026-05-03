import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { NAV_ITEMS, ACCENT_CLASSES, type NavItem } from './nav-items';
import { useIsRouteActive } from './use-is-route-active';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-background md:flex md:flex-col">
      <div className="flex items-center gap-2 px-6 py-5">
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <span className="font-heading text-base font-bold">R</span>
        </span>
        <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
          {t('app.name')}
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 pb-3" aria-label={t('nav.primary')}>
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
  const accent = ACCENT_CLASSES[item.accent];
  return (
    <Link
      to={item.to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex min-h-[40px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? cn(accent.activeBg, accent.activeText)
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon
        className={cn(
          'size-[18px] shrink-0 transition-colors',
          active ? accent.text : 'text-muted-foreground group-hover:text-foreground',
        )}
        strokeWidth={active ? 2.25 : 1.75}
        aria-hidden="true"
      />
      <span className="truncate">{t(item.labelKey)}</span>
    </Link>
  );
}
