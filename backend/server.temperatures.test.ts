import request from 'supertest';
import { app } from './server';
import * as temperatureRepository from './temperatureRepository';
import * as vaccinationRepository from './vaccinationRepository';


jest.mock('./temperatureRepository');
jest.mock('./vaccinationRepository');

describe('Temperature API', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('GET /api/v1/patients/:babyId/temperatures returns records and alert status', async () => {
    jest
      .spyOn(vaccinationRepository, 'findBabyPatientById')
      .mockResolvedValue({
        id: 'baby-1',
        dateOfBirth: '2026-01-15'
      });

    jest
      .spyOn(temperatureRepository, 'listTemperatureRecordsByBabyId')
      .mockResolvedValue([
        {
          temperature_celsius: 37.4,
          measured_at: '2026-05-28T08:00:00Z'
        },
        {
          temperature_celsius: 38.6,
          measured_at: '2026-05-29T08:00:00Z'
        },
        {
          temperature_celsius: 38.8,
          measured_at: '2026-05-29T14:00:00Z'
        },
        {
          temperature_celsius: 39.1,
          measured_at: '2026-05-29T20:00:00Z'
        }
      ]);

    const response = await request(app)
      .get('/api/v1/patients/baby-1/temperatures');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      babyId: 'baby-1',
      records: [
        {
          temperature_celsius: 37.4,
          measured_at: '2026-05-28T08:00:00Z'
        },
        {
          temperature_celsius: 38.6,
          measured_at: '2026-05-29T08:00:00Z'
        },
        {
          temperature_celsius: 38.8,
          measured_at: '2026-05-29T14:00:00Z'
        },
        {
          temperature_celsius: 39.1,
          measured_at: '2026-05-29T20:00:00Z'
        }
      ],
      alertStatus: {
        shouldAlert: true,
        reason: 'Sustained high fever detected! Last 3 records were all above 38.5°C.'
      }
    });

    expect(vaccinationRepository.findBabyPatientById).toHaveBeenCalledTimes(1);
    expect(temperatureRepository.listTemperatureRecordsByBabyId).toHaveBeenCalledTimes(1);
  });

  test('POST /api/v1/patients/:babyId/temperatures returns 400 for invalid measuredAt', async () => {
    const response = await request(app)
      .post('/api/v1/patients/baby-1/temperatures')
      .send({
        temperatureCelsius: 38.6,
        measuredAt: 'not-a-date'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'Invalid request body: measuredAt must be a valid ISO datetime string'
    );
    expect(vaccinationRepository.findBabyPatientById).not.toHaveBeenCalled();
    expect(temperatureRepository.recordTemperatureMeasurement).not.toHaveBeenCalled();
  });

  test('POST /api/v1/patients/:babyId/temperatures returns 201 for a valid record', async () => {
    jest
      .spyOn(vaccinationRepository, 'findBabyPatientById')
      .mockResolvedValue({
        id: 'baby-1',
        dateOfBirth: '2026-01-15'
      });

    jest
      .spyOn(temperatureRepository, 'recordTemperatureMeasurement')
      .mockResolvedValue({
        temperature_celsius: 38.6,
        measured_at: '2026-05-29T20:00:00Z'
      });

    jest
      .spyOn(temperatureRepository, 'listRecentTemperatureRecordsByBabyId')
      .mockResolvedValue([
        {
          temperature_celsius: 38.6,
          measured_at: '2026-05-29T08:00:00Z'
        },
        {
          temperature_celsius: 38.8,
          measured_at: '2026-05-29T14:00:00Z'
        },
        {
          temperature_celsius: 39.1,
          measured_at: '2026-05-29T20:00:00Z'
        }
      ]);

    const response = await request(app)
      .post('/api/v1/patients/baby-1/temperatures')
      .send({
        temperatureCelsius: 38.6,
        measuredAt: '2026-05-29T20:00:00Z'
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Temperature recorded successfully',
      currentReading: 38.6,
      alertStatus: {
        shouldAlert: true,
        reason: 'Sustained high fever detected! Last 3 records were all above 38.5°C.'
      }
    });

    expect(vaccinationRepository.findBabyPatientById).toHaveBeenCalledWith(
      expect.anything(),
      'baby-1'
    );
    expect(temperatureRepository.recordTemperatureMeasurement).toHaveBeenCalledWith(
      expect.anything(),
      'baby-1',
      38.6,
      '2026-05-29T20:00:00Z'
    );
    expect(temperatureRepository.listRecentTemperatureRecordsByBabyId).toHaveBeenCalledWith(
      expect.anything(),
      'baby-1',
      5
    );
  });
});
