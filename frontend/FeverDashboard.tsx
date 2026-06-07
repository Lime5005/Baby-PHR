import { useEffect, useState } from 'react';
import {
  createTemperatureRecord,
  fetchTemperatureRecords
} from './api';
import {
  CreateTemperatureRecordPayload,
  TemperatureRecord,
  TemperatureRecordResponse
} from './types';

interface FeverDashboardProps {
  babyId: string;
}

const CHART_WIDTH = 720;
const CHART_HEIGHT = 240;
const CHART_PADDING = 24;

interface FeverFormState {
  temperatureCelsius: string;
  measuredAt: string;
}

const INITIAL_FORM_STATE: FeverFormState = {
  temperatureCelsius: '',
  measuredAt: ''
};

function buildChartPoints(records: TemperatureRecord[]): string {
  if (records.length === 0) {
    return '';
  }

  const minTemperature = Math.min(...records.map((record) => record.temperature_celsius));
  const maxTemperature = Math.max(...records.map((record) => record.temperature_celsius));
  const temperatureRange = maxTemperature - minTemperature || 1;

  return records
    .map((record, index) => {
      const x =
        CHART_PADDING +
        (index / Math.max(records.length - 1, 1)) * (CHART_WIDTH - CHART_PADDING * 2);
      const y =
        CHART_HEIGHT -
        CHART_PADDING -
        ((record.temperature_celsius - minTemperature) / temperatureRange) *
          (CHART_HEIGHT - CHART_PADDING * 2);

      return `${x},${y}`;
    })
    .join(' ');
}

function buildPayload(
  formState: FeverFormState
): CreateTemperatureRecordPayload | null {
  const temperatureCelsius = Number.parseFloat(formState.temperatureCelsius);
  const measuredAt = formState.measuredAt.trim();

  if (
    !Number.isFinite(temperatureCelsius) ||
    temperatureCelsius < 30 ||
    temperatureCelsius > 45 ||
    measuredAt === ''
  ) {
    return null;
  }

  const parsedMeasuredAt = new Date(measuredAt);
  if (Number.isNaN(parsedMeasuredAt.getTime())) {
    return null;
  }

  return {
    temperatureCelsius,
    measuredAt: parsedMeasuredAt.toISOString()
  };
}

export function FeverDashboard({ babyId }: FeverDashboardProps) {
  const [data, setData] = useState<TemperatureRecordResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<FeverFormState>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTemperatureRecords() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetchTemperatureRecords(babyId);
        if (isMounted) {
          setData(response);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error ? error.message : 'Could not load temperature records.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTemperatureRecords();

    return () => {
      isMounted = false;
    };
  }, [babyId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = buildPayload(formState);
    if (!payload) {
      setFormError('Please provide a temperature between 30 and 45°C and a measurement time.');
      return;
    }

    setFormError(null);
    setSubmitSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await createTemperatureRecord(babyId, payload);
      const refreshedRecords = await fetchTemperatureRecords(babyId);

      setData(refreshedRecords);
      setFormState(INITIAL_FORM_STATE);
      setSubmitSuccessMessage('Temperature record saved successfully.');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not create temperature record.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p>Loading fever trend...</p>;
  }

  if (loadError) {
    return <p>Could not load fever trend: {loadError}</p>;
  }

  if (!data) {
    return <p>No temperature data available.</p>;
  }

  const latestRecord = data.records[data.records.length - 1];
  const chartPoints = buildChartPoints(data.records);
  const chartPointList = chartPoints === '' ? [] : chartPoints.split(' ');

  return (
    <section className="dashboard-panel fever-dashboard">
      <div className="fever-dashboard-header">
        <div>
          <p className="panel-eyebrow">Acute Monitoring</p>
          <h2>Infant Fever Trend Dashboard</h2>
          <p className="panel-subtitle">
            Log fresh temperature readings and watch for sustained fever patterns.
          </p>
          <div className="panel-meta">
            <span>Patient {data.babyId}</span>
            <span>{data.records.length} measurements</span>
          </div>
        </div>

        <div
          className={`fever-summary-card ${
            data.alertStatus.shouldAlert ? 'fever-summary-card-alert' : ''
          }`}
        >
          <strong>Latest temperature</strong>
          <div>{latestRecord ? `${latestRecord.temperature_celsius}°C` : '-'}</div>
          <div className="summary-status-row">
            <span>Status</span>
            <span
              className={`status-badge ${
                data.alertStatus.shouldAlert ? 'status-badge-alert' : 'status-badge-stable'
              }`}
            >
              {data.alertStatus.shouldAlert ? 'Alert' : 'Stable'}
            </span>
          </div>
          <div>{data.alertStatus.reason ?? 'No sustained fever detected.'}</div>
        </div>
      </div>

      <div className="fever-chart-card">
        {data.records.length === 0 ? (
          <p>No temperature measurements recorded yet.</p>
        ) : (
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="fever-chart">
            <line
              x1={CHART_PADDING}
              y1={CHART_HEIGHT - CHART_PADDING}
              x2={CHART_WIDTH - CHART_PADDING}
              y2={CHART_HEIGHT - CHART_PADDING}
              className="fever-chart-axis"
            />
            <line
              x1={CHART_PADDING}
              y1={CHART_PADDING}
              x2={CHART_PADDING}
              y2={CHART_HEIGHT - CHART_PADDING}
              className="fever-chart-axis"
            />
            <polyline points={chartPoints} className="fever-chart-line" />
            {data.records.map((record, index) => {
              const point = chartPointList[index];
              const [cx, cy] = point.split(',');

              return (
                <g key={`${record.measured_at}-${record.temperature_celsius}`}>
                  <circle cx={cx} cy={cy} r="4" className="fever-chart-point" />
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <form className="fever-form" onSubmit={handleSubmit}>
        <h3>Add Temperature Measurement</h3>

        <label>
          Temperature (°C)
          <input
            type="number"
            step="0.1"
            min="30"
            max="45"
            value={formState.temperatureCelsius}
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                temperatureCelsius: event.target.value
              }))
            }
          />
        </label>

        <label>
          Measured at
          <input
            type="datetime-local"
            value={formState.measuredAt}
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                measuredAt: event.target.value
              }))
            }
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save temperature record'}
        </button>

        {formError ? <p>{formError}</p> : null}
        {submitSuccessMessage ? (
          <p className="submit-success-message">{submitSuccessMessage}</p>
        ) : null}
      </form>
    </section>
  );
}
