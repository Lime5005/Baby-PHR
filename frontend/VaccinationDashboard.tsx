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
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);

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
    setSubmitSuccessMessage(null);

    try {
      await createVaccinationRecord(babyId, payload);
      const updatedStatus = await fetchVaccinationStatus(babyId, referenceDate);
      setData(updatedStatus);
      setSubmitSuccessMessage('Vaccination record saved successfully.');
    } catch (error) {
      throw (
        error instanceof Error
          ? error
          : new Error('Could not create vaccination record.')
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

      {submitSuccessMessage ? (
        <p className="submit-success-message">{submitSuccessMessage}</p>
      ) : null}

      <VaccinationStatusList schedule={data.schedule} />
    </main>
  );
}
