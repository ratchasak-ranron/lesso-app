import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { ChevronRight, Plus, Search, Users } from 'lucide-react';
import type { Patient } from '@reinly/domain';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';
import { displayPhone, formatDate } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { useLocale } from '@/lib/use-locale';
import { cn } from '@/lib/utils';
import { usePatients } from '../hooks/use-patients';

interface PatientListProps {
  onSelect: (patient: Patient) => void;
  onAddNew: () => void;
}

type SortKey = 'recent' | 'name' | 'created';

export function PatientList({ onSelect, onAddNew }: PatientListProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const debounced = useDebounce(query, 200);
  const { data, isLoading, isError, error } = usePatients(debounced);

  const sorted = useMemo(() => {
    const arr = [...(data ?? [])];
    if (sort === 'name') arr.sort((a, b) => a.fullName.localeCompare(b.fullName));
    else if (sort === 'created') arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return arr;
  }, [data, sort]);

  return (
    <div className="space-y-5">
      {/* Toolbar — search, sort, primary CTA. Consent tracking lives on
          the dedicated /consent route, not here. */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('patient.searchPlaceholder')}
            aria-label={t('patient.searchPlaceholder')}
            className="h-11 w-full rounded-input border border-input bg-card pl-9 pr-3 text-sm shadow-card placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <SortMenu sort={sort} setSort={setSort} t={t} />
        <Button onClick={onAddNew} className="cursor-pointer">
          <Plus className="size-4" aria-hidden="true" />
          {t('patient.newPatient')}
        </Button>
      </div>

      {/* Loading / error / empty states. */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : null}

      {isError ? <p className="text-destructive">{error.message}</p> : null}

      {!isLoading && sorted.length === 0 ? (
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

      {/* Dense rows — avatar + name + phone/LINE/since + chevron. */}
      {sorted.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <ul role="list" className="divide-y divide-border">
            {sorted.map((p) => (
              <li key={p.id}>
                <PatientRow patient={p} onSelect={onSelect} t={t} locale={locale} />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  SortMenu — small accessible select for ordering                           */
/* -------------------------------------------------------------------------- */

function SortMenu({
  sort,
  setSort,
  t,
}: {
  sort: SortKey;
  setSort: (s: SortKey) => void;
  t: TFunction;
}) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="patient-sort"
        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        {t('patient.sort.label')}
      </label>
      <select
        id="patient-sort"
        value={sort}
        onChange={(e) => setSort(e.target.value as SortKey)}
        className="h-11 cursor-pointer rounded-input border border-input bg-card px-3 text-sm shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="recent">{t('patient.sort.recent')}</option>
        <option value="name">{t('patient.sort.name')}</option>
        <option value="created">{t('patient.sort.created')}</option>
      </select>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PatientRow — single dense row                                             */
/* -------------------------------------------------------------------------- */

interface PatientRowProps {
  patient: Patient;
  onSelect: (p: Patient) => void;
  t: TFunction;
  locale: 'en' | 'th';
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

// Stable accent rotation per patient id so avatars get a varied palette
// without relying on user input. 6 rotating tones keep it cohesive.
const AVATAR_ACCENTS = [
  'bg-sky-soft text-sky-ink',
  'bg-indigo-soft text-indigo-ink',
  'bg-emerald-soft text-emerald-ink',
  'bg-violet-soft text-violet-ink',
  'bg-amber-soft text-amber-ink',
  'bg-rose-soft text-rose-ink',
] as const;

function avatarAccentFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_ACCENTS[Math.abs(h) % AVATAR_ACCENTS.length] ?? AVATAR_ACCENTS[0];
}

function PatientRow({ patient, onSelect, t, locale }: PatientRowProps) {
  const phone = displayPhone(patient.phoneDigits);
  const since = formatDate(patient.createdAt, locale);
  const ariaLabel = `${patient.fullName}, ${phone}`;
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => onSelect(patient)}
      className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:bg-muted"
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
          avatarAccentFor(patient.id),
        )}
      >
        {initialsOf(patient.fullName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{patient.fullName}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
          <span>{phone}</span>
          {patient.lineId ? <span>· {patient.lineId}</span> : null}
          <span className="hidden sm:inline">· {t('patient.since', { date: since })}</span>
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
  );
}
