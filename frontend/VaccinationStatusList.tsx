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
    <section className="vaccination-schedule-section">
      <h3>Vaccination Schedule</h3>
      <ul className="vaccination-schedule-list">
        {schedule.map((item) => (
          <li
            key={`${item.vaccineCode}-${item.doseNumber}`}
            className={STATUS_CLASS_NAMES[item.status]}
          >
            <div className="vaccination-item-topline">
              <div>
                <strong>{item.label}</strong>
                <span className="vaccination-dose-label">Dose {item.doseNumber}</span>
              </div>
              <span className={`status-badge status-badge-${item.status}`}>
                {STATUS_LABELS[item.status]}
              </span>
            </div>
            <div className="vaccination-item-meta">
              <span>Due {item.dueDate}</span>
              {item.completedAt ? <span>Completed {item.completedAt}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
