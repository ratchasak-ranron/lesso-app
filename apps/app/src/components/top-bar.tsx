import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileNav } from './mobile-nav';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { i18n, t } = useTranslation();
  const isThai = i18n.language === 'th';
  const nextLabel = isThai ? 'English' : 'ภาษาไทย';

  function toggleLanguage(): void {
    void i18n.changeLanguage(isThai ? 'en' : 'th');
  }

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b border-border bg-card px-2 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav />
        <h1 className="truncate font-heading text-xl font-semibold">{title}</h1>
      </div>
      {/*
       * Language toggle is modelled as a plain action Button (not a stateful
       * `aria-pressed` toggle) — pressing it switches to the OTHER language.
       * `aria-label` carries the target action so AT users hear "Switch to
       * English" / "Switch to Thai" instead of an ambiguous toggle state.
       */}
      <Button
        variant="ghost"
        onClick={toggleLanguage}
        aria-label={t('topbar.switchTo', { lang: nextLabel })}
        className="touch-target"
      >
        <Languages className="size-5" aria-hidden="true" />
        <span>{nextLabel}</span>
      </Button>
    </header>
  );
}
