import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { i18n, t } = useTranslation();

  function toggleLanguage(): void {
    const next = i18n.language === 'th' ? 'en' : 'th';
    void i18n.changeLanguage(next);
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <h1 className="font-heading text-xl font-semibold">{title}</h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        aria-label={t('common.switchLanguage')}
      >
        <Languages className="size-4" aria-hidden="true" />
        <span>{t('common.switchLanguage')}</span>
      </Button>
    </header>
  );
}
