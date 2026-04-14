import React from 'react';
import { CheckCircle, Clock, XCircle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCards({ summary }) {
  const {
    totalCompleted = 0,
    totalPending = 0,
    totalMissed = 0,
    completionRate = 0
  } = summary || {};

  const total = totalCompleted + totalPending + totalMissed;

  const cards = [
    {
      label: 'Tamamlanan',
      value: totalCompleted,
      icon: CheckCircle,
      color: '#059669',
      colorLight: '#10b981',
      bg: 'linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(16,185,129,0.04) 100%)',
      borderColor: 'rgba(5,150,105,0.15)',
      iconBg: 'linear-gradient(135deg, #059669, #10b981)',
      trend: total > 0 ? Math.round((totalCompleted / total) * 100) : 0,
      trendLabel: 'toplam içinde',
    },
    {
      label: 'Bekleyen',
      value: totalPending,
      icon: Clock,
      color: '#d97706',
      colorLight: '#f59e0b',
      bg: 'linear-gradient(135deg, rgba(217,119,6,0.08) 0%, rgba(245,158,11,0.04) 100%)',
      borderColor: 'rgba(217,119,6,0.15)',
      iconBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
      trend: totalPending > 0 ? 'Detay' : 'Yok',
      trendLabel: totalPending > 0 ? 'aksiyon gerekli' : 'hepsi tamam',
    },
    {
      label: 'Kaçırılan',
      value: totalMissed,
      icon: XCircle,
      color: '#dc2626',
      colorLight: '#ef4444',
      bg: 'linear-gradient(135deg, rgba(220,38,38,0.08) 0%, rgba(239,68,68,0.04) 100%)',
      borderColor: 'rgba(220,38,38,0.15)',
      iconBg: 'linear-gradient(135deg, #dc2626, #ef4444)',
      trend: totalMissed === 0 ? 'Mükemmel' : 'Dikkat',
      trendLabel: totalMissed === 0 ? 'kaçırma yok' : 'gözden geçirin',
    },
    {
      label: 'Performans',
      value: `%${completionRate}`,
      icon: TrendingUp,
      color: '#3b82f6',
      colorLight: '#60a5fa',
      bg: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(96,165,250,0.04) 100%)',
      borderColor: 'rgba(59,130,246,0.15)',
      iconBg: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      trend: completionRate >= 80 ? 'İyi' : completionRate >= 50 ? 'Orta' : 'Düşük',
      trendLabel: 'son 30 gün',
      isRate: true,
      rateValue: completionRate,
    },
  ];

  return (
    <div className="dashboard-stats">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.isRate
          ? card.rateValue >= 80 ? ArrowUpRight : card.rateValue >= 50 ? TrendingUp : ArrowDownRight
          : null;
        return (
          <div key={card.label} className="stat-card" style={{ background: card.bg, borderColor: card.borderColor }}>
            <div className="stat-card-inner">
              <div className="stat-top">
                <div className="stat-icon-wrap" style={{ background: card.iconBg }}>
                  <Icon size={18} strokeWidth={2.5} color="white" />
                </div>
                <div className="stat-trend" style={{ color: card.color }}>
                  {TrendIcon && <TrendIcon size={14} />}
                  {typeof card.trend === 'number' ? `%${card.trend}` : card.trend}
                </div>
              </div>
              <div className="stat-body">
                <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
              <div className="stat-footer" style={{ color: `${card.color}99` }}>
                {card.trendLabel}
              </div>
              {card.isRate && (
                <div className="stat-progress-track">
                  <div className="stat-progress-fill" style={{ width: `${card.rateValue}%`, background: card.iconBg }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}