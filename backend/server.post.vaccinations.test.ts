import request from 'supertest';
import { app } from './server';
import * as vaccinationRepository from './vaccinationRepository';

jest.mock('./vaccinationRepository');

describe('POST /api/v1/patients/:babyId/vaccinations', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should return 400 if vaccineCode is missing', async () => {
    const response = await request(app)
      .post('/api/v1/patients/test-baby-123/vaccinations')
      .send({
        doseNumber: 1,
        administeredAt: '2026-03-16'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'Invalid request body: vaccineCode must be a non-empty string'
    );
  });

  test('should return 400 if doseNumber is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/patients/test-baby-123/vaccinations')
      .send({
        vaccineCode: 'DTAP_IPV_HIB_HEPB',
        doseNumber: -1,
        administeredAt: '2026-03-16'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'Invalid request body: doseNumber must be a positive integer'
    );
  });

  test('should return 400 if administeredAt is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/patients/test-baby-123/vaccinations')
      .send({
        vaccineCode: 'DTAP_IPV_HIB_HEPB',
        doseNumber: 1,
        administeredAt: 'invalid-date'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'Invalid request body: administeredAt must be a valid ISO date string'
    );
  });

  test('should return 404 if patient not found', async () => {
    jest
      .spyOn(vaccinationRepository, 'findBabyPatientById')
      .mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/patients/nonexistent-baby/vaccinations')
      .send({
        vaccineCode: 'DTAP_IPV_HIB_HEPB',
        doseNumber: 1,
        administeredAt: '2026-03-16'
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Patient not found');
  });

  test('should return 201 and the created record on success', async () => {
    jest
      .spyOn(vaccinationRepository, 'findBabyPatientById')
      .mockResolvedValue({
        id: 'test-baby-123',
        dateOfBirth: '2026-01-15'
      });

    jest
      .spyOn(vaccinationRepository, 'recordVaccineAdministration')
      .mockResolvedValue({
        vaccineCode: 'DTAP_IPV_HIB_HEPB',
        doseNumber: 1,
        administeredAt: '2026-03-16'
      });

    const response = await request(app)
      .post('/api/v1/patients/test-baby-123/vaccinations')
      .send({
        vaccineCode: 'DTAP_IPV_HIB_HEPB',
        doseNumber: 1,
        administeredAt: '2026-03-16'
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      vaccineCode: 'DTAP_IPV_HIB_HEPB',
      doseNumber: 1,
      administeredAt: '2026-03-16'
    });

    expect(vaccinationRepository.findBabyPatientById).toHaveBeenCalledTimes(1);
    expect(vaccinationRepository.recordVaccineAdministration).toHaveBeenCalledTimes(1);
  });
});
