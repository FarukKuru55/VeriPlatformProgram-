import React from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * DashboardTab.jsx
 * ─────────────────────────────────────────────
 * Admin panelinin "Raporlar" sekmesi.
 * Props:
 *  - dashboardStats : API'den gelen istatistik objesi
 *      { totalForms, activeForms, totalSubmissions,
 *        totalAssignments, completedAssignments,
 *        dailySubmissions[], topForms[], userPerformance[] }
 *  - DarkTooltip    : Recharts için özel tooltip bileşeni
 *  - Ico            : SVG ikon nesnesi
 * ─────────────────────────────────────────────
 */

/** Yüzde hesaplayıcı — sıfıra bölmeyi önler */
const pct = (done, total) =>
  !total || total === 0 ? 0 : Math.round((done / total) * 100);

/** Performans barı rengi */
const perfColor = (percent) => {
  if (percent >= 80) return 'var(--green)';
  if (percent <= 30) return 'var(--red)';
  return 'var(--accent)';
};

export default function DashboardTab({ dashboardStats, DarkTooltip, Ico }) {
  if (!dashboardStats) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-3)' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
        <div>Veriler yükleniyor...</div>
      </div>
    );
  }

  const {
    totalForms,
    activeForms,
    totalSubmissions,
    totalAssignments,
    completedAssignments,
    dailySubmissions,
    topForms,
    userPerformance,
  } = dashboardStats;

  const statCards = [
    {
      icon: Ico.doc,
      label: 'TOPLAM FORM',
      value: totalForms,
      sub: `${activeForms} Aktif`,
      subColor: 'var(--accent)',
      iconBg: 'rgba(79,142,247,0.1)',
      iconColor: 'var(--accent)',
    },
    {
      icon: Ico.users,
      label: 'ATANAN GÖREV',
      value: totalAssignments,
      sub: 'Sistem Geneli',
      subColor: 'var(--purple)',
      iconBg: 'var(--purple-bg)',
      iconColor: 'var(--purple)',
    },
    {
      icon: Ico.shield,
      label: 'BİTEN GÖREV',
      value: completedAssignments,
      sub: `%${pct(completedAssignments, totalAssignments)} Tamamlandı`,
      subColor: 'var(--green)',
      iconBg: 'var(--green-bg)',
      iconColor: 'var(--green)',
    },
    {
      icon: Ico.chart,
      label: 'TOPLAM BAŞVURU',
      value: totalSubmissions,
      sub: `Ort. ${totalForms > 0 ? (totalSubmissions / totalForms).toFixed(1) : '—'} / form`,
      subColor: 'var(--amber)',
      iconBg: 'var(--amber-bg)',
      iconColor: 'var(--amber)',
    },
  ];

  return (
    <div>
      {/* Sayfa başlığı */}
      <div className="page-header">
        <div className="page-title">Sistem Raporu</div>
        <div className="page-desc">
          Görev tamamlama ve personel performans takibi.
        </div>
      </div>

      {/* ── Üst Stat Kartları ── */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div
              className="stat-card-icon"
              style={{ background: s.iconBg, color: s.iconColor }}
            >
              {s.icon}
            </div>
            <div>
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value">{s.value ?? '—'}</div>
              <div
                className="stat-card-trend up"
                style={{ color: s.subColor }}
              >
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grafikler ── */}
      <div className="charts-grid">

        {/* Alan Grafiği: 7 günlük başvuru trendi */}
        <div className="chart-card">
          <div className="chart-card-title">Başvuru Akışı</div>
          <div className="chart-card-subtitle">Son 7 günün özeti</div>
          <ResponsiveContainer width="100%" height={260}>
            {dailySubmissions?.length > 0 ? (
              <AreaChart data={dailySubmissions} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="grad-daily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="Name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}
                />
                <Tooltip content={<DarkTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Basvuru"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="url(#grad-daily)"
                  dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: 'var(--accent)' }}
                />
              </AreaChart>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', fontSize: 13 }}>
                Yeterli veri yok.
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Personel Performansı */}
        <div className="chart-card">
          <div className="chart-card-title">Personel Performansı</div>
          <div className="chart-card-subtitle">Görev tamamlama oranları</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 8 }}>
            {userPerformance?.length > 0 ? (
              userPerformance.map((user, i) => {
                const p = pct(user.done, user.total);
                return (
                  <div key={i}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 7,
                      fontSize: 13,
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                        {user.username}
                      </span>
                      <span style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                        {user.done}/{user.total}{' '}
                        <strong style={{ color: perfColor(p) }}>%{p}</strong>
                      </span>
                    </div>
                    <div style={{
                      height: 7,
                      background: 'var(--bg-3)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${p}%`,
                        background: perfColor(p),
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.8s ease-in-out',
                      }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px 0', fontSize: 13 }}>
                Personel verisi bulunmuyor.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* En Popüler Formlar (Bar Grafiği) */}
      {topForms?.length > 0 && (
        <div className="chart-card" style={{ marginTop: 16 }}>
          <div className="chart-card-title">En Çok Başvuru Alan Formlar</div>
          <div className="chart-card-subtitle">Form bazlı dağılım</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topForms} layout="vertical" margin={{ left: 60, right: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}
              />
              <YAxis
                dataKey="Name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-2)' }}
                dx={-8}
              />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="Basvuru" fill="var(--green)" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}