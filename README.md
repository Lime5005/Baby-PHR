# Baby Patient Record

Practice project for a baby Patient Health Record interview exercise.

## Stack

- Backend: Node.js, Express, PostgreSQL
- Frontend: React, TypeScript, Vite
- Testing: Jest

## Project Structure

```text
backend/    Express API, business logic, tests, SQL files
frontend/   React UI and API client
```

Important files:

- `backend/server.ts`
- `backend/schema.sql`
- `backend/seed.sql`
- `frontend/VaccinationDashboard.tsx`
- `VACCINATION_EXERCISE.md`
- `FRONTEND_EXERCISE.md`

## Environment

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
```

See `.env.example` for the template.

## Install

```bash
npm install
```

## Database Setup

Create the schema and seed demo data:

```bash
psql -d xxx -f backend/schema.sql
psql -d xxx -f backend/seed.sql
```

The seed creates a demo patient with id `baby-1`.

## Run

Start the backend:

```bash
npm run start
```

Start the frontend in another terminal:

```bash
npm run dev
```

Vite proxies `/api` requests to the Express server on `http://localhost:3000`.

## Test

Run all tests:

```bash
npm test
```

Run only the pure logic tests:

```bash
npx jest backend/feverLogic.test.ts backend/weightLogic.test.ts backend/vaccinationLogic.test.ts --runInBand
```
Check Baby PHR vaccination status:
`http://localhost:5173/api/v1/patients/baby-1/vaccinations/status?referenceDate=2026-06-02`

## Notes

- `backend/server.post.vaccinations.test.ts` uses `supertest`.
- In restricted sandbox environments, that API test may fail with a local `listen EPERM` error even when the code is correct.

## Exercises

- Backend exercise: `VACCINATION_EXERCISE.md`
- Frontend exercise: `FRONTEND_EXERCISE.md`
