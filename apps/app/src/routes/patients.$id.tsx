import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientCard, usePatient } from '@/features/patient';
import { ActiveCoursesList } from '@/features/course';

interface PatientDetailPageProps {
  patientId: string;
}

export function PatientDetailPage({ patientId }: PatientDetailPageProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePatient(patientId);

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/patients"
          className="inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('common.back')}
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </div>
      ) : null}
      {isError ? (
        <p className="text-destructive">{t('patient.patientNotFound')}</p>
      ) : null}
      {data ? (
        <div className="space-y-4">
          <PatientCard patient={data} />
          <ActiveCoursesList patientId={data.id} />
        </div>
      ) : null}
    </div>
  );
}
