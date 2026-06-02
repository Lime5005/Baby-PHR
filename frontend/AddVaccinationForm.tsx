import { FormEvent, useState } from 'react';
import { CreateVaccinationPayload } from './types';

interface AddVaccinationFormProps {
  onSubmit: (payload: CreateVaccinationPayload) => Promise<void>;
  isSubmitting: boolean;
}

interface FormState {
  vaccineCode: string;
  doseNumber: string;
  administeredAt: string;
}

const INITIAL_FORM_STATE: FormState = {
  vaccineCode: '',
  doseNumber: '1',
  administeredAt: ''
};

function buildPayload(formState: FormState): CreateVaccinationPayload | null {
  const vaccineCode = formState.vaccineCode.trim();
  const doseNumber = Number.parseInt(formState.doseNumber, 10);

  if (
    vaccineCode === '' ||
    !Number.isInteger(doseNumber) ||
    doseNumber <= 0 ||
    formState.administeredAt.trim() === ''
  ) {
    return null;
  }

  return {
    vaccineCode,
    doseNumber,
    administeredAt: formState.administeredAt
  };
}

export function AddVaccinationForm({
  onSubmit,
  isSubmitting
}: AddVaccinationFormProps) {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = buildPayload(formState);
    if (!payload) {
      setFormError(
        'Please provide a vaccine code, a positive dose number, and an administration date.'
      );
      return;
    }

    setFormError(null);

    try {
      await onSubmit(payload);
      setFormState(INITIAL_FORM_STATE);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not submit vaccination record.'
      );
    }
  }

  return (
    <section>
      <h2>Add Vaccination</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Vaccine code
          <input
            name="vaccineCode"
            value={formState.vaccineCode}
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                vaccineCode: event.target.value
              }))
            }
          />
        </label>

        <label>
          Dose number
          <input
            name="doseNumber"
            type="number"
            min="1"
            value={formState.doseNumber}
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                doseNumber: event.target.value
              }))
            }
          />
        </label>

        <label>
          Administered at
          <input
            name="administeredAt"
            type="date"
            value={formState.administeredAt}
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                administeredAt: event.target.value
              }))
            }
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save vaccination'}
        </button>
      </form>

      {formError ? <p>{formError}</p> : null}
    </section>
  );
}
