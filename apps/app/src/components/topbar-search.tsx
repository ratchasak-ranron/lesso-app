import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';
import type { Patient } from '@reinly/domain';
import { usePatients } from '@/features/patient';
import { displayPhone } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { cn } from '@/lib/utils';

const MAX_RESULTS = 8;

/**
 * Topbar global search — debounced patient lookup with a dropdown of
 * matches anchored to the input. Mounted in two places: the lg+ inline
 * search field, and the mobile sheet opened from the icon button.
 *
 * Variant `inline` renders the input + a positioned popover dropdown.
 * Variant `panel` renders the input full-width with the result list
 * stacked below (for the mobile sheet).
 */
interface TopbarSearchProps {
  variant: 'inline' | 'panel';
  onAfterSelect?: () => void;
  autoFocus?: boolean;
}

export function TopbarSearch({ variant, onAfterSelect, autoFocus }: TopbarSearchProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputId = useId();
  const listboxId = useId();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const debounced = useDebounce(query, 200);
  const trimmed = debounced.trim();
  const enabled = trimmed.length > 0;
  const { data, isLoading } = usePatients(enabled ? trimmed : '');

  const results = enabled ? (data ?? []).slice(0, MAX_RESULTS) : [];
  const hasResults = results.length > 0;
  const showPanel = open && enabled;

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmed, results.length]);

  useEffect(() => {
    if (variant !== 'inline') return;
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [variant]);

  function handleSelect(p: Patient) {
    setOpen(false);
    setQuery('');
    onAfterSelect?.();
    void navigate({ to: '/patients/$id', params: { id: p.id } });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showPanel || !hasResults) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // eslint-disable-next-line security/detect-object-injection -- activeIndex is bounded to results.length
      const match = results[activeIndex];
      if (match) handleSelect(match);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  }

  const inputClass =
    variant === 'inline'
      ? 'h-10 w-full rounded-full border border-input bg-background pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      : 'h-11 w-full rounded-md border border-input bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        {t('common.search')}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id={inputId}
        type="search"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={t('topbar.searchPlaceholder')}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          hasResults ? `${listboxId}-${activeIndex}` : undefined
        }
        className={inputClass}
      />
      {query ? (
        <button
          type="button"
          aria-label={t('common.close')}
          onClick={() => {
            setQuery('');
            setOpen(false);
          }}
          className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {showPanel ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={t('topbar.searchResults')}
          className={cn(
            variant === 'inline'
              ? 'absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-popover shadow-popover'
              : 'mt-3 max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-popover shadow-popover',
          )}
        >
          {isLoading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : !hasResults ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t('patient.noPatients')}
            </div>
          ) : (
            <ul className="py-1.5">
              {results.map((p, idx) => (
                <li key={p.id}>
                  <button
                    type="button"
                    role="option"
                    id={`${listboxId}-${idx}`}
                    aria-selected={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelect(p)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left transition-colors',
                      idx === activeIndex ? 'bg-muted' : 'hover:bg-muted',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                        avatarAccentFor(p.id),
                      )}
                    >
                      {initialsOf(p.fullName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {p.fullName}
                      </div>
                      <div className="truncate text-xs text-muted-foreground tabular-nums">
                        {displayPhone(p.phoneDigits)}
                        {p.lineId ? ` · ${p.lineId}` : ''}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

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

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}
