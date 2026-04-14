import React from 'react';
import { CalendarDays, Check, X } from 'lucide-react';

const getStatus = (day) => {
  if (!day) return 'empty';
  if (day.assigned === 0) return 'empty';
  if (day.completed > 0 && day.missed === 0) return 'completed';
  if (day.missed > 0) return 'missed';
  if (day.pending > 0) return 'pending';
  return 'empty';
};

const getDayNumber = (dateStr) => {
  if (!dateStr) return '?';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '?';
  return date.getDate();
};

export default function ActivityCalendar({ dailyData }) {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="calendar-empty">
        <CalendarDays size={24} />
        <span>Henüz veri bulunmuyor</span>
      </div>
    );
  }

  return (
    <div className="activity-calendar" style={{ width: '100%' }}>
      <div className="calendar-header">
        <span>Son 30 Gün</span>
        <div className="calendar-legend">
          <span className="legend-item"><span className="legend-dot completed" />Dolduruldu</span>
          <span className="legend-item"><span className="legend-dot missed" />Kaçırıldı</span>
          <span className="legend-item"><span className="legend-dot pending" />Bekliyor</span>
        </div>
      </div>
      <div className="calendar-grid" style={{ width: '100%', overflowX: 'auto' }}>
        {dailyData.slice(-30).map((day, i) => {
          const status = getStatus(day);
          return (
            <div
              key={i}
              className={`calendar-day ${status}`}
              title={day ? `${day.date}: ${day.completed || 0}/${day.assigned || 0} form` : 'Veri yok'}
            >
              <span className="day-number">{getDayNumber(day?.date)}</span>
              <span className="day-status">
                {status === 'completed' && <Check size={10} />}
                {status === 'missed' && <X size={10} />}
                {status === 'pending' && <span className="pending-dot" />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}