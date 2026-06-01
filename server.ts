import express from 'express';
import { Pool } from 'pg';
import { analyzeFeverTrend } from './feverLogic';
import {
  AdministeredVaccine,
  computeVaccinationStatus
} from './vaccinationLogic';

const app = express();
app.use(express.json());

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'root',
  password: 'postGres',
  database: 'lime'
});

const vaccinationMockData: Record<
  string,
  {
    dateOfBirth: string;
    administeredVaccines: AdministeredVaccine[];
  }
> = {
  'baby-1': {
    dateOfBirth: '2026-01-15',
    administeredVaccines: [
      {
        vaccineCode: 'DTAP_IPV_HIB_HEPB',
        doseNumber: 1,
        administeredAt: '2026-03-16'
      }
    ]
  }
};

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

app.get('/api/v1/patients/:babyId/vaccinations/status', (req, res) => {
  const { babyId } = req.params;
  const { referenceDate } = req.query;
  const patientRecord = vaccinationMockData[babyId];

  if (!patientRecord) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const schedule = computeVaccinationStatus({
    dateOfBirth: patientRecord.dateOfBirth,
    administeredVaccines: patientRecord.administeredVaccines,
    referenceDate:
      typeof referenceDate === 'string' ? referenceDate : undefined
  });

  return res.json({
    babyId,
    dateOfBirth: patientRecord.dateOfBirth,
    schedule
  });
});

export { app };

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Medical patient record server started on port ${PORT}`);
});
