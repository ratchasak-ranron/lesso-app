import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import type { Patient } from '@reinly/domain';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PatientList, PatientForm, useCreatePatient } from '@/features/patient';
import { PageHeader } from '@/components/page-header';
import { TenantGate } from '@/components/tenant-gate';

export function PatientsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const createPatient = useCreatePatient();

  function handleSelect(p: Patient) {
    void navigate({ to: '/patients/$id', params: { id: p.id } });
  }

  return (
    <TenantGate>
      <div className="space-y-4">
        <PageHeader title={t('patient.title')} />
        <PatientList onSelect={handleSelect} onAddNew={() => setCreateOpen(true)} />

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('patient.newPatient')}</DialogTitle>
              <DialogDescription>{t('patient.fullName')}</DialogDescription>
            </DialogHeader>
            <PatientForm
              isSubmitting={createPatient.isPending}
              onCancel={() => setCreateOpen(false)}
              onSubmit={(input) => {
                createPatient.mutate(input, {
                  onSuccess: () => setCreateOpen(false),
                });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </TenantGate>
  );
}
