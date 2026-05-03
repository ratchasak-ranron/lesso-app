/* eslint-disable security/detect-object-injection -- map keys are constant union literals (filter / accent enum) */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import {
  ChevronRight,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Users,
} from 'lucide-react';
import type { Patient } from '@reinly/domain';
import { PageHeader } from '@/components/page-header';
import { TenantGate } from '@/components/tenant-gate';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { usePatients } from '@/features/patient';
import { displayPhone, formatDate } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { useLocale } from '@/lib/use-locale';
import { cn } from '@/lib/utils';

type ConsentFilter = 'all' | 'valid' | 'expiring_soon' | 'missing_or_expired';

export function ConsentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ConsentFilter>('all');
  const debounced = useDebounce(query, 200);
  const { data, isLoading } = usePatients(debounced);

  const stats = useMemo(() => {
    const arr = data ?? [];
    return {
      total: arr.length,
      valid: arr.filter((p) => p.consentStatus === 'valid').length,
      expiring: arr.filter((p) => p.consentStatus === 'expiring_soon').length,
      missing: arr.filter(
        (p) => p.consentStatus === 'missing' || p.consentStatus === 'expired',
      ).length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const arr = data ?? [];
    return arr
      .filter((p) => {
        if (filter === 'all') return true;
        if (filter === 'valid') return p.consentStatus === 'valid';
        if (filter === 'expiring_soon') return p.consentStatus === 'expiring_soon';
        return p.consentStatus === 'missing' || p.consentStatus === 'expired';
      })
      .sort((a, b) =>
        // Surface the actionable rows (missing/expired/expiring) at the top.
        consentRank(a.consentStatus) - consentRank(b.consentStatus) ||
        a.fullName.localeCompare(b.fullName),
      );
  }, [data, filter]);

  return (
    <TenantGate>
      <div className="space-y-6">
        <PageHeader
          eyebrow={t('nav.consent')}
          accent="zinc"
          title={t('consent.title')}
          description={t('consent.subtitle')}
        />

        <section
          aria-label={t('consent.title')}
          className="grid grid-cols-2 gap-2 lg:grid-cols-4"
        >
          <StatTile
            label={t('consent.stats.total')}
            value={stats.total}
            icon={Users}
            accent="sky"
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <StatTile
            label={t('consent.stats.valid')}
            value={stats.valid}
            icon={ShieldCheck}
            accent="emerald"
            active={filter === 'valid'}
            onClick={() => setFilter('valid')}
          />
          <StatTile
            label={t('consent.stats.expiring')}
            value={stats.expiring}
            icon={ShieldAlert}
            accent="amber"
            active={filter === 'expiring_soon'}
            onClick={() => setFilter('expiring_soon')}
          />
          <StatTile
            label={t('consent.stats.missing')}
            value={stats.missing}
            icon={ShieldOff}
            accent="rose"
            active={filter === 'missing_or_expired'}
            onClick={() => setFilter('missing_or_expired')}
          />
        </section>

        <div className="relative">
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

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={ShieldCheck} title={t('patient.noPatients')} />
        ) : (
          <Card className="overflow-hidden p-0">
            <ul role="list" className="divide-y divide-border">
              {filtered.map((p) => (
                <li key={p.id}>
                  <PatientConsentRow
                    patient={p}
                    onSelect={() =>
                      void navigate({ to: '/patients/$id', params: { id: p.id } })
                    }
                    locale={locale}
                    consentLabel={t(`patient.consent.${p.consentStatus}`)}
                    sinceLabel={t('patient.since', {
                      date: formatDate(p.createdAt, locale),
                    })}
                  />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </TenantGate>
  );
}

function consentRank(status: Patient['consentStatus']): number {
  switch (status) {
    case 'expired':
      return 0;
    case 'missing':
      return 1;
    case 'expiring_soon':
      return 2;
    case 'valid':
      return 3;
  }
}

interface StatTileProps {
  label: string;
  value: number;
  icon: typeof Users;
  accent: 'sky' | 'emerald' | 'amber' | 'rose';
  active: boolean;
  onClick: () => void;
}

const STAT_ACCENT_BG: Record<StatTileProps['accent'], string> = {
  sky: 'bg-sky-soft text-sky-ink',
  emerald: 'bg-emerald-soft text-emerald-ink',
  amber: 'bg-amber-soft text-amber-ink',
  rose: 'bg-rose-soft text-rose-ink',
};

const STAT_ACCENT_DOT: Record<StatTileProps['accent'], string> = {
  sky: 'bg-sky',
  emerald: 'bg-emerald',
  amber: 'bg-amber',
  rose: 'bg-rose',
};

const STAT_ACCENT_RING: Record<StatTileProps['accent'], string> = {
  sky: 'ring-sky',
  emerald: 'ring-emerald',
  amber: 'ring-amber',
  rose: 'ring-rose',
};

function StatTile({ label, value, icon: Icon, accent, active, onClick }: StatTileProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center justify-between gap-3 rounded-card border bg-card p-4 text-left shadow-card transition-all hover:shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active ? cn('ring-2 ring-offset-1', STAT_ACCENT_RING[accent]) : 'border-border',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden="true" className={cn('size-1.5 rounded-full', STAT_ACCENT_DOT[accent])} />
        <span className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </span>
        <span
          aria-hidden="true"
          className={cn('flex size-9 items-center justify-center rounded-lg', STAT_ACCENT_BG[accent])}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
      </div>
    </button>
  );
}

const CONSENT_PILL: Record<Patient['consentStatus'], string> = {
  valid: 'bg-emerald-soft text-emerald-ink',
  expiring_soon: 'bg-amber-soft text-amber-ink',
  expired: 'bg-rose-soft text-rose-ink',
  missing: 'bg-muted text-muted-foreground',
};

interface RowProps {
  patient: Patient;
  onSelect: () => void;
  locale: 'en' | 'th';
  consentLabel: string;
  sinceLabel: string;
}

function PatientConsentRow({ patient, onSelect, consentLabel, sinceLabel }: RowProps) {
  const phone = displayPhone(patient.phoneDigits);
  return (
    <button
      type="button"
      aria-label={`${patient.fullName}, ${phone}, ${consentLabel}`}
      onClick={onSelect}
      className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:bg-muted"
    >
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground"
      >
        {initialsOf(patient.fullName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{patient.fullName}</div>
        <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground tabular-nums">
          <span>{phone}</span>
          {patient.lineId ? <span>· {patient.lineId}</span> : null}
          <span className="hidden sm:inline">· {sinceLabel}</span>
        </div>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
          CONSENT_PILL[patient.consentStatus],
        )}
      >
        {consentLabel}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}
