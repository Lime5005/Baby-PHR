import { Pool } from 'pg';
import { GrowthRecord } from './growthLogic';

export async function listGrowthRecordsByBabyId(
  pool: Pool,
  babyId: string
): Promise<GrowthRecord[]> {
  const result = await pool.query(
    `
      SELECT weight_kg, TO_CHAR(measured_at, 'YYYY-MM-DD') AS measured_at
      FROM baby_growth_records
      WHERE baby_id = $1
      ORDER BY measured_at ASC;
    `,
    [babyId]
  );

  return result.rows.map((row) => ({
    weightKg: Number.parseFloat(String(row.weight_kg)),
    measuredAt: row.measured_at
  }));
}

export async function recordGrowthMeasurement(
  pool: Pool,
  babyId: string,
  weightKg: number,
  measuredAt: string
): Promise<GrowthRecord> {
  const result = await pool.query(
    `
      INSERT INTO baby_growth_records (baby_id, weight_kg, measured_at)
      VALUES ($1, $2, $3)
      RETURNING weight_kg, TO_CHAR(measured_at, 'YYYY-MM-DD') AS measured_at;
    `,
    [babyId, weightKg, measuredAt]
  );

  return {
    weightKg: Number.parseFloat(String(result.rows[0].weight_kg)),
    measuredAt: result.rows[0].measured_at
  };
}
