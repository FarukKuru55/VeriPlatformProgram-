import React from 'react';
import { CalendarDays, Check, X } from 'lucide-react';

const getStatus = (day) => {
  if (!day) return 'empty';
  if (day.Assigned === 0) return 'empty';
  if (day.Completed > 0 && day.Missed === 0) return 'completed';
  if (day.Missed > 0) return 'missed';
  if (day.Pending > 0) return 'pending';
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
    <div className="activity-calendar">
      <div className="calendar-header">
        <span>Son 30 Gün</span>
        <div className="calendar-legend">
          <span className="legend-item"><span className="legend-dot completed" />Dolduruldu</span>
          <span className="legend-item"><span className="legend-dot missed" />Kaçırıldı</span>
          <span className="legend-item"><span className="legend-dot pending" />Bekliyor</span>
        </div>
      </div>
      <div className="calendar-grid">
        {dailyData.slice(-30).map((day, i) => {
          const status = getStatus(day);
          return (
            <div
              key={i}
              className={`calendar-day ${status}`}
              title={day ? `${day.Date}: ${day.Completed || 0}/${day.Assigned || 0} form` : 'Veri yok'}
            >
              <span className="day-number">{getDayNumber(day?.Date)}</span>
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