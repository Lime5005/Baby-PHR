export interface GrowthRecord {
  weightKg: number;
  measuredAt: string;
}

export interface GrowthTrendAnalysis {
  latestWeightKg?: number;
  averageWeeklyGainKg?: number;
  shouldAlert: boolean;
  reason?: string;
}

function sortByMeasurementDate(records: GrowthRecord[]): GrowthRecord[] {
  return [...records].sort((left, right) =>
    left.measuredAt.localeCompare(right.measuredAt) // means sort by date ascending
  );
}

function getDayDifference(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24)); //means convert ms to days 
}

export function analyzeGrowthTrend(records: GrowthRecord[]): GrowthTrendAnalysis {
  if (records.length === 0) {
    return { shouldAlert: false };
  }

  const sortedRecords = sortByMeasurementDate(records);
  const latestRecord = sortedRecords[sortedRecords.length - 1]; // means get the most recent measurement record

  if (sortedRecords.length === 1) {
    return {
      latestWeightKg: latestRecord.weightKg,
      shouldAlert: false
    };
  }

  const firstRecord = sortedRecords[0];
  const spanDays = getDayDifference(firstRecord.measuredAt, latestRecord.measuredAt);

  const totalWeightGain = latestRecord.weightKg - firstRecord.weightKg;

  const averageWeeklyGainKg =
    spanDays > 0 ? Number(((totalWeightGain / spanDays) * 7).toFixed(3)) : undefined; // means calculate the average weekly gain in kg, rounded to 3 decimal places

  if (sortedRecords.length < 3) {
    return {
      latestWeightKg: latestRecord.weightKg,
      averageWeeklyGainKg,
      shouldAlert: false
    };
  }

  const lastThreeRecords = sortedRecords.slice(-3); // means get the last 3 measurement records for further analysis of recent growth trend
  const recentGainKg =
    lastThreeRecords[lastThreeRecords.length - 1].weightKg -
    lastThreeRecords[0].weightKg; // means calculate the total weight gain in the last 3 measurements
  const recentDays = getDayDifference(
    lastThreeRecords[0].measuredAt,
    lastThreeRecords[lastThreeRecords.length - 1].measuredAt
  ); // means calculate the number of days spanned by the last 3 measurements

  // Interview exercise:
  // Implement the alert rule for flattened growth.
  // Suggested requirement from tests:
  // if the last 3 measurements span at least 28 days and total gain is below 0.2 kg,
  // return shouldAlert: true with a useful reason.
  if (recentDays >= 28 && recentGainKg < 0.2) {
    return {
      latestWeightKg: latestRecord.weightKg,
      averageWeeklyGainKg,
      shouldAlert: true,
      reason: 'Growth has flattened across the last 3 measurements.'
    }
  };

  return {
    latestWeightKg: latestRecord.weightKg,
    averageWeeklyGainKg,
    shouldAlert: false
  };
}
