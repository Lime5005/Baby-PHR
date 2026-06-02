import { VaccinationStatusItem } from './types';

interface VaccinationStatusListProps {
  schedule: VaccinationStatusItem[];
}

const STATUS_LABELS: Record<VaccinationStatusItem['status'], string> = {
  completed: 'Completed',
  overdue: 'Overdue',
  dueToday: 'Due Today',
  upcoming: 'Upcoming'
};

export function VaccinationStatusList({
  schedule
}: VaccinationStatusListProps) {
  return (
    <section>
      <h2>Vaccination Schedule</h2>
      <ul>
        {schedule.map((item) => (
          <li key={`${item.vaccineCode}-${item.doseNumber}`}>
            <strong>{item.label}</strong>{' '}
            <span>dose {item.doseNumber}</span>{' '}
            <span>({STATUS_LABELS[item.status]})</span>
            <div>Due date: {item.dueDate}</div>
            {item.completedAt ? (
              <div>Completed at: {item.completedAt}</div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
