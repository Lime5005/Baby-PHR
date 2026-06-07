INSERT INTO baby_patients (id, first_name, last_name, date_of_birth)
VALUES ('baby-1', 'Emma', 'Martin', '2026-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO baby_vaccinations (baby_id, vaccine_code, dose_number, administered_at)
VALUES
  ('baby-1', 'DTAP_IPV_HIB_HEPB', 1, '2026-03-16'),
  ('baby-1', 'PCV', 1, '2026-03-16')
ON CONFLICT DO NOTHING;

INSERT INTO baby_temperatures (baby_id, temperature_celsius, measured_at)
VALUES
  ('baby-1', 37.4, '2026-05-28T08:00:00Z'),
  ('baby-1', 38.6, '2026-05-29T08:00:00Z'),
  ('baby-1', 38.8, '2026-05-29T14:00:00Z'),
  ('baby-1', 39.1, '2026-05-29T20:00:00Z')
ON CONFLICT DO NOTHING;

INSERT INTO baby_growth_records (baby_id, weight_kg, measured_at)
VALUES
  ('baby-1', 3.40, '2026-01-15'),
  ('baby-1', 4.05, '2026-02-05'),
  ('baby-1', 4.62, '2026-03-05'),
  ('baby-1', 5.08, '2026-04-01'),
  ('baby-1', 5.32, '2026-05-01')
ON CONFLICT DO NOTHING;
