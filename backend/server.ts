import express from 'express';
import process from 'node:process';
import { Pool } from 'pg';
import { analyzeFeverTrend } from './feverLogic';
import { analyzeGrowthTrend } from './growthLogic';
import {
  listRecentTemperatureRecordsByBabyId,
  listTemperatureRecordsByBabyId,
  recordTemperatureMeasurement
} from './temperatureRepository';
import { computeVaccinationStatus } from './vaccinationLogic';
import {
  listGrowthRecordsByBabyId,
  recordGrowthMeasurement
} from './growthRepository';
import {
  findBabyPatientById,
  listAdministeredVaccinesByBabyId,
  recordVaccineAdministration
} from './vaccinationRepository';

const app = express();
app.use(express.json());

process.loadEnvFile?.();

function isValidIsoDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value;
}

const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
  user: process.env.DB_USER ?? 'lime',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'lime'
});

// Use case 1: measure temperature and alert with condition
app.get('/api/v1/patients/:babyId/temperatures', async (req, res) => {
  const { babyId } = req.params;

  try {
    const patientRecord = await findBabyPatientById(pool, babyId);

    if (!patientRecord) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const records = await listTemperatureRecordsByBabyId(pool, babyId);
    const recentRecords = [...records]
      .sort((left, right) => right.measured_at.localeCompare(left.measured_at))
      .slice(0, 3);

    return res.json({
      babyId,
      records,
      alertStatus: analyzeFeverTrend(recentRecords)
    });
  } catch (error) {
    console.log('Temperature record retrieval failed:', error);
    return res.status(500).json({ error: 'Internal error occurred' });
  }
});

app.post('/api/v1/patients/:babyId/temperatures', async (req, res) => {
  const { babyId } = req.params;
  const { temperatureCelsius, measuredAt } = req.body;

  const temp = Number.parseFloat(temperatureCelsius);
  if (Number.isNaN(temp) || temp < 30 || temp > 45) {
    return res.status(400).json({ error: 'Invalid temperature data.' });
  }

  if (typeof measuredAt !== 'string' || Number.isNaN(Date.parse(measuredAt))) {
    return res.status(400).json({
      error: 'Invalid request body: measuredAt must be a valid ISO datetime string'
    });
  }

  try {
    const patientRecord = await findBabyPatientById(pool, babyId);

    if (!patientRecord) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await recordTemperatureMeasurement(pool, babyId, temp, measuredAt);

    const recentRecords = await listRecentTemperatureRecordsByBabyId(pool, babyId, 5);
    const alertAnalysis = analyzeFeverTrend(recentRecords);

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


// Use case 2: vaccination status computation 
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

// Use case 3: growth recording and growth trend analysis
app.get('/api/v1/patients/:babyId/growth-records', async (req, res) => {
  const { babyId } = req.params;

  try {
    const patientRecord = await findBabyPatientById(pool, babyId);

    if (!patientRecord) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const records = await listGrowthRecordsByBabyId(pool, babyId);
    const analysis = analyzeGrowthTrend(records);

    return res.json({
      babyId,
      dateOfBirth: patientRecord.dateOfBirth,
      records,
      analysis
    });
  } catch (error) {
    console.log('Growth record retrieval failed:', error);
    return res.status(500).json({ error: 'Internal error occurred' });
  }
});

app.post('/api/v1/patients/:babyId/growth-records', async (req, res) => {
  const { babyId } = req.params;
  const { weightKg, measuredAt } = req.body;

  try {
    const patientRecord = await findBabyPatientById(pool, babyId);

    if (!patientRecord) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (typeof measuredAt !== 'string' || !isValidIsoDateString(measuredAt)) { 
      return res.status(400).json('Invalid request body: measuredAt should be a string and is in format YYYY-MM-DD')
    }

    if (typeof weightKg !== 'number' || Number.isNaN(weightKg) || weightKg <= 0 || weightKg > 30) {
      return res.status(400).json({error: 'Invalid request body: weightKg should be a number and should be bigger than 2 and less than 30'})
    }
    
    const record = await recordGrowthMeasurement(
      pool, 
      babyId,
      weightKg,
      measuredAt
    )
    return res.status(201).json(record);
  } catch (error) {
    console.log('Failed to record growth measurement:', error);
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
