import { useTranslation } from 'react-i18next';
import type { Id } from '@lesso/domain';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveCoursesForPatient } from '../hooks/use-courses';
import { CourseBalanceCard } from './course-balance-card';

interface ActiveCoursesListProps {
  patientId: Id;
}

export function ActiveCoursesList({ patientId }: ActiveCoursesListProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useActiveCoursesForPatient(patientId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }
  if (isError || !data) {
    return <p className="text-sm text-destructive">{t('common.error')}</p>;
  }
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('course.noCourses')}</p>;
  }
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">{t('course.activeCourses')}</h4>
      <div className="grid gap-2">
        {data.map((c) => (
          <CourseBalanceCard key={c.id} course={c} />
        ))}
      </div>
    </div>
  );
}
