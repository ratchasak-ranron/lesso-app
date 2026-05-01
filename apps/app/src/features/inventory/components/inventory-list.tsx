import { useTranslation } from 'react-i18next';
import { AlertTriangle, Package } from 'lucide-react';
import { isLowStock, type InventoryItem } from '@lesso/domain';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

interface InventoryListProps {
  items: InventoryItem[] | undefined;
  isLoading: boolean;
  onSelectItem?: (item: InventoryItem) => void;
}

export function InventoryList({ items, isLoading, onSelectItem }: InventoryListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }
  if (!items || items.length === 0) {
    return <EmptyState icon={Package} title={t('inventory.noItems')} />;
  }

  return (
    <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3" role="list">
      {items.map((item) => {
        const low = isLowStock(item);
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelectItem?.(item)}
              className={cn(
                'w-full text-left rounded-xl transition-colors',
                onSelectItem
                  ? 'cursor-pointer hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  : 'cursor-default',
              )}
            >
              <Card>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    {low ? (
                      <AlertTriangle
                        className="size-4 text-warning"
                        aria-label={t('inventory.lowStock')}
                      />
                    ) : null}
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {item.sku} · {t('inventory.unit')}: {item.unit}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn('font-semibold tabular-nums', low ? 'text-warning' : '')}>
                      {item.currentStock}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {t('inventory.minStock')}: {item.minStock}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
