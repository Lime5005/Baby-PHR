export interface AdministeredVaccine {
  vaccineCode: string;
  doseNumber: number;
  administeredAt: string;
}

export interface VaccinationScheduleItem {
  vaccineCode: string;
  label: string;
  doseNumber: number;
  recommendedAgeMonths: number;
}

export type VaccinationStatus = 'completed' | 'overdue' | 'dueToday' | 'upcoming';

export interface VaccinationStatusItem extends VaccinationScheduleItem {
  dueDate: string;
  status: VaccinationStatus;
  completedAt?: string;
}

export const VACCINATION_SCHEDULE: VaccinationScheduleItem[] = [
  {
    vaccineCode: 'DTAP_IPV_HIB_HEPB',
    label: '6-in-1 vaccine',
    doseNumber: 1,
    recommendedAgeMonths: 2
  },
  {
    vaccineCode: 'PCV',
    label: 'Pneumococcal vaccine',
    doseNumber: 1,
    recommendedAgeMonths: 2
  },
  {
    vaccineCode: 'DTAP_IPV_HIB_HEPB',
    label: '6-in-1 vaccine',
    doseNumber: 2,
    recommendedAgeMonths: 4
  },
  {
    vaccineCode: 'PCV',
    label: 'Pneumococcal vaccine',
    doseNumber: 2,
    recommendedAgeMonths: 4
  },
  {
    vaccineCode: 'MMR',
    label: 'MMR vaccine',
    doseNumber: 1,
    recommendedAgeMonths: 12
  }
];

interface VaccinationStatusInput {
  dateOfBirth: string;
  administeredVaccines: AdministeredVaccine[];
  referenceDate?: string;
}

function addMonths(dateString: string, months: number): string {
  const nextDate = new Date(dateString);
  nextDate.setUTCMonth(nextDate.getUTCMonth() + months);
  return nextDate.toISOString().slice(0, 10);
}

function sameDay(leftDate: string, rightDate: string): boolean {
  return leftDate.slice(0, 10) === rightDate.slice(0, 10);
}

export function computeVaccinationStatus({
  dateOfBirth,
  administeredVaccines,
  referenceDate = new Date().toISOString().slice(0, 10)
}: VaccinationStatusInput): VaccinationStatusItem[] {
  // ignore any administered vaccine records that are after the reference date for completed status calculation
  const effectiveRecords = administeredVaccines.filter(
    (record) => record.administeredAt.slice(0, 10) <= referenceDate
  );

  return VACCINATION_SCHEDULE.map((scheduleItem) => {
    const dueDate = addMonths(dateOfBirth, scheduleItem.recommendedAgeMonths);
    const matchingRecord = effectiveRecords.find(
      (record) =>
        record.vaccineCode === scheduleItem.vaccineCode &&
        record.doseNumber === scheduleItem.doseNumber
    );

    if (matchingRecord) {
      return {
        ...scheduleItem,
        dueDate,
        status: 'completed',
        completedAt: matchingRecord.administeredAt
      };
    }

    // Interview exercise:
    // The current implementation is intentionally incomplete.
    // Replace this with proper due / overdue / upcoming classification.
    if (sameDay(dueDate, referenceDate)) {
      return {
        ...scheduleItem,
        dueDate,
        status: 'dueToday'
      };
    }

    if (dueDate < referenceDate) {
      return {
        ...scheduleItem,
        dueDate,
        status: 'overdue'
      };
    }

    return {
      ...scheduleItem,
      dueDate,
      status: 'upcoming'
    };
  });
}
