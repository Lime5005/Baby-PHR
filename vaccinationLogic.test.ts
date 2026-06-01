import {
  AdministeredVaccine,
  VACCINATION_SCHEDULE,
  computeVaccinationStatus
} from './vaccinationLogic';

describe('Vaccination schedule challenge', () => {
  test('marks a vaccine dose as completed when an administration record exists', () => {
    const administeredVaccines: AdministeredVaccine[] = [
      {
        vaccineCode: 'DTAP_IPV_HIB_HEPB',
        doseNumber: 1,
        administeredAt: '2026-03-16'
      }
    ];

    const result = computeVaccinationStatus({
      dateOfBirth: '2026-01-15',
      administeredVaccines,
      referenceDate: '2026-03-20'
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          vaccineCode: 'DTAP_IPV_HIB_HEPB',
          doseNumber: 1,
          status: 'completed',
          completedAt: '2026-03-16'
        })
      ])
    );
  });

  test('marks missed 2-month vaccines as overdue when the baby is already 5 months old', () => {
    const result = computeVaccinationStatus({
      dateOfBirth: '2026-01-15',
      administeredVaccines: [],
      referenceDate: '2026-06-20'
    });

    const overdueCodes = result
      .filter((item) => item.status === 'overdue')
      .map((item) => `${item.vaccineCode}-${item.doseNumber}`);

    expect(overdueCodes).toEqual(
      expect.arrayContaining(['DTAP_IPV_HIB_HEPB-1', 'PCV-1', 'DTAP_IPV_HIB_HEPB-2', 'PCV-2'])
    );
  });

  test('marks a vaccine as due today when the due date equals the reference date', () => {
    const result = computeVaccinationStatus({
      dateOfBirth: '2026-01-15',
      administeredVaccines: [],
      referenceDate: '2026-03-15'
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          vaccineCode: 'DTAP_IPV_HIB_HEPB',
          doseNumber: 1,
          status: 'dueToday'
        }),
        expect.objectContaining({
          vaccineCode: 'PCV',
          doseNumber: 1,
          status: 'dueToday'
        })
      ])
    );
  });

  test('marks far future vaccines as upcoming', () => {
    const result = computeVaccinationStatus({
      dateOfBirth: '2026-01-15',
      administeredVaccines: [],
      referenceDate: '2026-03-20'
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          vaccineCode: 'MMR',
          doseNumber: 1,
          status: 'upcoming'
        })
      ])
    );
  });

  test('returns one status entry per configured schedule item', () => {
    const result = computeVaccinationStatus({
      dateOfBirth: '2026-01-15',
      administeredVaccines: [],
      referenceDate: '2026-03-20'
    });

    expect(result).toHaveLength(VACCINATION_SCHEDULE.length);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          vaccineCode: 'MMR',
          doseNumber: 1,
          status: 'upcoming'
        }),
        expect.objectContaining({
          vaccineCode: 'DTAP_IPV_HIB_HEPB',
          doseNumber: 1,
          status: 'overdue'
        })
      ])
    );

  });

});
