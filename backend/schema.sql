CREATE TABLE IF NOT EXISTS baby_patients (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS baby_vaccinations (
  id SERIAL PRIMARY KEY,
  baby_id TEXT NOT NULL REFERENCES baby_patients(id) ON DELETE CASCADE,
  vaccine_code TEXT NOT NULL,
  dose_number INTEGER NOT NULL CHECK (dose_number > 0),
  administered_at DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_baby_vaccinations_baby_id
  ON baby_vaccinations (baby_id);
