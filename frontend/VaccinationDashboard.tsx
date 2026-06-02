import { useEffect, useState } from 'react';
import {
  createVaccinationRecord,
  fetchVaccinationStatus
} from './api';
import { AddVaccinationForm } from './AddVaccinationForm';
import { VaccinationStatusList } from './VaccinationStatusList';
import {
  CreateVaccinationPayload,
  VaccinationStatusResponse
} from './types';

interface VaccinationDashboardProps {
  babyId: string;
  referenceDate?: string;
}

export function VaccinationDashboard({
  babyId,
  referenceDate
}: VaccinationDashboardProps) {
  const [data, setData] = useState<VaccinationStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSchedule() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetchVaccinationStatus(babyId, referenceDate);
        if (isMounted) {
          setData(response);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Could not load vaccination schedule.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSchedule();

    return () => {
      isMounted = false;
    };
  }, [babyId, referenceDate]);

  async function handleCreateVaccination(
    payload: CreateVaccinationPayload
  ): Promise<void> {
    setIsSubmitting(true);

    try {
      await createVaccinationRecord(babyId, payload);

      // Interview exercise:
      // After the POST succeeds, refresh the vaccination status list
      // so the UI reflects the new persisted record.
      //
      // Expected behavior:
      // 1. Re-fetch GET /vaccinations/status
      // 2. Update local state with the new schedule
      // 3. Keep error handling consistent with the initial load path
      const updatedStatus = await fetchVaccinationStatus(babyId, referenceDate);
      setData(updatedStatus);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Could not create vaccination record.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p>Loading vaccination schedule...</p>;
  }

  if (loadError) {
    return <p>Could not load vaccination data: {loadError}</p>;
  }

  if (!data) {
    return <p>No vaccination data found.</p>;
  }

  return (
    <main>
      <header>
        <h1>Baby Vaccination Record</h1>
        <p>Patient id: {data.babyId}</p>
        <p>Date of birth: {data.dateOfBirth}</p>
      </header>

      <AddVaccinationForm
        onSubmit={handleCreateVaccination}
        isSubmitting={isSubmitting}
      />

      <VaccinationStatusList schedule={data.schedule} />
    </main>
  );
}
