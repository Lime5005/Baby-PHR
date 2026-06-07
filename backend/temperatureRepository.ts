import { Pool } from 'pg';
import { TemperatureRecord } from './feverLogic';

export async function listTemperatureRecordsByBabyId(
  pool: Pool,
  babyId: string
): Promise<TemperatureRecord[]> {
  const result = await pool.query(
    `
      SELECT
        temperature_celsius,
        TO_CHAR(measured_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS measured_at
      FROM baby_temperatures
      WHERE baby_id = $1
      ORDER BY measured_at ASC;
    `,
    [babyId]
  );

  return result.rows.map((row) => ({
    temperature_celsius: Number.parseFloat(String(row.temperature_celsius)),
    measured_at: row.measured_at
  }));
}

export async function listRecentTemperatureRecordsByBabyId(
  pool: Pool,
  babyId: string,
  limit: number
): Promise<TemperatureRecord[]> {
  const result = await pool.query(
    `
      SELECT
        temperature_celsius,
        TO_CHAR(measured_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS measured_at
      FROM baby_temperatures
      WHERE baby_id = $1
      ORDER BY measured_at DESC
      LIMIT $2;
    `,
    [babyId, limit]
  );

  return result.rows.map((row) => ({
    temperature_celsius: Number.parseFloat(String(row.temperature_celsius)),
    measured_at: row.measured_at
  }));
}

export async function recordTemperatureMeasurement(
  pool: Pool,
  babyId: string,
  temperatureCelsius: number,
  measuredAt: string
): Promise<TemperatureRecord> {
  const result = await pool.query(
    `
      INSERT INTO baby_temperatures (baby_id, temperature_celsius, measured_at)
      VALUES ($1, $2, $3)
      RETURNING
        temperature_celsius,
        TO_CHAR(measured_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS measured_at;
    `,
    [babyId, temperatureCelsius, measuredAt]
  );

  return {
    temperature_celsius: Number.parseFloat(String(result.rows[0].temperature_celsius)),
    measured_at: result.rows[0].measured_at
  };
}
