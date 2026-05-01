import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientCard, usePatient } from '@/features/patient';
import { ActiveCoursesList } from '@/features/course';
import { VisitSummarySection } from '@/features/ai';
import { ConsentDialog } from '@/features/consent';
import { ExportButton } from '@/features/export';
import { LoyaltyCard } from '@/features/loyalty';

interface PatientDetailPageProps {
  patientId: string;
}

export function PatientDetailPage({ patientId }: PatientDetailPageProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePatient(patientId);
  const [consentOpen, setConsentOpen] = useState(false);

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
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setConsentOpen(true)}>
              <ShieldCheck className="size-4" aria-hidden="true" />
              {t('consent.captureCta')}
            </Button>
            <ExportButton patient={data} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ActiveCoursesList patientId={data.id} />
            <LoyaltyCard patient={data} />
          </div>
          <VisitSummarySection patient={data} />
          <ConsentDialog
            open={consentOpen}
            onOpenChange={setConsentOpen}
            patient={data}
          />
        </div>
      ) : null}
    </div>
  );
}
