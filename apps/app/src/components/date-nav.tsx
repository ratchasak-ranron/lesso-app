import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dayjs } from '@/lib/dates';

interface DateNavProps {
  /** ISO date string (YYYY-MM-DD). */
  value: string;
  onChange: (next: string) => void;
}

export function DateNav({ value, onChange }: DateNavProps) {
  const { t } = useTranslation();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const isToday = value === today;

  function shift(deltaDays: number): void {
    onChange(dayjs(value).add(deltaDays, 'day').format('YYYY-MM-DD'));
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={t('dateNav.previous')}
        onClick={() => shift(-1)}
        className="touch-target"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </Button>
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('dateNav.selectDate')}
        className="w-44"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={t('dateNav.next')}
        onClick={() => shift(1)}
        className="touch-target"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onChange(today)}
        disabled={isToday}
        className="touch-target"
      >
        {t('dateNav.today')}
      </Button>
    </div>
  );
}
