import React from 'react';
import ReactDOM from 'react-dom/client';
import { GrowthChartDashboard } from './GrowthChartDashboard';
import { VaccinationDashboard } from './VaccinationDashboard';
import { FeverDashboard } from './FeverDashboard';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className="app-frame">
      <header className="app-hero">
        <div>
          <p className="app-eyebrow">Baby Patient Record</p>
          <h1>Clinical Overview</h1>
          <p className="app-subtitle">
            Follow vaccination status, growth progression, and fever trend in one
            place.
          </p>
        </div>
        <div className="app-hero-card">
          <strong>Patient</strong>
          <div>baby-1</div>
          <div>Reference date: 2026-06-02</div>
        </div>
      </header>

      <div className="dashboard-grid">
        <VaccinationDashboard babyId="baby-1" referenceDate="2026-06-02" />
        <GrowthChartDashboard babyId="baby-1" />
        <FeverDashboard babyId="baby-1" />
      </div>
    </div>
  </React.StrictMode>
);
