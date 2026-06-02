INSERT INTO baby_patients (id, first_name, last_name, date_of_birth)
VALUES ('baby-1', 'Emma', 'Martin', '2026-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO baby_vaccinations (baby_id, vaccine_code, dose_number, administered_at)
VALUES
  ('baby-1', 'DTAP_IPV_HIB_HEPB', 1, '2026-03-16'),
  ('baby-1', 'PCV', 1, '2026-03-16')
ON CONFLICT DO NOTHING;
