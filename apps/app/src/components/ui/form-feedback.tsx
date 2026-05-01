import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormFeedbackProps {
  id?: string;
  className?: string;
  children?: ReactNode;
}

export function FormError({ id, className, children }: FormFeedbackProps) {
  if (!children) return null;
  return (
    <p
      id={id}
      role="alert"
      aria-live="assertive"
      className={cn('text-sm text-destructive', className)}
    >
      {children}
    </p>
  );
}

export function FormStatus({ id, className, children }: FormFeedbackProps) {
  if (!children) return null;
  return (
    <p
      id={id}
      role="status"
      aria-live="polite"
      className={cn('text-sm text-muted-foreground', className)}
    >
      {children}
    </p>
  );
}
