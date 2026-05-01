import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useDevToolbar } from '@/store/dev-toolbar';
import { CourseBalanceCard, useCourses } from '@/features/course';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export function CoursesPage() {
  const { t } = useTranslation();
  const tenantId = useDevToolbar((s) => s.tenantId);
  const { data, isLoading } = useCourses({ status: 'active' });

  if (!tenantId) {
    return <p className="text-muted-foreground">{t('common.noTenant')}</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl font-semibold tracking-tight">{t('course.title')}</h2>
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
            <Card key={c.id}>
              <CardContent className="p-0">
                <CourseBalanceCard course={c} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
