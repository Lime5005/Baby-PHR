import React from 'react';
import ReactDOM from 'react-dom/client';
import { GrowthChartDashboard } from './GrowthChartDashboard';
import { VaccinationDashboard } from './VaccinationDashboard';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className="app-shell">
      <VaccinationDashboard babyId="baby-1" referenceDate="2026-06-02" />
      <GrowthChartDashboard babyId="baby-1" />
    </div>
  </React.StrictMode>
);
