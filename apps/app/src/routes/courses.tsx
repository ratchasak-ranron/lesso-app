import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CourseBalanceCard, useCourses } from '@/features/course';
import { PageHeader } from '@/components/page-header';
import { TenantGate } from '@/components/tenant-gate';

export function CoursesPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useCourses({ status: 'active' });

  return (
    <TenantGate>
      <div className="space-y-4">
        <PageHeader title={t('course.title')} />
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : null}
        {!isLoading && (data?.length ?? 0) === 0 ? (
          <EmptyState icon={GraduationCap} title={t('course.noCourses')} />
        ) : null}
        {data && data.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <CourseBalanceCard key={c.id} course={c} />
            ))}
          </div>
        ) : null}
      </div>
    </TenantGate>
  );
}
