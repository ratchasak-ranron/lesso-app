import { useTranslation } from 'react-i18next';
import { sessionsRemaining, type Course } from '@lesso/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/format';

interface CourseBalanceCardProps {
  course: Course;
}

export function CourseBalanceCard({ course }: CourseBalanceCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? 'th' : 'en';
  const remaining = sessionsRemaining(course);
  const percent = (course.sessionsUsed / course.sessionsTotal) * 100;
  const variant = remaining === 0 ? 'destructive' : remaining <= 1 ? 'warning' : 'default';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="min-w-0 break-words text-lg">{course.serviceName}</CardTitle>
          <Badge
            className="shrink-0"
            variant={variant === 'destructive' ? 'destructive' : variant === 'warning' ? 'warning' : 'success'}
          >
            {t('course.sessionsRemaining', { count: remaining })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress
          value={percent}
          variant={variant}
          aria-label={t('course.progressLabel', { service: course.serviceName })}
        />
        <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground tabular-nums">
          <span>
            {course.sessionsUsed} / {course.sessionsTotal}
          </span>
          {course.expiresAt ? (
            <span>
              {t('course.expiresAt')}: {formatDate(course.expiresAt, locale)}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
