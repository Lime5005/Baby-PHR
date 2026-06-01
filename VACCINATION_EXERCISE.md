# Vaccination Schedule Exercise

This repo now includes a realistic interview-style backend exercise around baby vaccination tracking.

## Goal

Implement a vaccination schedule feature for a baby Patient Health Record.

The core business rule lives in `vaccinationLogic.ts`.

## What is already provided

- `VACCINATION_SCHEDULE`: a small pediatric schedule.
- `computeVaccinationStatus(...)`: an intentionally incomplete implementation.
- `vaccinationLogic.test.ts`: a set of unit tests that describe the expected behavior.
- `GET /api/v1/patients/:babyId/vaccinations/status`: a thin API route in `server.ts`.

## Your task

Make the tests pass by implementing the missing scheduling logic.

Expected behavior:

1. If a vaccine dose was already administered, mark it as `completed`.
2. If the due date is before the reference date and the dose was not administered, mark it as `overdue`.
3. If the due date is the same day as the reference date, mark it as `dueToday`.
4. If the due date is after the reference date, mark it as `upcoming`.
5. Ignore administration records dated after the `referenceDate`.

## Suggested next steps

1. Run `npm test`.
2. Fix `computeVaccinationStatus(...)`.
3. Add at least one extra edge-case test of your own.
4. If you want more realism, persist vaccine records in Postgres and wire the API route to real data.
