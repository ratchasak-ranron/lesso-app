import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PreviewBadge } from './preview-badge';

interface AiOutputCardProps {
  text: string;
}

export function AiOutputCard({ text }: AiOutputCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — silent skip */
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
            {t('ai.output')}
          </span>
          <PreviewBadge />
        </div>
        <p className="whitespace-pre-wrap text-sm text-foreground">{text}</p>
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={copied}
          >
            {copied ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                {t('ai.copied')}
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden="true" />
                {t('ai.copy')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
