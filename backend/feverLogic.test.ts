import { resolveTypeReferenceDirective } from "typescript"
import { analyzeFeverTrend, TemperatureRecord } from "./feverLogic"

describe('Baby\'s\ Fever Trend Jest test', () => {
  test('When temperature is not sustained up to 3 times high, should not alert', () => {
    const records: TemperatureRecord[] = [
      {temperature_celsius: 39.0, measured_at: "2026-06-01T12:00:00Z"},
      {temperature_celsius: 37.0, measured_at: "2026-06-01T11:00:00Z"},
      {temperature_celsius: 38.0, measured_at: "2026-06-01T10:00:00Z"}
    ]

    const result = analyzeFeverTrend(records)
    expect(result.shouldAlert).toBe(false)
  })

  test('When temperature is sustained 3 times upper or equal to 38.5, shoud alert', () => {
    const dangerRecord: TemperatureRecord[] = [
      {temperature_celsius: 39.5, measured_at: "2026-06-01T12:00:00Z"},
      {temperature_celsius: 39.5, measured_at: "2026-06-01T11:00:00Z"},
      {temperature_celsius: 38.5, measured_at: "2026-06-01T10:00:00Z"}
    ]

    const result = analyzeFeverTrend(dangerRecord)
    expect(result.shouldAlert).toBe(true)
    expect(result.reason).toContain('Sustained high fever detected')
  })

  test('When less than 3 times higher than 38.5, should not alert', () => {
    const lessRecords: TemperatureRecord[] = [
      {temperature_celsius: 39.5, measured_at: "2026-06-01T12:00:00Z"},
      {temperature_celsius: 39.5, measured_at: "2026-06-01T11:00:00Z"},
    ]

    const result = analyzeFeverTrend(lessRecords)
    expect(result.shouldAlert).toBe(false)
  })

})