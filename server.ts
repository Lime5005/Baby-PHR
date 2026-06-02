import express from 'express';
import { Pool } from 'pg';
import { analyzeFeverTrend } from './feverLogic';
import { computeVaccinationStatus } from './vaccinationLogic';
import {
  findBabyPatientById,
  listAdministeredVaccinesByBabyId,
  recordVaccineAdministration
} from './vaccinationRepository';

const app = express();
app.use(express.json());

function isValidIsoDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value;
}

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'lime',
  password: '',
  database: 'lime'
});

app.post('/api/v1/patients/:babyId/temperatures', async (req, res) => {
  const { babyId } = req.params;
  const { temperatureCelsius, measuredAt } = req.body;

  const temp = Number.parseFloat(temperatureCelsius);
  if (Number.isNaN(temp) || temp < 30 || temp > 45) {
    return res.status(400).json({ error: 'Invalid temperature data.' });
  }

  try {
    await pool.query(
      `
        INSERT INTO baby_temperatures (baby_id, temperature_celsius, measured_at)
        VALUES ($1, $2, $3);
      `,
      [babyId, temp, measuredAt]
    );

    const dbResult = await pool.query(
      `
        SELECT temperature_celsius, measured_at
        FROM baby_temperatures
        WHERE baby_id = $1
        ORDER BY measured_at DESC
        LIMIT 5;
      `,
      [babyId]
    );

    const alertAnalysis = analyzeFeverTrend(dbResult.rows);

    return res.status(201).json({
      message: 'Temperature recorded successfully',
      currentReading: temp,
      alertStatus: alertAnalysis
    });
  } catch (error) {
    console.log('Database operations failed:', error);
    return res.status(500).json({ error: 'Internal error occurred' });
  }
});

app.get('/api/v1/patients/:babyId/vaccinations/status', async (req, res) => {
  const { babyId } = req.params;
  const { referenceDate } = req.query;

  try {
    const patientRecord = await findBabyPatientById(pool, babyId);

    if (!patientRecord) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const administeredVaccines = await listAdministeredVaccinesByBabyId(
      pool,
      babyId
    );

    const schedule = computeVaccinationStatus({
      dateOfBirth: patientRecord.dateOfBirth,
      administeredVaccines,
      referenceDate:
        typeof referenceDate === 'string' ? referenceDate : undefined
    });

    return res.json({
      babyId,
      dateOfBirth: patientRecord.dateOfBirth,
      schedule
    });
  } catch (error) {
    console.log('Vaccination status retrieval failed:', error);
    return res.status(500).json({ error: 'Internal error occurred' });
  }
});

app.post('/api/v1/patients/:babyId/vaccinations', async (req, res) => {
  const { babyId } = req.params;
  const { vaccineCode, doseNumber, administeredAt } = req.body;

  if (typeof vaccineCode !== 'string' || vaccineCode.trim() === '') {
    return res.status(400).json({
      error: 'Invalid request body: vaccineCode must be a non-empty string'
    });
  }

  if (!Number.isInteger(doseNumber) || doseNumber <= 0) {
    return res.status(400).json({
      error: 'Invalid request body: doseNumber must be a positive integer'
    });
  }

  if (
    typeof administeredAt !== 'string' ||
    !isValidIsoDateString(administeredAt)
  ) {
    return res.status(400).json({
      error: 'Invalid request body: administeredAt must be a valid ISO date string'
    });
  }

  try {
    // Verify patient exists before recording vaccination
    const patientRecord = await findBabyPatientById(pool, babyId);
    if (!patientRecord) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Insert the new vaccination record and return the created record
    const administeredVaccine = await recordVaccineAdministration(
      pool,
      babyId,
      vaccineCode.trim(),
      doseNumber,
      administeredAt
    );

    return res.status(201).json({
      vaccineCode: administeredVaccine.vaccineCode,
      doseNumber: administeredVaccine.doseNumber,
      administeredAt: administeredVaccine.administeredAt
    });
  } catch (error) {
    console.log('Failed to record vaccine administration:', error);
    return res.status(500).json({ error: 'Internal error occurred' });
  }

});

export { app };

const PORT = 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Medical patient record server started on port ${PORT}`);
  });
}
