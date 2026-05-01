import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL ?? '';

export function FeedbackButton() {
  const { t } = useTranslation();
  if (!FEEDBACK_URL) return null;
  return (
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={t('feedback.cta')}
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      <span className="hidden sm:inline">{t('feedback.cta')}</span>
    </a>
  );
}
