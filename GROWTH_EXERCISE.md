# Growth Chart Exercise

This repo now includes a second interview-style feature around baby growth tracking.

## Goal

Complete a baby growth chart feature that exercises:

- algorithm design
- backend API implementation
- frontend state handling
- debugging and test-driven iteration

## What is already provided

- `backend/growthLogic.ts`
- `backend/growthLogic.test.ts`
- `backend/growthRepository.ts`
- `GET /api/v1/patients/:babyId/growth-records` in `backend/server.ts`
- `frontend/GrowthChartDashboard.tsx`
- `frontend/api.ts` growth API client
- `backend/schema.sql` and `backend/seed.sql` growth data

## What is intentionally left for you

### 1. Algorithm

`backend/growthLogic.ts` is intentionally incomplete.

You should implement the alert rule for flattened growth so that:

- the failing test in `backend/growthLogic.test.ts` passes
- the API returns a meaningful `reason`
- the frontend can display a useful status

### 2. Backend API

`POST /api/v1/patients/:babyId/growth-records` currently returns `501`.

You should:

1. validate `weightKg`
2. validate `measuredAt`
3. verify that the patient exists
4. insert the record
5. return the created record with `201`

### 3. Frontend flow

`frontend/GrowthChartDashboard.tsx` submits the form, but does not complete the happy path.

After a successful POST, you should:

1. re-fetch growth data
2. update the chart
3. reset the form
4. show a visible success message

## Suggested debugging questions

- Why does the chart not update after a successful create?
- Why does the algorithm return no alert even when growth has flattened?
- What happens if the API accepts unrealistic weights?

## Suggested test additions

- API test for `POST /growth-records`
- frontend test for form submission and chart refresh
- edge-case test for out-of-order measurements
