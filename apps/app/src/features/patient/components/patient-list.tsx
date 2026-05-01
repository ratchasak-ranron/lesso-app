import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Users, Plus } from 'lucide-react';
import type { Patient } from '@lesso/domain';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { SelectableCard } from '@/components/ui/selectable-card';
import { displayPhone } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { usePatients } from '../hooks/use-patients';

interface PatientListProps {
  onSelect: (patient: Patient) => void;
  onAddNew: () => void;
}

export function PatientList({ onSelect, onAddNew }: PatientListProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 200);
  const { data, isLoading, isError, error } = usePatients(debounced);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder={t('patient.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('patient.searchPlaceholder')}
          className="max-w-md"
        />
        <Button onClick={onAddNew} className="cursor-pointer">
          <Plus className="size-4" aria-hidden="true" />
          {t('patient.newPatient')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : null}

      {isError ? (
        <p className="text-destructive">{error.message}</p>
      ) : null}

      {!isLoading && (data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Users}
          title={t('patient.noPatients')}
          description={t('patient.noPatientsHint')}
          action={
            <Button onClick={onAddNew}>
              <Plus className="size-4" aria-hidden="true" />
              {t('patient.newPatient')}
            </Button>
          }
        />
      ) : null}

      {data && data.length > 0 ? (
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3" role="list">
          {data.map((p) => {
            const phone = displayPhone(p.phoneDigits);
            const ariaLabel = `${p.fullName}, ${phone}, ${t(`patient.consent.${p.consentStatus}`)}`;
            return (
              <li key={p.id}>
                <SelectableCard ariaLabel={ariaLabel} onClick={() => onSelect(p)}>
                  <div className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.fullName}</div>
                      <div className="truncate text-sm text-muted-foreground tabular-nums">
                        {phone}
                        {p.lineId ? ` · ${p.lineId}` : ''}
                      </div>
                    </div>
                    <ConsentBadge status={p.consentStatus} t={t} />
                  </div>
                </SelectableCard>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function ConsentBadge({
  status,
  t,
}: {
  status: Patient['consentStatus'];
  t: TFunction;
}) {
  const variant =
    status === 'valid'
      ? 'success'
      : status === 'expiring_soon'
        ? 'warning'
        : status === 'expired'
          ? 'destructive'
          : 'outline';
  return <Badge variant={variant}>{t(`patient.consent.${status}`)}</Badge>;
}
