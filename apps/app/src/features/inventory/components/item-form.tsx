import { useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryItemCreateInput, InventoryUnit } from '@reinly/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { FormError } from '@/components/ui/form-feedback';
import { useDevToolbar } from '@/store/dev-toolbar';
import { useCreateInventoryItem } from '../hooks/use-inventory';

interface InventoryItemFormProps {
  onDone: () => void;
  onCancel: () => void;
}

const UNIT_OPTIONS: ReadonlyArray<InventoryUnit> = ['unit', 'box', 'ml', 'g', 'pack'];

export function InventoryItemForm({ onDone, onCancel }: InventoryItemFormProps) {
  const { t } = useTranslation();
  const branchId = useDevToolbar((s) => s.branchId);
  const create = useCreateInventoryItem();
  const submittingRef = useRef(false);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<InventoryUnit>('unit');
  const [initialStock, setInitialStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);

    if (!branchId) {
      setError(t('inventory.errors.branchRequired'));
      return;
    }
    if (!sku.trim() || !name.trim()) {
      setError(t('inventory.errors.required'));
      return;
    }
    if (initialStock < 0 || minStock < 0 || unitCost < 0) {
      setError(t('inventory.errors.numericInvalid'));
      return;
    }

    const input: InventoryItemCreateInput = {
      branchId,
      sku: sku.trim(),
      name: name.trim(),
      unit,
      initialStock,
      minStock,
      unitCost: unitCost > 0 ? unitCost : undefined,
    };

    submittingRef.current = true;
    create.mutate(input, {
      onSuccess: () => {
        submittingRef.current = false;
        onDone();
      },
      onError: (err) => {
        submittingRef.current = false;
        setError(err.message);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="item-sku">{t('inventory.sku')}</Label>
          <Input
            id="item-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="item-unit">{t('inventory.unit')}</Label>
          <Select
            id="item-unit"
            options={UNIT_OPTIONS.map((u) => ({ value: u, label: u }))}
            value={unit}
            onValueChange={(v) => setUnit(v as InventoryUnit)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="item-name">{t('inventory.itemName')}</Label>
        <Input id="item-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="item-initial">{t('inventory.initialStock')}</Label>
          <Input
            id="item-initial"
            type="number"
            inputMode="numeric"
            min={0}
            value={initialStock}
            onChange={(e) => setInitialStock(Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="item-min">{t('inventory.minStock')}</Label>
          <Input
            id="item-min"
            type="number"
            inputMode="numeric"
            min={0}
            value={minStock}
            onChange={(e) => setMinStock(Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="item-cost">{t('inventory.unitCost')}</Label>
          <Input
            id="item-cost"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={unitCost}
            onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <FormError>{error}</FormError>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
