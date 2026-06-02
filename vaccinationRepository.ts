import { Pool } from 'pg';
import { AdministeredVaccine } from './vaccinationLogic';

export interface BabyPatient {
  id: string;
  dateOfBirth: string;
}

export async function findBabyPatientById(
  pool: Pool,
  babyId: string
): Promise<BabyPatient | null> {
  const result = await pool.query(
    `
      SELECT id, date_of_birth
      FROM baby_patients
      WHERE id = $1
      LIMIT 1;
    `,
    [babyId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    id: result.rows[0].id,
    dateOfBirth: result.rows[0].date_of_birth
  };
}

export async function listAdministeredVaccinesByBabyId(
  pool: Pool,
  babyId: string
): Promise<AdministeredVaccine[]> {
  const result = await pool.query(
    `
      SELECT vaccine_code, dose_number, administered_at
      FROM baby_vaccinations
      WHERE baby_id = $1
      ORDER BY administered_at ASC;
    `,
    [babyId]
  );

  return result.rows.map((row) => ({
    vaccineCode: row.vaccine_code,
    doseNumber: row.dose_number,
    administeredAt:
      row.administered_at instanceof Date
        ? row.administered_at.toISOString().slice(0, 10)
        : String(row.administered_at).slice(0, 10)
  }));
}

 // should return the created record list of administered vaccines for the baby after insertion
export async function recordVaccineAdministration(
  pool: Pool,
  babyId: string,
  vaccineCode: string,
  doseNumber: number,
  administeredAt: string
): Promise<AdministeredVaccine> {
  const result = await pool.query(
    `
      INSERT INTO baby_vaccinations (baby_id, vaccine_code, dose_number, administered_at)
      VALUES ($1, $2, $3, $4)
      RETURNING vaccine_code, dose_number, administered_at;
    `,
    [babyId, vaccineCode, doseNumber, administeredAt]
  );

  return {
    vaccineCode: result.rows[0].vaccine_code,
    doseNumber: result.rows[0].dose_number,
    administeredAt: result.rows[0].administered_at
  };

}

