import React, { useState } from 'react';
import { ClipboardList, ArrowRight, Inbox } from 'lucide-react';
import StatCards from './StatCards';
import ActivityCalendar from './ActivityCalendar';

const WEEKS = ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta'];
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const PERIOD_DAILY = 1;
const PERIOD_WEEKLY = 2;
const PERIOD_MONTHLY = 3;

const getWeekNumber = (dateStr) => {
  if (!dateStr) return 1;
  const d = new Date(dateStr);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const diff = d - startOfMonth;
  const weekNum = Math.floor(diff / (7 * 86400000)) + 1;
  return Math.min(Math.max(weekNum, 1), 4);
};

const getMonthNumber = (dateStr) => {
  if (!dateStr) return new Date().getMonth();
  return new Date(dateStr).getMonth();
};

function ArchivedTaskCard({ task, onClick }) {
  const periodLabel = task.periodType === PERIOD_DAILY ? 'Günlük'
    : task.periodType === PERIOD_WEEKLY ? 'Haftalık'
    : task.periodType === PERIOD_MONTHLY ? 'Aylık' : '';
  const completedDate = task.completedAt
    ? new Date(task.completedAt).toLocaleDateString('tr-TR')
    : null;
  return (
    <div className="tab-task-card" onClick={onClick}>
      <div className="tab-task-icon"><ClipboardList size={18} /></div>
      <div className="tab-task-content">
        <div className="tab-task-title">{task.title}</div>
        <div className="tab-task-date">
          {periodLabel && <span className="task-deadline-badge normal">{periodLabel}</span>}
          {completedDate && <span className="task-deadline-badge neutral">Tamamlandı: {completedDate}</span>}
        </div>
      </div>
      <div className="tab-task-arrow"><ArrowRight size={16} /></div>
    </div>
  );
}

export default function DashboardView({ analytics, tasks, onSelectForm }) {
  const [activeTab, setActiveTab] = useState('GUNLUK');
  const [subFilter, setSubFilter] = useState(1);

  const { summary, dailyData } = analytics || {
    summary: { totalCompleted: 0, totalPending: 0, totalMissed: 0, completionRate: 0 },
    dailyData: []
  };

  const completedTasks = tasks.filter(t => t.status === 'completed' || t.isCompleted);

  const filteredTasks = completedTasks.filter(t => {
    if (activeTab === 'GUNLUK') return t.periodType === PERIOD_DAILY;
    if (activeTab === 'HAFTALIK') {
      if (t.periodType !== PERIOD_WEEKLY) return false;
      return getWeekNumber(t.assignedAt) === subFilter;
    }
    if (activeTab === 'AYLIK') {
      if (t.periodType !== PERIOD_MONTHLY) return false;
      return getMonthNumber(t.assignedAt) === subFilter - 1;
    }
    return false;
  });

  const handleTaskClick = (task) => {
    onSelectForm(task, true);
  };

  return (
    <div className="dashboard-container">
      <StatCards summary={summary} />

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'GUNLUK' ? 'active' : ''}`} onClick={() => { setActiveTab('GUNLUK'); setSubFilter(1); }}>GÜNLÜK</button>
        <button className={`tab-btn ${activeTab === 'HAFTALIK' ? 'active' : ''}`} onClick={() => { setActiveTab('HAFTALIK'); setSubFilter(1); }}>HAFTALIK</button>
        <button className={`tab-btn ${activeTab === 'AYLIK' ? 'active' : ''}`} onClick={() => { setActiveTab('AYLIK'); setSubFilter(new Date().getMonth() + 1); }}>AYLIK</button>
      </div>

      {activeTab === 'HAFTALIK' && (
        <div className="sub-filters">
          {WEEKS.map((w, i) => (
            <button key={i} className={`sub-filter-btn ${subFilter === i + 1 ? 'active' : ''}`} onClick={() => setSubFilter(i + 1)}>{w}</button>
          ))}
        </div>
      )}

      {activeTab === 'AYLIK' && (
        <div className="sub-filters">
          {MONTHS.map((m, i) => (
            <button key={i} className={`sub-filter-btn ${subFilter === i + 1 ? 'active' : ''}`} onClick={() => setSubFilter(i + 1)}>{m}</button>
          ))}
        </div>
      )}

      {activeTab === 'GUNLUK' ? (
        <div className="tab-daily-layout">
          <div className="tab-daily-calendar">
            <ActivityCalendar dailyData={dailyData} />
          </div>
          <div className="tab-daily-tasks">
            <div className="tab-task-list">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <ArchivedTaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
                ))
              ) : (
                <div className="no-tasks">
                  <Inbox className="no-tasks-icon" size={36} />
                  <div className="no-tasks-title">Arşivde günlük görev yok</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="tab-task-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <ArchivedTaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
            ))
          ) : (
            <div className="no-tasks">
              <Inbox className="no-tasks-icon" size={36} />
              <div className="no-tasks-title">
                {activeTab === 'HAFTALIK' ? 'Bu haftada görev yok' : 'Bu ayda görev yok'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}