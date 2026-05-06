import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import type { TFunction } from 'i18next';
import {
  Cake,
  CalendarCheck2,
  CalendarPlus,
  Coins,
  Download,
  FileText,
  GraduationCap,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Trash2,
  User2,
  Users,
} from 'lucide-react';
import type { Appointment, Patient, Receipt } from '@reinly/domain';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination, usePagination } from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TenantGate } from '@/components/tenant-gate';
import { AppointmentForm } from '@/features/appointment';
import { CourseForm } from '@/features/course';
import {
  ConsentDialog,
  useConsentByPatient,
  useWithdrawConsent,
} from '@/features/consent';
import { ExportButton } from '@/features/export';
import { useAppointments } from '@/features/appointment/hooks/use-appointments';
import { useReceipts } from '@/features/receipt/hooks/use-receipts';
import { useLoyaltyAccount } from '@/features/loyalty/hooks/use-loyalty';
import {
  PatientForm,
  useDeletePatient,
  usePatient,
  useUpdatePatient,
} from '@/features/patient';
import { displayPhone, formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';
import { cn } from '@/lib/utils';

interface PatientDetailPageProps {
  patientId: string;
}

export function PatientDetailPage({ patientId }: PatientDetailPageProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const { data: patient, isLoading, isError } = usePatient(patientId);
  const [consentOpen, setConsentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);

  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();
  const withdrawConsent = useWithdrawConsent();
  const consentRecord = useConsentByPatient(patient?.id);

  function handleDelete() {
    if (!patient) return;
    deletePatient.mutate(patient.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        void navigate({ to: '/patients', replace: true });
      },
    });
  }

  function handleWithdraw() {
    const consentId = consentRecord.data?.active?.id;
    if (!patient || !consentId) return;
    withdrawConsent.mutate(
      { consentId, patientId: patient.id },
      { onSuccess: () => setWithdrawOpen(false) },
    );
  }

  return (
    <TenantGate>
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <div className="grid gap-4 lg:grid-cols-3">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
          </div>
        ) : null}

        {isError ? <p className="text-destructive">{t('patient.patientNotFound')}</p> : null}

        {patient ? (
          <>
            <PatientHeader
              patient={patient}
              locale={locale}
              t={t}
              onEdit={() => setEditOpen(true)}
              onDelete={() => setDeleteOpen(true)}
              onBookAppointment={() => setBookOpen(true)}
              onAddCourse={() => setCourseOpen(true)}
            />

            <div className="grid gap-4 lg:grid-cols-3">
              <BasicInfoCard patient={patient} locale={locale} t={t} />
              <AppointmentScheduleCard patientId={patient.id} locale={locale} t={t} />
              <div className="space-y-4">
                <MemberCard patient={patient} locale={locale} t={t} />
                <LoyaltyCard patient={patient} locale={locale} t={t} />
                <ConsentStatusCard
                  patient={patient}
                  locale={locale}
                  t={t}
                  onCapture={() => setConsentOpen(true)}
                  onWithdraw={
                    consentRecord.data?.active?.id ? () => setWithdrawOpen(true) : undefined
                  }
                />
                <DocumentsCard patient={patient} t={t} />
              </div>
            </div>

            <HistoryCard patientId={patient.id} locale={locale} t={t} />

            <ConsentDialog open={consentOpen} onOpenChange={setConsentOpen} patient={patient} />

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('patient.editPatient')}</DialogTitle>
                  <DialogDescription>{t('patient.fullName')}</DialogDescription>
                </DialogHeader>
                <PatientForm
                  initial={{
                    fullName: patient.fullName,
                    phoneDigits: patient.phoneDigits,
                    phoneDisplay: patient.phoneDisplay,
                    lineId: patient.lineId,
                    notes: patient.notes,
                  }}
                  isSubmitting={updatePatient.isPending}
                  onCancel={() => setEditOpen(false)}
                  onSubmit={(input) => {
                    updatePatient.mutate(
                      { id: patient.id, patch: input },
                      { onSuccess: () => setEditOpen(false) },
                    );
                  }}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('patient.detail.deleteTitle', { name: patient.fullName })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('patient.detail.deleteDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                    disabled={deletePatient.isPending}
                  >
                    {t('common.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('patient.detail.withdrawTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('patient.detail.withdrawDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleWithdraw}
                    disabled={withdrawConsent.isPending}
                  >
                    {t('patient.detail.withdrawConfirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Dialog open={bookOpen} onOpenChange={setBookOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('appointment.newAppointment')}</DialogTitle>
                  <DialogDescription>{patient.fullName}</DialogDescription>
                </DialogHeader>
                <AppointmentForm
                  patientId={patient.id}
                  onCancel={() => setBookOpen(false)}
                  onDone={() => setBookOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={courseOpen} onOpenChange={setCourseOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('course.newCourse')}</DialogTitle>
                  <DialogDescription>{patient.fullName}</DialogDescription>
                </DialogHeader>
                <CourseForm
                  patientId={patient.id}
                  onCancel={() => setCourseOpen(false)}
                  onDone={() => setCourseOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </>
        ) : null}
      </div>
    </TenantGate>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header — avatar + name + member badge + actions                            */
/* -------------------------------------------------------------------------- */

const AVATAR_ACCENTS = [
  'bg-sky-soft text-sky-ink',
  'bg-indigo-soft text-indigo-ink',
  'bg-emerald-soft text-emerald-ink',
  'bg-violet-soft text-violet-ink',
  'bg-amber-soft text-amber-ink',
  'bg-rose-soft text-rose-ink',
] as const;

function avatarAccentFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_ACCENTS[Math.abs(h) % AVATAR_ACCENTS.length] ?? AVATAR_ACCENTS[0];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

function PatientHeader({
  patient,
  locale,
  t,
  onEdit,
  onDelete,
  onBookAppointment,
  onAddCourse,
}: {
  patient: Patient;
  locale: 'en' | 'th';
  t: TFunction;
  onEdit: () => void;
  onDelete: () => void;
  onBookAppointment: () => void;
  onAddCourse: () => void;
}) {
  const isMember = patient.consentStatus === 'valid';
  const phoneHref = `tel:+${patient.phoneDigits}`;
  const lineHref = patient.lineId ? `https://line.me/R/ti/p/~${patient.lineId}` : undefined;
  return (
    <Card className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span
          aria-hidden="true"
          className={cn(
            'flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold',
            avatarAccentFor(patient.id),
          )}
        >
          {initialsOf(patient.fullName)}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-heading truncate text-2xl font-semibold tracking-tight text-foreground">
              {patient.fullName}
            </h1>
            {isMember ? (
              <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-ink">
                {t('patient.detail.memberBadge')}
              </span>
            ) : null}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarCheck2 className="size-3.5" aria-hidden="true" />
            {t('patient.detail.joinedSince', { date: formatDate(patient.createdAt, locale) })}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onBookAppointment}
          className="cursor-pointer"
        >
          <CalendarPlus className="size-4" aria-hidden="true" />
          {t('patient.bookAppointment')}
        </Button>
        <Button variant="outline" size="sm" onClick={onAddCourse} className="cursor-pointer">
          <GraduationCap className="size-4" aria-hidden="true" />
          {t('patient.addCourse')}
        </Button>
        <ActionIconLink
          href={lineHref}
          icon={MessageCircle}
          label={t('patient.detail.actions.lineChat')}
          disabled={!patient.lineId}
        />
        <ActionIconLink
          href={phoneHref}
          icon={Phone}
          label={t('patient.detail.actions.call')}
        />
        <ActionIconButton onClick={onEdit} icon={Pencil} label={t('patient.detail.actions.edit')} />
        <ActionIconButton
          onClick={onDelete}
          icon={Trash2}
          label={t('patient.detail.actions.delete')}
          tone="destructive"
        />
      </div>
    </Card>
  );
}

function ActionIconLink({
  href,
  icon: Icon,
  label,
  disabled,
}: {
  href: string | undefined;
  icon: typeof Phone;
  label: string;
  disabled?: boolean;
}) {
  const className =
    'inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-card transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-card';
  if (disabled || !href) {
    return (
      <span aria-disabled="true" aria-label={label} className={className} role="link">
        <Icon className="size-4" aria-hidden="true" />
      </span>
    );
  }
  return (
    <a href={href} aria-label={label} className={className}>
      <Icon className="size-4" aria-hidden="true" />
    </a>
  );
}

function ActionIconButton({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  tone?: 'destructive';
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-card shadow-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        tone === 'destructive'
          ? 'text-rose-ink hover:bg-rose-soft'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Basic info                                                                */
/* -------------------------------------------------------------------------- */

function BasicInfoCard({
  patient,
  locale,
  t,
}: {
  patient: Patient;
  locale: 'en' | 'th';
  t: TFunction;
}) {
  return (
    <Card className="p-5">
      <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
        {t('patient.detail.basicInfo')}
      </h2>
      <dl className="mt-4 space-y-4">
        <InfoRow icon={User2} label={t('patient.fullName')} value={patient.fullName} />
        <InfoRow
          icon={Cake}
          label={t('patient.birthDate')}
          value={patient.birthDate ? formatDate(patient.birthDate, locale) : '—'}
        />
        <InfoRow
          icon={Phone}
          label={t('patient.phone')}
          value={displayPhone(patient.phoneDigits)}
        />
        <InfoRow
          icon={Mail}
          label={t('patient.lineId')}
          value={patient.lineId ?? '—'}
        />
        {patient.nationalId ? (
          <InfoRow
            icon={Users}
            label={t('patient.nationalId')}
            value={maskNationalId(patient.nationalId)}
          />
        ) : null}
      </dl>
    </Card>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm font-medium text-foreground tabular-nums">
          {value}
        </dd>
      </div>
    </div>
  );
}

function maskNationalId(id: string): string {
  if (id.length < 13) return id;
  return `${id.slice(0, 1)}-${id.slice(1, 5)}-${id.slice(5, 10)}-${id.slice(10, 12)}-${id.slice(12)}`;
}

/* -------------------------------------------------------------------------- */
/*  Appointment schedule timeline                                             */
/* -------------------------------------------------------------------------- */

const STATUS_DOT: Record<string, string> = {
  scheduled: 'bg-sky',
  confirmed: 'bg-indigo',
  checked_in: 'bg-violet',
  in_progress: 'bg-amber',
  completed: 'bg-emerald',
  cancelled: 'bg-zinc',
  no_show: 'bg-rose',
};

function AppointmentScheduleCard({
  patientId,
  locale,
  t,
}: {
  patientId: string;
  locale: 'en' | 'th';
  t: TFunction;
}) {
  const { data, isLoading } = useAppointments({ patientId });

  const sorted = useMemo(() => {
    const arr = data ? [...data] : [];
    return arr.sort((a, b) => b.startAt.localeCompare(a.startAt));
  }, [data]);

  return (
    <Card className="p-5">
      <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
        {t('patient.detail.appointmentSchedule')}
      </h2>
      <div className="mt-4 max-h-[320px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('patient.detail.noAppointments')}
          </p>
        ) : (
          <ol role="list" className="relative space-y-4 pl-5">
            <span
              aria-hidden="true"
              className="absolute left-1.5 top-1 bottom-1 w-px bg-border"
            />
            {sorted.map((a) => (
              <TimelineItem key={a.id} appointment={a} locale={locale} t={t} />
            ))}
          </ol>
        )}
      </div>
    </Card>
  );
}

function TimelineItem({
  appointment,
  locale,
  t,
}: {
  appointment: Appointment;
  locale: 'en' | 'th';
  t: TFunction;
}) {
  const dot = STATUS_DOT[appointment.status] ?? 'bg-muted-foreground';
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className={cn(
          'absolute -left-5 top-1.5 size-3 rounded-full ring-4 ring-background',
          dot,
        )}
      />
      <div className="text-xs font-medium tabular-nums text-muted-foreground">
        {formatDate(appointment.startAt, locale)}
      </div>
      <div className="mt-1 rounded-lg border border-border bg-card px-3 py-2">
        <div className="text-sm font-medium text-foreground">{appointment.serviceName}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {t(`appointment.status.${appointment.status}`)}
          {appointment.notes ? ` · ${appointment.notes}` : ''}
        </div>
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Member card (gradient)                                                    */
/* -------------------------------------------------------------------------- */

function MemberCard({
  patient,
  locale,
  t,
}: {
  patient: Patient;
  locale: 'en' | 'th';
  t: TFunction;
}) {
  const memberNumber = membershipNumber(patient.id);
  const tier = membershipTier(patient);
  return (
    <div className="overflow-hidden rounded-card bg-gradient-to-br from-indigo via-indigo to-violet p-5 text-white shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold tracking-tight">
          {t('patient.detail.memberCard')}
        </h3>
        <Sparkles className="size-5" aria-hidden="true" />
      </div>
      <p className="mt-1 text-xs text-white/80">{t('patient.detail.memberNumber')}</p>
      <div className="mt-3 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur"
        >
          <span className="font-heading text-base font-bold">R</span>
        </span>
        <p className="font-mono text-xl font-semibold tracking-tight tabular-nums">
          {memberNumber}
        </p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/15 pt-3 text-xs">
        <div>
          <dt className="text-white/70">{t('patient.detail.memberSince')}</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {formatDate(patient.createdAt, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-white/70">{t('patient.detail.memberTier')}</dt>
          <dd className="mt-0.5 font-medium">{t(`patient.detail.tier.${tier}`)}</dd>
        </div>
      </dl>
    </div>
  );
}

function membershipNumber(id: string): string {
  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i);
    h1 = (h1 * 31 + c) | 0;
    h2 = (h2 * 17 + c) | 0;
  }
  const a = Math.abs(h1).toString().padStart(3, '0').slice(0, 3);
  const b = Math.abs(h2).toString().padStart(3, '0').slice(0, 3);
  const c = Math.abs(h1 ^ h2).toString().padStart(3, '0').slice(0, 3);
  const d = Math.abs(h1 * 7 + h2 * 13).toString().padStart(2, '0').slice(0, 2);
  return `${a}-${b}-${c}-${d}`;
}

function membershipTier(patient: Patient): 'standard' | 'priority' {
  // Patients with active PDPA consent + a LINE id get a higher-touch
  // priority tier; everyone else is standard. Cheap heuristic that does
  // not require a separate domain field for now.
  return patient.consentStatus === 'valid' && !!patient.lineId ? 'priority' : 'standard';
}

/* -------------------------------------------------------------------------- */
/*  Consent status card (compact)                                             */
/* -------------------------------------------------------------------------- */

const CONSENT_PILL: Record<Patient['consentStatus'], string> = {
  valid: 'bg-emerald-soft text-emerald-ink',
  expiring_soon: 'bg-amber-soft text-amber-ink',
  expired: 'bg-rose-soft text-rose-ink',
  missing: 'bg-muted text-muted-foreground',
};

function ConsentStatusCard({
  patient,
  locale,
  t,
  onCapture,
  onWithdraw,
}: {
  patient: Patient;
  locale: 'en' | 'th';
  t: TFunction;
  onCapture: () => void;
  onWithdraw?: () => void;
}) {
  const status = patient.consentStatus;
  const statusLabel =
    status === 'valid'
      ? t('patient.detail.consentValid')
      : status === 'expiring_soon'
        ? t('patient.detail.consentExpiringSoon')
        : status === 'expired'
          ? t('patient.detail.consentExpired')
          : t('patient.detail.consentMissing');
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck
            className={cn(
              'size-4',
              status === 'valid' ? 'text-emerald-ink' : 'text-muted-foreground',
            )}
            aria-hidden="true"
          />
          <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
            {t('patient.detail.consentCard')}
          </h3>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
            // eslint-disable-next-line security/detect-object-injection -- status is a constant union literal
            CONSENT_PILL[status],
          )}
        >
          {statusLabel}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground tabular-nums">
        {patient.consentExpiresAt
          ? `${t('patient.detail.expiry')}: ${formatDate(patient.consentExpiresAt, locale)}`
          : t('patient.detail.noExpiry')}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {status !== 'valid' ? (
          <Button variant="outline" size="sm" onClick={onCapture} className="cursor-pointer">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {t('consent.captureCta')}
          </Button>
        ) : null}
        {onWithdraw ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onWithdraw}
            className="cursor-pointer text-rose-ink hover:bg-rose-soft"
          >
            <ShieldOff className="size-4" aria-hidden="true" />
            {t('patient.detail.withdrawCta')}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Loyalty card (donut + balance)                                            */
/* -------------------------------------------------------------------------- */

function LoyaltyCard({
  patient,
  locale,
  t,
}: {
  patient: Patient;
  locale: 'en' | 'th';
  t: TFunction;
}) {
  const { data, isLoading } = useLoyaltyAccount(patient.id);
  const balance = data?.balance ?? 0;
  const lifetime = data?.lifetimeEarned ?? 0;
  const progress = lifetime === 0 ? 0 : Math.min(1, balance / Math.max(lifetime, 1));
  const circumference = 2 * Math.PI * 28;
  const dashArray = `${circumference * progress} ${circumference}`;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
          {t('patient.detail.loyaltyTitle')}
        </h3>
        <Coins className="size-4 text-violet-ink" aria-hidden="true" />
      </div>
      {isLoading ? (
        <Skeleton className="mt-4 h-24" />
      ) : (
        <div className="mt-4 flex items-center gap-4">
          <div className="relative size-20 shrink-0">
            <svg viewBox="0 0 64 64" className="size-20 -rotate-90" aria-hidden="true">
              <circle cx="32" cy="32" r="28" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="hsl(var(--violet))"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={dashArray}
                className="transition-[stroke-dasharray] duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-xl font-semibold tabular-nums">
                {formatNumber(balance, locale)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t('patient.detail.balance')}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('patient.detail.lifetime')}
              </div>
              <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {formatNumber(lifetime, locale)}
              </div>
            </div>
            <Button variant="outline" className="h-9 w-full">
              {t('patient.detail.redeem')}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Documents card                                                            */
/* -------------------------------------------------------------------------- */

function DocumentsCard({ patient, t }: { patient: Patient; t: TFunction }) {
  const docs: Array<{ key: string; label: string; size: string }> =
    patient.consentStatus === 'valid' || patient.consentStatus === 'expiring_soon'
      ? [
          { key: 'consent', label: 'PDPA_Consent.pdf', size: '128 KB' },
          { key: 'intake', label: 'Patient_Intake.pdf', size: '96 KB' },
        ]
      : [];
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
          {t('patient.detail.documents')}
        </h3>
        <ExportButton patient={patient} />
      </div>
      {docs.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('patient.detail.documentsEmpty')}</p>
      ) : (
        <ul role="list" className="mt-3 space-y-2">
          {docs.map((d) => (
            <li
              key={d.key}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
            >
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-soft text-rose-ink"
              >
                <FileText className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{d.label}</div>
                <div className="text-xs text-muted-foreground tabular-nums">{d.size}</div>
              </div>
              <button
                type="button"
                aria-label={t('patient.detail.downloadConsent')}
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Download className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  History (receipts) table                                                  */
/* -------------------------------------------------------------------------- */

const PAYMENT_PILL: Record<string, string> = {
  paid: 'bg-emerald-soft text-emerald-ink',
  draft: 'bg-amber-soft text-amber-ink',
  voided: 'bg-rose-soft text-rose-ink',
  refunded: 'bg-muted text-muted-foreground',
};

function HistoryCard({
  patientId,
  locale,
  t,
}: {
  patientId: string;
  locale: 'en' | 'th';
  t: TFunction;
}) {
  const { data, isLoading } = useReceipts({ patientId });
  const sorted = useMemo(() => {
    return data ? [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  }, [data]);
  const pagination = usePagination(sorted, 5);

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
          {t('patient.detail.history')}
        </h2>
      </div>
      {isLoading ? (
        <div className="space-y-2 p-5">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={FileText} title={t('patient.detail.historyEmpty')} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-2.5 font-medium">
                    {t('patient.detail.col.id')}
                  </th>
                  <th scope="col" className="px-5 py-2.5 font-medium">
                    {t('patient.detail.col.treatment')}
                  </th>
                  <th scope="col" className="px-5 py-2.5 font-medium">
                    {t('patient.detail.col.date')}
                  </th>
                  <th scope="col" className="px-5 py-2.5 font-medium">
                    {t('patient.detail.col.result')}
                  </th>
                  <th scope="col" className="px-5 py-2.5 font-medium">
                    {t('patient.detail.col.payment')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pagination.pageItems.map((r) => (
                  <ReceiptRow key={r.id} receipt={r} locale={locale} t={t} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-5 py-3">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
              pageSize={pagination.pageSize}
              onPageChange={pagination.setPage}
            />
          </div>
        </>
      )}
    </Card>
  );
}

function ReceiptRow({
  receipt,
  locale,
  t,
}: {
  receipt: Receipt;
  locale: 'en' | 'th';
  t: TFunction;
}) {
  const treatment =
    receipt.lineItems[0]?.serviceName ?? receipt.lineItems[0]?.description ?? '—';
  const isCompleted = receipt.status === 'paid';
  const resultLabel =
    receipt.status === 'paid'
      ? t('patient.detail.result.completed')
      : receipt.status === 'voided'
        ? t('patient.detail.result.voided')
        : receipt.status === 'refunded'
          ? t('patient.detail.result.refunded')
          : t('patient.detail.result.draft');
  const pill = PAYMENT_PILL[receipt.status] ?? 'bg-muted text-muted-foreground';
  return (
    <tr>
      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">#{receipt.number}</td>
      <td className="px-5 py-3 text-sm font-medium text-foreground">{treatment}</td>
      <td className="px-5 py-3 text-sm text-muted-foreground tabular-nums">
        {formatDate(receipt.paidAt ?? receipt.createdAt, locale)}
      </td>
      <td className="px-5 py-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            isCompleted ? 'text-emerald-ink' : 'text-muted-foreground',
          )}
        >
          {isCompleted ? (
            <ShieldCheck className="size-3.5" aria-hidden="true" />
          ) : null}
          {resultLabel}
        </span>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', pill)}>
            {receipt.status === 'paid'
              ? formatCurrency(receipt.total, locale)
              : t(`patient.detail.result.${receipt.status}`)}
          </span>
        </div>
      </td>
    </tr>
  );
}
