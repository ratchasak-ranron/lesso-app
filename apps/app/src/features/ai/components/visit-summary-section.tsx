import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Patient } from '@lesso/domain';
import { useAppointments } from '@/features/appointment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/lib/use-locale';
import { AiButton } from './ai-button';
import { AiOutputCard } from './ai-output-card';
import { useVisitSummary } from '../hooks/use-ai';

interface VisitSummarySectionProps {
  patient: Patient;
}

export function VisitSummarySection({ patient }: VisitSummarySectionProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const visitSummary = useVisitSummary();
  const [output, setOutput] = useState<string | null>(null);
  const appointments = useAppointments({ patientId: patient.id });
  const lastCompleted = (appointments.data ?? [])
    .filter((a) => a.status === 'completed')
    .sort((a, b) => b.startAt.localeCompare(a.startAt))[0];

  const sessionN = (appointments.data ?? []).filter((a) => a.status === 'completed').length;
  const serviceName = lastCompleted?.serviceName ?? 'Consultation';

  function handleGenerate(): void {
    visitSummary.mutate(
      { patientId: patient.id, serviceName, sessionN: Math.max(1, sessionN), locale },
      { onSuccess: (data) => setOutput(data.text) },
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('ai.visitSummary.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AiButton
          loading={visitSummary.isPending}
          onClick={handleGenerate}
          disabled={!lastCompleted}
        >
          {t('ai.visitSummary.cta')}
        </AiButton>
        {!lastCompleted ? (
          <p className="text-xs text-muted-foreground">{t('ai.visitSummary.noVisitsYet')}</p>
        ) : null}
        {output ? (
          <AiOutputCard text={output} resourceId={patient.id} resourceType="patient" />
        ) : null}
      </CardContent>
    </Card>
  );
}
