import { useTranslation } from 'react-i18next';
import { sessionsRemaining, type Course } from '@lesso/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CourseBalanceCardProps {
  course: Course;
}

export function CourseBalanceCard({ course }: CourseBalanceCardProps) {
  const { t } = useTranslation();
  const remaining = sessionsRemaining(course);
  const percent = (course.sessionsUsed / course.sessionsTotal) * 100;
  const variant = remaining === 0 ? 'destructive' : remaining <= 1 ? 'warning' : 'default';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{course.serviceName}</CardTitle>
          <Badge variant={variant === 'destructive' ? 'destructive' : variant === 'warning' ? 'warning' : 'success'}>
            {t('course.sessionsRemaining', { count: remaining })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={percent} variant={variant} />
        <div className="flex justify-between text-sm text-muted-foreground tabular-nums">
          <span>
            {course.sessionsUsed} / {course.sessionsTotal}
          </span>
          {course.expiresAt ? <span>{t('course.expiresAt')}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
