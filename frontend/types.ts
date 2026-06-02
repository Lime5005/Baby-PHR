export type VaccinationStatus = 'completed' | 'overdue' | 'dueToday' | 'upcoming';

export interface VaccinationStatusItem {
  vaccineCode: string;
  label: string;
  doseNumber: number;
  recommendedAgeMonths: number;
  dueDate: string;
  status: VaccinationStatus;
  completedAt?: string;
}

export interface VaccinationStatusResponse {
  babyId: string;
  dateOfBirth: string;
  schedule: VaccinationStatusItem[];
}

export interface CreateVaccinationPayload {
  vaccineCode: string;
  doseNumber: number;
  administeredAt: string;
}
