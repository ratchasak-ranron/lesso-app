import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/form-feedback';
import { useResolvedLocale } from '@/lib/use-locale';
import { track } from '@/lib/analytics';
import { buildWaitlistMailto } from '@/lib/mailto';
import { WaitlistInputSchema, type WaitlistInput } from '@/lib/waitlist-schema';

interface PilotFormProps {
  /** Founder mailto recipient. Form opens user's mail client with this `to`. */
  to: string;
  /** Called after successful mailto open so the page can swap to a thank-you state. */
  onSubmitted: () => void;
}

/**
 * Pilot waitlist form. Validates client-side via RHF + Zod, then opens the
 * user's mail client with a pre-filled `mailto:` URL. No backend involved.
 *
 * Radix Checkbox is `<button role="checkbox">` (not `<input>`), so the
 * consent field uses `Controller` rather than `register`.
 */
export function PilotForm({ to, onSubmitted }: PilotFormProps) {
  const { locale, t } = useResolvedLocale();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistInput>({
    resolver: zodResolver(WaitlistInputSchema),
    // `consent` is `z.literal(true)` in the inferred output type, but the
    // form starts unchecked. RHF's `DefaultValues<T>` does not widen
    // literal types, so we cast through `unknown` here. The resolver
    // surfaces the `consentRequired` error at submit time if the user
    // never checks it — that's the intended UX, not a bug.
    defaultValues: {
      fullName: '',
      clinic: '',
      email: '',
      phone: '',
      lineId: '',
      message: '',
      consent: false as unknown as true,
      locale,
    },
  });

  function errMsg(key: string | undefined): string | undefined {
    if (!key) return undefined;
    return t(`pilot.errors.${key}`);
  }

  // `async` is intentional: makes RHF's `formState.isSubmitting` flip to
  // `true` while the handler runs, so the submit button can show its
  // localised "Opening…" copy + `disabled` state. The body is fast — the
  // async marker is the load-bearing part.
  async function onValid(data: WaitlistInput): Promise<void> {
    track('pilot_submit', { locale: data.locale });
    const url = buildWaitlistMailto(to, data);
    // Only flip to the success state when we actually triggered the
    // mail-client open. In SSR / non-browser environments, suppress the
    // success UI so the user isn't lied to.
    if (typeof window === 'undefined') return;
    window.location.href = url;
    onSubmitted();
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-5" noValidate>
      <input type="hidden" {...register('locale')} value={locale} readOnly />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">{t('pilot.form.fullName')}</Label>
          <Input
            id="fullName"
            autoComplete="name"
            {...register('fullName')}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-err' : undefined}
          />
          <FormError id="fullName-err">{errMsg(errors.fullName?.message)}</FormError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="clinic">{t('pilot.form.clinic')}</Label>
          <Input
            id="clinic"
            autoComplete="organization"
            {...register('clinic')}
            aria-invalid={!!errors.clinic}
            aria-describedby={errors.clinic ? 'clinic-err' : undefined}
          />
          <FormError id="clinic-err">{errMsg(errors.clinic?.message)}</FormError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t('pilot.form.email')}</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-err' : undefined}
          />
          <FormError id="email-err">{errMsg(errors.email?.message)}</FormError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="branches">{t('pilot.form.branches')}</Label>
          <Input
            id="branches"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            {...register('branches')}
            aria-invalid={!!errors.branches}
            aria-describedby={errors.branches ? 'branches-err' : undefined}
          />
          <FormError id="branches-err">{errMsg(errors.branches?.message)}</FormError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">{t('pilot.form.phone')}</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            {...register('phone')}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-err' : undefined}
          />
          <FormError id="phone-err">{errMsg(errors.phone?.message)}</FormError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lineId">{t('pilot.form.lineId')}</Label>
          <Input
            id="lineId"
            {...register('lineId')}
            aria-invalid={!!errors.lineId}
            aria-describedby={errors.lineId ? 'lineId-err' : undefined}
          />
          <FormError id="lineId-err">{errMsg(errors.lineId?.message)}</FormError>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">{t('pilot.form.message')}</Label>
        <Textarea
          id="message"
          rows={5}
          {...register('message')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-err' : undefined}
        />
        <FormError id="message-err">{errMsg(errors.message?.message)}</FormError>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-3">
          <Controller
            name="consent"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="consent"
                checked={field.value === true}
                onCheckedChange={(v) => field.onChange(v === true)}
                aria-invalid={!!errors.consent}
                aria-describedby={errors.consent ? 'consent-err' : undefined}
              />
            )}
          />
          <Label htmlFor="consent" className="cursor-pointer leading-snug">
            {t('pilot.form.consent')}
          </Label>
        </div>
        <FormError id="consent-err">{errMsg(errors.consent?.message)}</FormError>
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
        {isSubmitting ? t('pilot.form.submitting') : t('pilot.form.submit')}
      </Button>
    </form>
  );
}
