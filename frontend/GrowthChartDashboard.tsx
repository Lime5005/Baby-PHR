import { FormEvent, useEffect, useState } from 'react';
import {
  createGrowthRecord,
  fetchGrowthRecords
} from './api';
import {
  CreateGrowthRecordPayload,
  GrowthRecord,
  GrowthRecordsResponse
} from './types';

interface GrowthChartDashboardProps {
  babyId: string;
}

interface GrowthFormState {
  weightKg: string;
  measuredAt: string;
}

const CHART_WIDTH = 720;
const CHART_HEIGHT = 240;
const CHART_PADDING = 24;

const INITIAL_FORM_STATE: GrowthFormState = {
  weightKg: '',
  measuredAt: ''
};

function buildChartPoints(records: GrowthRecord[]): string {
  if (records.length === 0) {
    return '';
  }

  const minWeight = Math.min(...records.map((record) => record.weightKg));
  const maxWeight = Math.max(...records.map((record) => record.weightKg));
  const weightRange = maxWeight - minWeight || 1;

  return records
    .map((record, index) => {
      const x =
        CHART_PADDING +
        (index / Math.max(records.length - 1, 1)) * (CHART_WIDTH - CHART_PADDING * 2);
      const y =
        CHART_HEIGHT -
        CHART_PADDING -
        ((record.weightKg - minWeight) / weightRange) * (CHART_HEIGHT - CHART_PADDING * 2);

      return `${x},${y}`;
    })
    .join(' ');
}

function buildPayload(formState: GrowthFormState): CreateGrowthRecordPayload | null {
  const weightKg = Number.parseFloat(formState.weightKg);

  if (!Number.isFinite(weightKg) || weightKg <= 0 || formState.measuredAt.trim() === '') {
    return null;
  }

  return {
    weightKg,
    measuredAt: formState.measuredAt
  };
}

export function GrowthChartDashboard({ babyId }: GrowthChartDashboardProps) {
  const [data, setData] = useState<GrowthRecordsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<GrowthFormState>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // mounted 的意思是组件还在页面上，如果组件卸载了，我们就不更新 state 了，避免 React 报错 "Can't perform a React state update on an unmounted component"

    // useEffect 本身不能直接写成 async，所以常见写法就是在里面定义一个 async 函数，再立刻调用它
    async function loadGrowthRecords() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetchGrowthRecords(babyId);
        if (isMounted) {
          setData(response);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error ? error.message : 'Could not load growth records.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false); // 一旦拿到数据，或者没有拿到数据发生错误，我们都认为加载过程结束了，就把 isLoading 设为 false
        }
      }
    }

    loadGrowthRecords(); // 立刻调用定义的 async 函数， 因为 useEffect 不能直接写成 async function， 为什么呢？因为 useEffect 需要返回一个 cleanup function，而 async function 会返回一个 Promise，这样 React 就无法正确处理了。 这是一个连环套，比较绕，但这是目前 React 官方推荐的在 useEffect 中使用 async function 的方式。来源：https://react.dev/learn/using-async-functions-in-useeffect#recommended-pattern-define-and-call-an-inner-function

    return () => {
      isMounted = false;
    };
  }, [babyId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = buildPayload(formState);
    if (!payload) {
      setFormError('Please provide a positive weight and a measurement date.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await createGrowthRecord(babyId, payload);
      const record = await fetchGrowthRecords(babyId)

      setData(record)
      setFormState(INITIAL_FORM_STATE)
      setSubmitSuccessMessage('Growth Record is successfully submitted.')  
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not create growth record.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p>Loading growth chart...</p>;
  }

  if (loadError) {
    return <p>Could not load growth chart: {loadError}</p>;
  }

  if (!data) {
    return <p>No growth data available.</p>;
  }

  const chartPoints = buildChartPoints(data.records);

  return (
    <section className="growth-dashboard">
      <div className="growth-dashboard-header">
        <div>
          <h2>Baby Growth Chart</h2>
          <p>Patient id: {data.babyId}</p>
          <p>Date of birth: {data.dateOfBirth}</p>
        </div>

        <div className="growth-summary-card">
          <strong>Latest weight</strong>
          <div>{data.analysis.latestWeightKg ?? '-'} kg</div>
          <div>Avg weekly gain: {data.analysis.averageWeeklyGainKg ?? '-'} kg</div>
          <div>
            Status: {data.analysis.shouldAlert ? 'Watch closely' : 'On track'}
          </div>
        </div>
      </div>

      <div className="growth-chart-card">
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="growth-chart">
          <line
            x1={CHART_PADDING}
            y1={CHART_HEIGHT - CHART_PADDING}
            x2={CHART_WIDTH - CHART_PADDING}
            y2={CHART_HEIGHT - CHART_PADDING}
            className="growth-chart-axis"
          />
          <line
            x1={CHART_PADDING}
            y1={CHART_PADDING}
            x2={CHART_PADDING}
            y2={CHART_HEIGHT - CHART_PADDING}
            className="growth-chart-axis"
          />
          <polyline points={chartPoints} className="growth-chart-line" />
          {data.records.map((record, index) => {
            const point = chartPoints.split(' ')[index];
            const [cx, cy] = point.split(',');

            return (
              <g key={`${record.measuredAt}-${record.weightKg}`}>
                <circle cx={cx} cy={cy} r="4" className="growth-chart-point" />
              </g>
            );
          })}
        </svg>
      </div>

      <form className="growth-form" onSubmit={handleSubmit}>
        <h3>Add Growth Measurement</h3>

        <label>
          Weight (kg)
          <input
            type="number"
            step="0.01"
            min="0.1"
            value={formState.weightKg}
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                weightKg: event.target.value
              }))
            }
          />
        </label>

        <label>
          Measured at
          <input
            type="date"
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
          {isSubmitting ? 'Saving...' : 'Save growth record'}
        </button>

        {formError ? <p>{formError}</p> : null}
        {submitSuccessMessage ? <p>{submitSuccessMessage}</p> : null}
      </form>
    </section>
  );
}
