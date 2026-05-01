import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryItem } from '@lesso/domain';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDevToolbar } from '@/store/dev-toolbar';
import { InventoryList, MovementForm, useInventoryItems } from '@/features/inventory';

export function InventoryPage() {
  const { t } = useTranslation();
  const tenantId = useDevToolbar((s) => s.tenantId);
  const branchId = useDevToolbar((s) => s.branchId);
  const { data, isLoading, isError, error } = useInventoryItems(branchId);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  if (!tenantId) {
    return <p className="text-muted-foreground">{t('common.noTenant')}</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl font-semibold tracking-tight">
        {t('inventory.title')}
      </h2>
      {isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t('common.error')}: {error.message}
        </p>
      ) : null}
      <InventoryList items={data} isLoading={isLoading} onSelectItem={setSelectedItem} />

      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('inventory.newMovement')}</DialogTitle>
            <DialogDescription>
              {selectedItem ? selectedItem.name : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedItem ? (
            <MovementForm
              item={selectedItem}
              onCancel={() => setSelectedItem(null)}
              onDone={() => setSelectedItem(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
