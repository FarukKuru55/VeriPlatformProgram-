import React from 'react';

export default function UserTasks({ tasks, handleSelectForm }) {
  return (
    <>
      <div className="up-page-header">
        <div className="up-page-title">Size Atanan Görevler</div>
        <div className="up-page-subtitle">Lütfen size atanan ve süresi geçmemiş formları doldurun.</div>
      </div>
      
      <div className="forms-list">
        {tasks.length === 0 ? (
          <div className="empty-forms">
            <div className="empty-forms-icon">🎉</div>
            <div className="empty-forms-title">Harika! Bekleyen göreviniz yok.</div>
            <div className="empty-forms-desc">Yeni bir görev atandığında burada görünecek.</div>
          </div>
        ) : (
          tasks.map(task => (
            <div className="form-list-item" key={task.id} onClick={() => handleSelectForm(task)}>
              <div className="form-list-left">
                <div className="form-list-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="form-list-title">{task.title}</div>
                  <div className="form-list-desc">
                    Atanma: {new Date(task.assignedAt).toLocaleDateString('tr-TR')}
                    {task.endDate && ` · Son Tarih: ${new Date(task.endDate).toLocaleDateString('tr-TR')}`}
                  </div>
                </div>
              </div>
              <svg className="form-list-arrow" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          ))
        )}
      </div>
    </>
  );
}