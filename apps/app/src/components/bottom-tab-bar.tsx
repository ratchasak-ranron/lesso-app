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
        'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors min-h-[56px]',
        active ? accent.text : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      <span>{t(item.labelKey)}</span>
    </Link>
  );
}
