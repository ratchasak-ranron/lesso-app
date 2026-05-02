import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import type { Appointment, Course, Patient, Receipt } from '@reinly/domain';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useCtx } from '@/features/_shared/use-ctx';
import { logger } from '@/lib/logger';
import { FormError, FormStatus } from '@/components/ui/form-feedback';

interface ExportButtonProps {
  patient: Patient;
}

function toCsvRow(values: ReadonlyArray<string | number | null | undefined>): string {
  return values
    .map((v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      // RFC 4180: quote when value contains comma, double-quote, CR, or LF.
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(',');
}

function settled<T>(
  result: PromiseSettledResult<T>,
  fallback: T,
  label: string,
  failures: string[],
): T {
  if (result.status === 'fulfilled') return result.value;
  failures.push(`${label}: ${result.reason instanceof Error ? result.reason.message : 'failed'}`);
  return fallback;
}

export function ExportButton({ patient }: ExportButtonProps) {
  const { t } = useTranslation();
  const ctx = useCtx();
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partial, setPartial] = useState<string[]>([]);

  async function handleExport(): Promise<void> {
    if (exporting) return;
    setExporting(true);
    setError(null);
    setPartial([]);
    try {
      // PDPA Article 30 — patient data subject export.
      // Promise.allSettled: partial-source failure should still produce a
      // download (the data we DO have) plus a visible warning, never a
      // silent re-enable.
      const [apptsRes, coursesRes, receiptsRes] = await Promise.allSettled([
        apiClient.appointments.list(ctx, { patientId: patient.id }),
        apiClient.courses.list(ctx, { patientId: patient.id }),
        apiClient.receipts.list(ctx, { patientId: patient.id }),
      ]);
      const failures: string[] = [];
      const appointments = settled<Appointment[]>(apptsRes, [], 'appointments', failures);
      const courses = settled<Course[]>(coursesRes, [], 'courses', failures);
      const receipts = settled<Receipt[]>(receiptsRes, [], 'receipts', failures);

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

      if (failures.length > 0) {
        lines.unshift(`# WARNING: partial export — ${failures.join('; ')}`);
        setPartial(failures);
      }

      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Filename intentionally NOT including patient UUID — OS Recent Files,
      // browser history, and backup tools index this name. Date-only keeps
      // the file linkable to a date but not a patient.
      a.download = `pdpa-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

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
            partialFailures: failures.length > 0 ? failures.length : undefined,
          },
        });
      } catch (err) {
        logger.warn('audit.patient.export failed', {
          err: err instanceof Error ? err.message : 'unknown',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        onClick={handleExport}
        disabled={exporting}
        aria-busy={exporting}
      >
        <Download className="size-4" aria-hidden="true" />
        {exporting ? t('export.inProgress') : t('export.cta')}
      </Button>
      <FormError>{error}</FormError>
      {partial.length > 0 ? (
        <FormStatus className="text-xs text-warning">
          {t('export.partial')}: {partial.join('; ')}
        </FormStatus>
      ) : null}
    </div>
  );
}
