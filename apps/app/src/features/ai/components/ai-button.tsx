import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { PreviewBadge } from './preview-badge';

interface AiButtonProps extends Omit<ButtonProps, 'variant'> {
  loading?: boolean;
  children: ReactNode;
}

export function AiButton({ loading, children, disabled, ...props }: AiButtonProps) {
  return (
    <Button variant="outline" disabled={loading || disabled} {...props}>
      <Sparkles
        className={loading ? 'size-4 animate-pulse text-primary' : 'size-4 text-primary'}
        aria-hidden="true"
      />
      <span>{children}</span>
      <PreviewBadge />
    </Button>
  );
}
