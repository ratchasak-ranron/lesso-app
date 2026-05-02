import { useTranslation } from 'react-i18next';
import { AlertTriangle, Phone } from 'lucide-react';
import type { Patient } from '@reinly/domain';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { displayPhone } from '@/lib/format';

interface PatientCardProps {
  patient: Patient;
  compact?: boolean;
}

export function PatientCard({ patient, compact = false }: PatientCardProps) {
  const { t } = useTranslation();
  const consentVariant =
    patient.consentStatus === 'valid'
      ? 'success'
      : patient.consentStatus === 'expiring_soon'
        ? 'warning'
        : patient.consentStatus === 'expired'
          ? 'destructive'
          : 'outline';
  return (
    <Card>
      <CardHeader className={compact ? 'pb-2' : undefined}>
        <h3 className="font-heading text-xl font-semibold">{patient.fullName}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
          <Phone className="size-4" aria-hidden="true" />
          {displayPhone(patient.phoneDigits)}
          {patient.lineId ? <span>· {patient.lineId}</span> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('patient.consentStatus')}:</span>
          <Badge variant={consentVariant}>{t(`patient.consent.${patient.consentStatus}`)}</Badge>
        </div>
        {patient.consentStatus === 'expiring_soon' || patient.consentStatus === 'expired' ? (
          <div className="flex items-start gap-2 rounded-md bg-warning/10 p-2 text-sm">
            <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden="true" />
            <span className="text-warning-foreground">
              {t(`patient.consent.${patient.consentStatus}`)}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
