import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import type { Patient } from '@reinly/domain';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { displayPhone } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { usePatients } from '../hooks/use-patients';

interface PatientSearchProps {
  onSelect: (patient: Patient) => void;
  autoFocus?: boolean;
}

export function PatientSearch({ onSelect, autoFocus }: PatientSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 200);
  const { data, isLoading } = usePatients(debounced);

  const results = data ?? [];

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          autoFocus={autoFocus}
          className="pl-9"
          placeholder={t('patient.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('patient.searchPlaceholder')}
        />
      </div>
      {isLoading ? (
        <div className="space-y-1">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : null}
      {!isLoading && debounced && results.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('patient.noPatients')}</p>
      ) : null}
      {results.length > 0 ? (
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {results.slice(0, 25).map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p)}
                className="w-full cursor-pointer rounded-md text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="border-0 shadow-none">
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <div className="font-medium">{p.fullName}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {displayPhone(p.phoneDigits)}
                      </div>
                    </div>
                  </div>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
