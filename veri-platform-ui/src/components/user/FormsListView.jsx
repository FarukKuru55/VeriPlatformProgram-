import React from 'react';
import { ClipboardList, ArrowRight, Inbox } from 'lucide-react';

const getDeadlineStatus = (endDate) => {
  if (!endDate) return { label: 'Süresiz', cls: 'neutral' };
  const diff = Math.ceil((new Date(endDate) - new Date()) / 86400000);
  if (diff < 0) return { label: 'Süresi Doldu', cls: 'urgent' };
  if (diff <= 3) return { label: diff + ' gün kaldı', cls: 'urgent' };
  return { label: new Date(endDate).toLocaleDateString('tr-TR'), cls: 'normal' };
};

export default function FormsListView({ tasks, onSelectForm }) {
  const activeTasks = tasks.filter(t => t.status !== 'completed');

  if (activeTasks.length === 0) {
    return (
      <div className="no-tasks">
        <Inbox className="no-tasks-icon" size={48} />
        <div className="no-tasks-title">Aktif göreviniz bulunmuyor</div>
        <div className="no-tasks-desc">Tüm formları tamamladınız!</div>
      </div>
    );
  }

  return (
    <div className="tasks-grid">
      {activeTasks.map(task => {
        const dl = getDeadlineStatus(task.endDate);
        return (
          <div key={task.id} className="task-card" onClick={() => onSelectForm(task, false)}>
            <div className="task-icon"><ClipboardList size={22} /></div>
            <div className="task-content">
              <div className="task-title">{task.title}</div>
              <div className="task-date">
                <span className={`task-deadline-badge ${dl.cls}`}>{dl.label}</span>
              </div>
            </div>
            <div className="task-arrow"><ArrowRight size={16} /></div>
          </div>
        );
      })}
    </div>
  );
}