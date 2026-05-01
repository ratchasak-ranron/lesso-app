import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import type { Patient } from '@lesso/domain';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useCtx } from '@/features/_shared/use-ctx';
import { logger } from '@/lib/logger';

interface ExportButtonProps {
  patient: Patient;
}

function toCsvRow(values: ReadonlyArray<string | number | null | undefined>): string {
  return values
    .map((v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(',');
}

export function ExportButton({ patient }: ExportButtonProps) {
  const { t } = useTranslation();
  const ctx = useCtx();
  const [exporting, setExporting] = useState(false);

  async function handleExport(): Promise<void> {
    if (exporting) return;
    setExporting(true);
    try {
      // PDPA Article 30 — patient data subject export.
      // Aggregate all owned records via api-client; build a single CSV blob.
      const [appointments, courses, receipts] = await Promise.all([
        apiClient.appointments.list(ctx, { patientId: patient.id }),
        apiClient.courses.list(ctx, { patientId: patient.id }),
        apiClient.receipts.list(ctx, { patientId: patient.id }),
      ]);

      const lines: string[] = [];
      lines.push('# Patient');
      lines.push(toCsvRow(['id', 'fullName', 'phone', 'lineId', 'consentStatus', 'createdAt']));
      lines.push(
        toCsvRow([
          patient.id,
          patient.fullName,
          patient.phoneDisplay,
          patient.lineId ?? '',
          patient.consentStatus,
          patient.createdAt,
        ]),
      );
      lines.push('');
      lines.push('# Appointments');
      lines.push(toCsvRow(['id', 'serviceName', 'startAt', 'endAt', 'status']));
      for (const a of appointments) {
        lines.push(toCsvRow([a.id, a.serviceName, a.startAt, a.endAt, a.status]));
      }
      lines.push('');
      lines.push('# Courses');
      lines.push(
        toCsvRow(['id', 'serviceName', 'sessionsTotal', 'sessionsUsed', 'pricePaid', 'status']),
      );
      for (const c of courses) {
        lines.push(
          toCsvRow([c.id, c.serviceName, c.sessionsTotal, c.sessionsUsed, c.pricePaid, c.status]),
        );
      }
      lines.push('');
      lines.push('# Receipts');
      lines.push(toCsvRow(['id', 'number', 'total', 'paymentMethod', 'createdAt']));
      for (const r of receipts) {
        lines.push(toCsvRow([r.id, r.number, r.total, r.paymentMethod ?? '', r.createdAt]));
      }

      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient-${patient.id}-export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Audit egress event (PDPA): subject export completed.
      try {
        await apiClient.audit.append(ctx, {
          action: 'patient.export',
          resourceType: 'patient',
          resourceId: patient.id,
          metadata: {
            counts: {
              appointments: appointments.length,
              courses: courses.length,
              receipts: receipts.length,
            },
          },
        });
      } catch (err) {
        logger.warn('audit.patient.export failed', {
          err: err instanceof Error ? err.message : 'unknown',
        });
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={exporting}>
      <Download className="size-4" aria-hidden="true" />
      {exporting ? t('export.inProgress') : t('export.cta')}
    </Button>
  );
}
