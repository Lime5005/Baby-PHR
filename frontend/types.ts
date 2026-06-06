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

export interface GrowthRecord {
  weightKg: number;
  measuredAt: string;
}

export interface GrowthTrendAnalysis {
  latestWeightKg?: number;
  averageWeeklyGainKg?: number;
  shouldAlert: boolean;
  reason?: string;
}

export interface GrowthRecordsResponse {
  babyId: string;
  dateOfBirth: string;
  records: GrowthRecord[];
  analysis: GrowthTrendAnalysis;
}

export interface CreateGrowthRecordPayload {
  weightKg: number;
  measuredAt: string;
}
