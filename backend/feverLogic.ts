export interface TemperatureRecord {
  temperature_celsius: number;
  measured_at: string;
}

export interface FeverAlertResult {
  shouldAlert: boolean;
  reason?: string;
}

export function analyzeFeverTrend(recentTemperatures: TemperatureRecord[]): FeverAlertResult {
  if (recentTemperatures.length < 3) {
    return { shouldAlert: false };
  }
  const targetRecords = recentTemperatures.slice(0, 3);

  const isSustainedFever = targetRecords.every((record) => {
    return record.temperature_celsius >= 38.5
  });

  if (isSustainedFever) {
    return {
      shouldAlert: true,
      reason: `Sustained high fever detected! Last 3 records were all above 38.5°C.`
    };
  }

  return { shouldAlert: false };
}
