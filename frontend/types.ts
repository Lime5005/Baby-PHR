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

export interface CreateTemperatureRecordPayload {
  temperatureCelsius: number;
  measuredAt: string;
}

export interface TemperatureRecord {
  temperature_celsius: number;
  measured_at: string;
}

export interface FeverAlertResult {
  shouldAlert: boolean;
  reason?: string;
}

export interface TemperatureRecordResponse {
  babyId: string;
  records: TemperatureRecord[];
  alertStatus: FeverAlertResult;
}

export interface CreateTemperatureRecordResponse {
  message: string;
  currentReading: number;
  alertStatus: FeverAlertResult;
}
