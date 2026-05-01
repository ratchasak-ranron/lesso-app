import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PreviewBadge() {
  const { t } = useTranslation();
  return (
    <Badge variant="secondary" className="inline-flex items-center gap-1" title={t('ai.previewTooltip')}>
      <Sparkles className="size-3" aria-hidden="true" />
      {t('ai.preview')}
    </Badge>
  );
}
