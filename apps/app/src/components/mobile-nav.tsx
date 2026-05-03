import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { NAV_ITEMS, ACCENT_CLASSES, type NavItem } from './nav-items';
import { useIsRouteActive } from './use-is-route-active';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden touch-target"
          aria-label={t('nav.menu')}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-heading text-2xl font-bold text-primary">
            {t('app.name')}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3" aria-label={t('nav.primary')}>
          {NAV_ITEMS.map((item) => (
            <MobileNavItem key={item.to} item={item} onNavigate={() => setOpen(false)} />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const { t } = useTranslation();
  const active = useIsRouteActive(item);
  const Icon = item.icon;
  const accent = ACCENT_CLASSES[item.accent];
  return (
    <Link
      to={item.to}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={cn(
        'flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted',
        active && cn(accent.activeBg, accent.activeText),
      )}
    >
      <Icon
        className={cn('size-5 shrink-0', active ? accent.text : 'text-muted-foreground')}
        aria-hidden="true"
      />
      <span>{t(item.labelKey)}</span>
    </Link>
  );
}
