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

  const overdueCount = data.schedule.filter((item) => item.status === 'overdue').length;
  const dueTodayCount = data.schedule.filter((item) => item.status === 'dueToday').length;
  const completedCount = data.schedule.filter((item) => item.status === 'completed').length;

  return (
    <section className="dashboard-panel dashboard-panel-wide vaccination-dashboard">
      <header className="dashboard-panel-header">
        <div>
          <p className="panel-eyebrow">Prevention</p>
          <h2>Baby Vaccination Record</h2>
          <p className="panel-subtitle">
            Track scheduled doses, overdue items, and newly completed vaccinations.
          </p>
          <div className="panel-meta">
            <span>Patient {data.babyId}</span>
            <span>DOB {data.dateOfBirth}</span>
          </div>
        </div>
      </header>

      <div className="panel-stats panel-stats-three">
        <div className="panel-stat-card">
          <span className="panel-stat-label">Completed</span>
          <strong className="panel-stat-value">{completedCount}</strong>
        </div>
        <div className="panel-stat-card">
          <span className="panel-stat-label">Due Today</span>
          <strong className="panel-stat-value">{dueTodayCount}</strong>
        </div>
        <div className="panel-stat-card panel-stat-card-alert">
          <span className="panel-stat-label">Overdue</span>
          <strong className="panel-stat-value">{overdueCount}</strong>
        </div>
      </div>

      <AddVaccinationForm
        onSubmit={handleCreateVaccination}
        isSubmitting={isSubmitting}
      />

      {submitSuccessMessage ? (
        <p className="submit-success-message">{submitSuccessMessage}</p>
      ) : null}

      <VaccinationStatusList schedule={data.schedule} />
    </section>
  );
}
