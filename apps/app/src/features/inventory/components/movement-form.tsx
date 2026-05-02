import { useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryItem, InventoryMovementType } from '@reinly/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormError } from '@/components/ui/form-feedback';
import { useApplyMovement } from '../hooks/use-inventory';

interface MovementFormProps {
  item: InventoryItem;
  onDone: () => void;
  onCancel: () => void;
}

export function MovementForm({ item, onDone, onCancel }: MovementFormProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<InventoryMovementType>('in');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const apply = useApplyMovement();
  const submittingRef = useRef(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);
    if (quantity <= 0 && type !== 'adjust') {
      setError(t('inventory.invalidQuantity'));
      return;
    }
    submittingRef.current = true;
    apply.mutate(
      {
        itemId: item.id,
        type,
        quantity,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          submittingRef.current = false;
          onDone();
        },
        onError: (err) => {
          submittingRef.current = false;
          setError(err.message);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md border border-border p-3">
        <div className="font-medium">{item.name}</div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {t('inventory.currentStock')}: {item.currentStock}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="movement-type">{t('inventory.movementType')}</Label>
        <Select
          id="movement-type"
          options={[
            { value: 'in', label: t('inventory.movement.in') },
            { value: 'out', label: t('inventory.movement.out') },
            { value: 'adjust', label: t('inventory.movement.adjust') },
          ]}
          value={type}
          onValueChange={(v) => setType(v as InventoryMovementType)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="quantity">
          {type === 'adjust' ? t('inventory.newStockLevel') : t('inventory.quantity')}
        </Label>
        <Input
          id="quantity"
          type="number"
          inputMode="numeric"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 0)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reason">{t('inventory.reason')}</Label>
        <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <FormError>{error}</FormError>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={apply.isPending}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
