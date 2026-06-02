# Frontend Exercise

This repo now includes a React frontend for the vaccination feature.

## Files

- `frontend/VaccinationDashboard.tsx`
- `frontend/AddVaccinationForm.tsx`
- `frontend/VaccinationStatusList.tsx`
- `frontend/api.ts`
- `frontend/types.ts`
- `backend/server.ts`
- `backend/vaccinationRepository.ts`

## What is already implemented

- Loads vaccination schedule data from `GET /api/v1/patients/:babyId/vaccinations/status`
- Displays the current schedule in a simple list
- Provides a controlled form for adding a vaccination record
- Performs light client-side validation before submit

## Why this is a good interview exercise

This tests a realistic fullstack slice:

- understand an existing React component tree
- complete an async form submission flow
- connect frontend state updates to backend persistence
- reason about loading, success, and error states

## Optional follow-up improvements

- disable the form while a request is in flight
- highlight newly completed vaccinations
- add a filter for overdue items only
