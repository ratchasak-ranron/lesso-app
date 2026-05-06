import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, PackageSearch } from 'lucide-react';
import type { CourseCreateInput, Patient } from '@reinly/domain';
import { isCoursePackage } from '@reinly/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { FormError } from '@/components/ui/form-feedback';
import { usePatients } from '@/features/patient';
import { useProducts } from '@/store/product-store';
import { useCreateCourse } from '../hooks/use-courses';

interface CourseFormProps {
  patientId?: string;
  onDone: () => void;
  onCancel: () => void;
}

export function CourseForm({ patientId, onDone, onCancel }: CourseFormProps) {
  const { t } = useTranslation();
  const create = useCreateCourse();
  const products = useProducts();
  const submittingRef = useRef(false);

  const patientLocked = !!patientId;
  const patients = usePatients('');
  const patientOptions = useMemo(() => {
    const arr = patients.data ?? [];
    return arr.map((p: Patient) => ({ value: p.id, label: p.fullName }));
  }, [patients.data]);

  const packageProducts = useMemo(
    () => products.filter((p) => p.active && isCoursePackage(p)),
    [products],
  );
  const productOptions = useMemo(
    () => [
      { value: '', label: t('course.pickProductPlaceholder') },
      ...packageProducts.map((p) => ({
        value: p.id,
        label: t('course.productOption', {
          name: p.name,
          count: p.sessionsIncluded ?? 0,
        }),
      })),
    ],
    [packageProducts, t],
  );

  const [productId, setProductId] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>(
    patientId ?? patientOptions[0]?.value ?? '',
  );
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => packageProducts.find((p) => p.id === productId),
    [packageProducts, productId],
  );

  // Auto-pick the only available product so the form is filled in by
  // default when there is no real choice to make.
  useEffect(() => {
    if (!productId && packageProducts.length === 1) {
      setProductId(packageProducts[0]!.id);
    }
  }, [productId, packageProducts]);

  // The product store seeds via a useEffect on first sight of a tenant.
  // On the very first render the store may still be empty even when
  // seeding is about to fill it — without this gate the empty-catalog
  // callout would flash before the form. Initialise the gate to true
  // when the store is already populated so subsequent dialog opens
  // skip the skeleton entirely.
  const [storeSettled, setStoreSettled] = useState(() => packageProducts.length > 0);
  useEffect(() => {
    if (!storeSettled) {
      setStoreSettled(true);
    }
  }, [storeSettled]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);

    const pid = patientId ?? selectedPatient;
    if (!pid) {
      setError(t('course.errors.patientRequired'));
      return;
    }
    if (!selectedProduct) {
      setError(t('course.errors.productRequired'));
      return;
    }

    const input: CourseCreateInput = {
      patientId: pid,
      productId: selectedProduct.id,
      serviceName: selectedProduct.name,
      sessionsTotal: selectedProduct.sessionsIncluded ?? 1,
      pricePaid: selectedProduct.price,
      expiresAt: expiresAt ? `${expiresAt}T00:00:00.000Z` : undefined,
    };

    submittingRef.current = true;
    create.mutate(input, {
      onSuccess: () => {
        submittingRef.current = false;
        onDone();
      },
      onError: (err) => {
        submittingRef.current = false;
        setError(err.message);
      },
    });
  }

  if (!storeSettled) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10" />
        <Skeleton className="h-24" />
        <Skeleton className="h-10" />
      </div>
    );
  }

  if (packageProducts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-card border border-amber/40 bg-amber-soft p-4 text-sm text-amber-ink">
          <div className="flex items-start gap-3">
            <PackageSearch className="size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">{t('course.errors.noPackagesTitle')}</p>
              <p className="mt-1 text-xs">{t('course.errors.noPackagesBody')}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!patientLocked ? (
        <div className="space-y-1.5">
          <Label htmlFor="course-patient">{t('course.patient')}</Label>
          <Select
            id="course-patient"
            options={patientOptions}
            value={selectedPatient}
            onValueChange={setSelectedPatient}
            placeholder={patients.isLoading ? t('common.loading') : undefined}
            disabled={patients.isLoading}
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="course-product">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="size-4 text-violet-ink" aria-hidden="true" />
            {t('course.fromProduct')}
          </span>
        </Label>
        <Select
          id="course-product"
          options={productOptions}
          value={productId}
          onValueChange={setProductId}
          required
        />
        <p className="text-xs text-muted-foreground">{t('course.fromProductRequiredHelp')}</p>
      </div>

      {selectedProduct ? (
        <div className="rounded-card border border-border bg-muted/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('course.summary')}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <span className="text-muted-foreground">{t('course.service')}</span>
            <span className="font-medium text-foreground">{selectedProduct.name}</span>
            <span className="text-muted-foreground">{t('course.sessionsTotal')}</span>
            <span className="font-mono tabular-nums text-foreground">
              {selectedProduct.sessionsIncluded ?? 1}
            </span>
            <span className="text-muted-foreground">{t('course.pricePaid')}</span>
            <span className="font-mono tabular-nums text-foreground">
              {selectedProduct.price.toLocaleString()}
            </span>
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="course-expires">{t('course.expiresAt')}</Label>
        <Input
          id="course-expires"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>

      <FormError>{error}</FormError>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={create.isPending || !selectedProduct}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
