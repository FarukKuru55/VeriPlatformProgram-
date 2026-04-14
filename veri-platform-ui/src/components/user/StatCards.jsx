import React from 'react';
import { CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';

export default function StatCards({ summary }) {
  const {
    totalCompleted = 0,
    totalPending = 0,
    totalMissed = 0,
    completionRate = 0
  } = summary || {};

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-icon completed"><CheckCircle size={22} /></div>
        <div className="stat-info">
          <span className="stat-value">{totalCompleted}</span>
          <span className="stat-label">Tamamlandı</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon pending"><Clock size={22} /></div>
        <div className="stat-info">
          <span className="stat-value">{totalPending}</span>
          <span className="stat-label">Bekliyor</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon missed"><XCircle size={22} /></div>
        <div className="stat-info">
          <span className="stat-value">{totalMissed}</span>
          <span className="stat-label">Kaçırıldı</span>
        </div>
      </div>
      <div className="stat-card highlight">
        <div className="stat-icon rate"><TrendingUp size={22} /></div>
        <div className="stat-info">
          <span className="stat-value">%{completionRate}</span>
          <span className="stat-label">Başarı Oranı</span>
        </div>
      </div>
    </div>
  );
}