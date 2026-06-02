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

const STATUS_CLASS_NAMES: Record<VaccinationStatusItem['status'], string> = {
  completed: 'vaccination-item vaccination-item-completed',
  overdue: 'vaccination-item vaccination-item-overdue',
  dueToday: 'vaccination-item vaccination-item-due-today',
  upcoming: 'vaccination-item vaccination-item-upcoming'
};

export function VaccinationStatusList({
  schedule
}: VaccinationStatusListProps) {
  return (
    <section>
      <h2>Vaccination Schedule</h2>
      <ul>
        {schedule.map((item) => (
          <li
            key={`${item.vaccineCode}-${item.doseNumber}`}
            className={STATUS_CLASS_NAMES[item.status]}
          >
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
