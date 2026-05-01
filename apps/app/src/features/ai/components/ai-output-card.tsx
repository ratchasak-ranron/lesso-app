import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { logger } from '@/lib/logger';
import { useCtx } from '@/features/_shared/use-ctx';
import { PreviewBadge } from './preview-badge';

interface AiOutputCardProps {
  text: string;
  /**
   * Optional patient/resource id used as the audit-log resourceId when the
   * user copies AI-generated content to clipboard. PII (the actual `text`)
   * is intentionally never logged — only the ID and category.
   */
  resourceId?: string;
  resourceType?: string;
}

export function AiOutputCard({
  text,
  resourceId,
  resourceType = 'ai_output',
}: AiOutputCardProps) {
  const { t } = useTranslation();
  const ctx = useCtx();
  const [copied, setCopied] = useState(false);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      // Audit egress event (PDPA): copy = data left the app boundary.
      // ID-only payload — `text` never logged or persisted.
      if (ctx.tenantId) {
        try {
          await apiClient.audit.append(ctx, {
            action: 'ai.copy',
            resourceType,
            resourceId,
          });
        } catch (err) {
          logger.warn('audit.ai.copy failed', {
            err: err instanceof Error ? err.message : 'unknown',
          });
        }
      }
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
