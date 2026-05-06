import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Languages, LogOut, Search } from 'lucide-react';
import { getUsers } from '@reinly/mock-server';
import { Button } from '@/components/ui/button';
import { useDevToolbar } from '@/store/dev-toolbar';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from './breadcrumbs';
import { MobileNav } from './mobile-nav';

interface TopBarProps {
  /** Kept for API compatibility but no longer rendered — the breadcrumb
   *  trail replaces the static title. */
  title?: string;
}

/**
 * Top bar — Dentalica-inspired clinic theme. Renders a global search input
 * (placeholder for command-K), a notification bell with an unread dot, a
 * language toggle, and a user-profile chip showing the impersonated user
 * from the dev toolbar.
 *
 * Search is a passive placeholder for now (no command palette wired up).
 * Bell is decorative; the unread indicator is a static red dot until the
 * notification feature lands.
 */
export function TopBar(_props: TopBarProps) {
  const { i18n, t } = useTranslation();
  const isThai = i18n.language === 'th';
  const nextLabel = isThai ? 'English' : 'ภาษาไทย';

  const userId = useDevToolbar((s) => s.userId);
  const user = useMemo(() => {
    if (!userId) return null;
    return getUsers().find((u) => u.id === userId) ?? null;
  }, [userId]);

  function toggleLanguage(): void {
    void i18n.changeLanguage(isThai ? 'en' : 'th');
  }

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-3 md:px-6">
      {/* Left: mobile nav + breadcrumb chain. Breadcrumb truncates instead
          of pushing the search/profile cluster off-screen. */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <MobileNav />
        <Breadcrumbs />
      </div>

      {/* Search — collapses to icon-only on smaller widths so the breadcrumb
          gets first dibs on the remaining space. */}
      <div className="hidden max-w-sm flex-1 lg:block">
        <label htmlFor="topbar-search" className="sr-only">
          {t('common.search')}
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="topbar-search"
            type="search"
            placeholder={t('common.search')}
            className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>
      <button
        type="button"
        aria-label={t('common.search')}
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
      >
        <Search className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        {/* Notification bell — static red dot until the feature ships. */}
        <button
          type="button"
          aria-label={t('common.notifications')}
          className="relative inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Bell className="size-5" strokeWidth={1.75} aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-destructive ring-2 ring-card"
          />
        </button>

        {/* Language toggle. Action-style button per a11y guidance. */}
        <Button
          variant="ghost"
          onClick={toggleLanguage}
          aria-label={t('topbar.switchTo', { lang: nextLabel })}
          className="touch-target hidden md:inline-flex"
        >
          <Languages className="size-4" aria-hidden="true" />
          <span className="text-xs font-medium">{nextLabel}</span>
        </Button>

        {/* Divider */}
        <span aria-hidden="true" className="hidden h-8 w-px bg-border md:block" />

        {/* User-profile chip */}
        <UserChip name={user?.name ?? '—'} role={user?.role ?? null} t={t} />
      </div>
    </header>
  );
}

function initialsOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed === '—') return '·';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

function UserChip({
  name,
  role,
  t,
}: {
  name: string;
  role: string | null;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [open, setOpen] = useState(false);
  const signOut = useDevToolbar((s) => s.signOut);
  const roleLabel = role ? t(`role.${role}`, { defaultValue: role }) : null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={(e) => {
          // Close when focus leaves the chip + its menu.
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node | null)) {
            setOpen(false);
          }
        }}
        className={cn(
          'inline-flex cursor-pointer items-center gap-2.5 rounded-full pl-1 pr-3 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        )}
      >
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
        >
          {initialsOf(name)}
        </span>
        <span className="hidden flex-col text-left leading-tight md:flex">
          <span className="truncate text-xs font-medium text-foreground">{name}</span>
          {roleLabel ? (
            <span className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
              {roleLabel}
            </span>
          ) : null}
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={name}
          className="absolute right-0 top-[calc(100%+0.25rem)] z-40 w-44 overflow-hidden rounded-xl border border-border bg-popover shadow-popover"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
          >
            <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
            {t('login.signOut')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
