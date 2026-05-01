import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { getBranches, getTenants, getUsers, resetData } from '@lesso/mock-server';
import { Button } from '@/components/ui/button';
import { Select, type SelectOption } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDevToolbar } from '@/store/dev-toolbar';
import { cn } from '@/lib/utils';

function toOptions<T extends { id: string; name: string }>(
  items: ReadonlyArray<T>,
  emptyLabel: string,
): SelectOption[] {
  return [{ value: '', label: emptyLabel }, ...items.map((it) => ({ value: it.id, label: it.name }))];
}

export function DevToolbar() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const tenantId = useDevToolbar((s) => s.tenantId);
  const branchId = useDevToolbar((s) => s.branchId);
  const userId = useDevToolbar((s) => s.userId);
  const setTenant = useDevToolbar((s) => s.setTenant);
  const setBranch = useDevToolbar((s) => s.setBranch);
  const setUser = useDevToolbar((s) => s.setUser);
  const [collapsed, setCollapsed] = useState(false);

  const tenants = useMemo(() => getTenants(), []);
  const branches = useMemo(
    () => getBranches().filter((b) => b.tenantId === tenantId),
    [tenantId],
  );
  const users = useMemo(
    () => getUsers().filter((u) => u.tenantId === tenantId),
    [tenantId],
  );

  function invalidate(): void {
    void queryClient.invalidateQueries();
  }

  const tenantOptions = toOptions(tenants, t('devToolbar.none'));
  const branchOptions = toOptions(branches, t('devToolbar.none'));
  const userOptions = toOptions(users, t('devToolbar.none'));

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card text-card-foreground shadow-lg',
        'transition-transform',
        collapsed ? 'translate-y-[calc(100%-2.5rem)]' : 'translate-y-0',
      )}
      data-testid="dev-toolbar"
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex h-10 w-full items-center justify-between gap-2 px-4 text-sm font-medium hover:bg-muted"
        aria-expanded={!collapsed}
        aria-controls="dev-toolbar-body"
      >
        <span className="inline-flex items-center gap-2">
          <Wrench className="size-4" aria-hidden="true" />
          {t('devToolbar.title')}
        </span>
        {collapsed ? (
          <ChevronUp className="size-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4" aria-hidden="true" />
        )}
      </button>
      <div id="dev-toolbar-body" className="grid gap-3 p-4 md:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dt-tenant">{t('devToolbar.tenant')}</Label>
          <Select
            id="dt-tenant"
            options={tenantOptions}
            value={tenantId ?? ''}
            onValueChange={(v) => {
              setTenant(v ? v : null);
              invalidate();
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dt-branch">{t('devToolbar.branch')}</Label>
          <Select
            id="dt-branch"
            options={branchOptions}
            value={branchId ?? ''}
            onValueChange={(v) => {
              setBranch(v ? v : null);
              invalidate();
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dt-user">{t('devToolbar.user')}</Label>
          <Select
            id="dt-user"
            options={userOptions}
            value={userId ?? ''}
            onValueChange={(v) => {
              setUser(v ? v : null);
              invalidate();
            }}
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => {
              resetData();
              window.location.reload();
            }}
            className="w-full"
          >
            {t('devToolbar.reset')}
          </Button>
        </div>
      </div>
    </div>
  );
}
