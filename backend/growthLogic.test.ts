import { analyzeGrowthTrend, GrowthRecord } from './growthLogic';

describe('Baby growth trend analysis', () => {
  test('returns no alert when there is only one measurement', () => {
    const records: GrowthRecord[] = [
      { weightKg: 3.4, measuredAt: '2026-01-15' }
    ];

    expect(analyzeGrowthTrend(records)).toEqual({
      latestWeightKg: 3.4,
      shouldAlert: false
    });
  });

  test('computes average weekly gain across the full history', () => {
    const records: GrowthRecord[] = [
      { weightKg: 3.4, measuredAt: '2026-01-15' },
      { weightKg: 4.2, measuredAt: '2026-02-12' }
    ];

    expect(analyzeGrowthTrend(records)).toEqual({
      latestWeightKg: 4.2,
      averageWeeklyGainKg: 0.2,
      shouldAlert: false
    });
  });

  test('returns no alert when recent gain is healthy', () => {
    const records: GrowthRecord[] = [
      { weightKg: 3.4, measuredAt: '2026-01-15' },
      { weightKg: 3.9, measuredAt: '2026-02-05' },
      { weightKg: 4.5, measuredAt: '2026-03-02' }
    ];

    expect(analyzeGrowthTrend(records).shouldAlert).toBe(false);
  });

  test('alerts when the last 3 measurements show flat growth over 4 weeks', () => {
    const records: GrowthRecord[] = [
      { weightKg: 5.4, measuredAt: '2026-03-01' },
      { weightKg: 5.48, measuredAt: '2026-03-15' },
      { weightKg: 5.55, measuredAt: '2026-03-31' }
    ];

    expect(analyzeGrowthTrend(records)).toEqual({
      latestWeightKg: 5.55,
      averageWeeklyGainKg: 0.035,
      shouldAlert: true,
      reason: 'Growth has flattened across the last 3 measurements.'
    });
  });
});
