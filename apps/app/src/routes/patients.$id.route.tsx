import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { IdSchema } from '@lesso/domain';
import { PatientDetailPage } from './patients.$id';

export function PatientDetailRouteComponent() {
  const { id } = useParams({ from: '/patients/$id' });
  const navigate = useNavigate();
  const parsed = IdSchema.safeParse(id);

  useEffect(() => {
    if (!parsed.success) {
      void navigate({ to: '/patients', replace: true });
    }
  }, [parsed.success, navigate]);

  if (!parsed.success) return null;
  return <PatientDetailPage patientId={parsed.data} />;
}
