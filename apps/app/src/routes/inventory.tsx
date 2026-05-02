import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryItem } from '@reinly/domain';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormError } from '@/components/ui/form-feedback';
import { useDevToolbar } from '@/store/dev-toolbar';
import { InventoryList, MovementForm, useInventoryItems } from '@/features/inventory';
import { PageHeader } from '@/components/page-header';
import { TenantGate } from '@/components/tenant-gate';

export function InventoryPage() {
  const { t } = useTranslation();
  const branchId = useDevToolbar((s) => s.branchId);
  const { data, isLoading, isError, error } = useInventoryItems(branchId);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  return (
    <TenantGate>
      <div className="space-y-4">
        <PageHeader title={t('inventory.title')} />
        {isError ? (
          <FormError className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
            {`${t('common.error')}: ${error.message}`}
          </FormError>
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
              <DialogDescription>{selectedItem ? selectedItem.name : ''}</DialogDescription>
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
    </TenantGate>
  );
}
