import {
  CreateGrowthRecordPayload,
  CreateVaccinationPayload,
  GrowthRecordsResponse,
  VaccinationStatusResponse
} from './types';

async function readJsonOrThrow(response: Response) {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body.error === 'string'
        ? body.error
        : 'Unexpected API error';
    throw new Error(message);
  }

  return body;
}

export async function fetchVaccinationStatus(
  babyId: string,
  referenceDate?: string
): Promise<VaccinationStatusResponse> {
  const query = referenceDate
    ? `?referenceDate=${encodeURIComponent(referenceDate)}`
    : '';

  const response = await fetch(
    `/api/v1/patients/${encodeURIComponent(babyId)}/vaccinations/status${query}`
  );

  return readJsonOrThrow(response);
}

export async function createVaccinationRecord(
  babyId: string,
  payload: CreateVaccinationPayload
): Promise<CreateVaccinationPayload> {
  const response = await fetch(
    `/api/v1/patients/${encodeURIComponent(babyId)}/vaccinations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  return readJsonOrThrow(response);
}

export async function fetchGrowthRecords(
  babyId: string
): Promise<GrowthRecordsResponse> {
  const response = await fetch(
    `/api/v1/patients/${encodeURIComponent(babyId)}/growth-records`
  );

  return readJsonOrThrow(response);
}

export async function createGrowthRecord(
  babyId: string,
  payload: CreateGrowthRecordPayload
): Promise<CreateGrowthRecordPayload> {
  const response = await fetch(
    `/api/v1/patients/${encodeURIComponent(babyId)}/growth-records`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  return readJsonOrThrow(response);
}
