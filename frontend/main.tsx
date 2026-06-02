import React from 'react';
import ReactDOM from 'react-dom/client';
import { VaccinationDashboard } from './VaccinationDashboard';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <VaccinationDashboard babyId="baby-1" referenceDate="2026-06-02" />
  </React.StrictMode>
);
