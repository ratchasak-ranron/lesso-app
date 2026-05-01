import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Users, Plus } from 'lucide-react';
import type { Patient } from '@lesso/domain';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { displayPhone } from '@/lib/format';
import { usePatients } from '../hooks/use-patients';

interface PatientListProps {
  onSelect: (patient: Patient) => void;
  onAddNew: () => void;
}

export function PatientList({ onSelect, onAddNew }: PatientListProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const { data, isLoading, isError, error } = usePatients(debounced);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(id);
  }, [query]);

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
        <ul className="space-y-2" role="list">
          {data.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p)}
                className="w-full cursor-pointer text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
              >
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <div className="font-medium">{p.fullName}</div>
                      <div className="text-sm text-muted-foreground tabular-nums">
                        {displayPhone(p.phoneDigits)}
                        {p.lineId ? ` · ${p.lineId}` : ''}
                      </div>
                    </div>
                    <ConsentBadge status={p.consentStatus} t={t} />
                  </CardContent>
                </Card>
              </button>
            </li>
          ))}
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
