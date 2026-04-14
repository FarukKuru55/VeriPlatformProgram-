import React from 'react';
import { FaInbox } from 'react-icons/fa';

/**
 * UserTasks.jsx
 * ─────────────────────────────────────────────
 * UserPanel'in görev listesi ekranı.
 * Props:
 *  - tasks            : API'den gelen görev listesi (FormTemplate[])
 *  - handleSelectForm : Göreve tıklandığında form doldurma ekranına geçiş
 * ─────────────────────────────────────────────
 * task objesi şu alanları içerir:
 *  { id, formTemplateId, title, assignedAt, endDate }
 */

const ArrowIcon = () => (
  <svg
    className="form-list-arrow"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

/**
 * Bitiş tarihine göre deadline durumu döner.
 * urgent  → 3 günden az veya geçmiş
 * normal  → 3 günden fazla
 * neutral → süresiz
 */
const getDeadlineInfo = (endDate) => {
  if (!endDate) return { label: 'Süresiz', cls: 'neutral' };
  const diff = Math.ceil((new Date(endDate) - new Date()) / 86400000);
  if (diff < 0)  return { label: 'Süresi Doldu', cls: 'urgent' };
  if (diff <= 3) return { label: `${diff} gün kaldı`, cls: 'urgent' };
  return {
    label: `Son: ${new Date(endDate).toLocaleDateString('tr-TR')}`,
    cls: 'normal',
  };
};

export default function UserTasks({ tasks, handleSelectForm }) {
  return (
    <>
      {/* Başlık */}
      <div className="up-page-header">
        <div className="up-page-title">Görev Listem</div>
        <div className="up-page-subtitle">
          Size atanmış formları seçerek doldurun.
        </div>
      </div>

      {/* Liste */}
      <div className="tasks-grid">
        {tasks.length === 0 ? (
          <div className="no-tasks">
            <FaInbox className="no-tasks-icon" />
            <div className="no-tasks-title">Atanmış göreviniz bulunmuyor</div>
            <div className="no-tasks-desc">
              Yöneticiniz size bir form atadığında burada görünecek.
            </div>
          </div>
        ) : (
          tasks.map((task) => {
            const dl = getDeadlineInfo(task.endDate);
            return (
              <div
                key={task.id}
                className="task-card"
                onClick={() => handleSelectForm(task)}
              >
                {/* İkon */}
                <div className="task-icon">
                  <ClockIcon />
                </div>

                {/* İçerik */}
                <div className="task-content">
                  <div className="task-title">{task.title}</div>
                  <div className="task-date">
                    <span className={`task-deadline-badge ${dl.cls}`}>
                      {dl.label}
                    </span>
                    {task.assignedAt && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-3)' }}>
                        Atandı: {new Date(task.assignedAt).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ok */}
                <div className="task-arrow">
                  <ArrowIcon />
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
} 