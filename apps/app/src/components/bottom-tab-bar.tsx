import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { NAV_ITEMS, ACCENT_CLASSES, type NavItem } from './nav-items';
import { useIsRouteActive } from './use-is-route-active';
import { cn } from '@/lib/utils';

export function BottomTabBar() {
  const { t } = useTranslation();
  const items = NAV_ITEMS.filter((i) => i.primary);

  return (
    <nav
      aria-label={t('nav.primary')}
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map((item) => (
        <BottomTabItem key={item.to} item={item} />
      ))}
    </nav>
  );
}

function BottomTabItem({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const active = useIsRouteActive(item);
  const Icon = item.icon;
  const accent = ACCENT_CLASSES[item.accent];
  return (
    <Link
      to={item.to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
        active ? accent.text : 'text-muted-foreground',
      )}
    >
      {/* Active indicator pill — sits above the icon. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1 h-1 w-8 rounded-full transition-all',
          active ? accent.bg : 'bg-transparent',
        )}
      />
      <Icon
        className="size-5"
        strokeWidth={active ? 2.25 : 1.75}
        aria-hidden="true"
      />
      <span className="truncate">{t(item.labelKey)}</span>
    </Link>
  );
}
