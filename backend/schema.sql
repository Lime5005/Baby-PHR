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

CREATE TABLE IF NOT EXISTS baby_temperatures (
  id SERIAL PRIMARY KEY,
  baby_id TEXT NOT NULL REFERENCES baby_patients(id) ON DELETE CASCADE,
  temperature_celsius NUMERIC(4, 1) NOT NULL CHECK (temperature_celsius >= 30 AND temperature_celsius <= 45),
  measured_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_baby_temperatures_baby_id
  ON baby_temperatures (baby_id);

CREATE TABLE IF NOT EXISTS baby_growth_records (
  id SERIAL PRIMARY KEY,
  baby_id TEXT NOT NULL REFERENCES baby_patients(id) ON DELETE CASCADE,
  weight_kg NUMERIC(4, 2) NOT NULL CHECK (weight_kg > 0),
  measured_at DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_baby_growth_records_baby_id
  ON baby_growth_records (baby_id);
