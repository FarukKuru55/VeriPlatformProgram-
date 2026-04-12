import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardTab({ dashboardStats, DarkTooltip, Ico }) {
  if (!dashboardStats) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Yükleniyor...</div>;

  const { totalForms, activeForms, dailySubmissions, totalAssignments, completedAssignments, userPerformance } = dashboardStats;

  // Güvenli yüzde hesaplama (NaN hatasını önler)
  const calcPercent = (done, total) => {
    if (!total || total === 0) return 0;
    return Math.round((done / total) * 100);
  };

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-1)' }}>Sistem Raporu</div>
        <div className="page-desc" style={{ color: 'var(--text-2)', fontSize: '14px' }}>Görev tamamlama ve personel performans takibi.</div>
      </div>

      {/* ÜST KARTLAR */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--bg-2)', color: 'var(--accent)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
             {/* EMOJI YERİNE SVG */}
             {Ico.doc}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', letterSpacing: '0.5px' }}>TOPLAM FORM</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-1)' }}>{totalForms}</div>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>{activeForms} Aktif</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--bg-2)', color: 'var(--purple)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
             {/* EMOJI YERİNE SVG */}
             {Ico.users}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', letterSpacing: '0.5px' }}>ATANAN GÖREV</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-1)' }}>{totalAssignments}</div>
            <div style={{ fontSize: '12px', color: 'var(--purple)', fontWeight: '600' }}>Sistem Geneli</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--bg-2)', color: 'var(--green)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
             {/* EMOJI YERİNE SVG */}
             {Ico.shield} 
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', letterSpacing: '0.5px' }}>BİTEN GÖREV</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-1)' }}>{completedAssignments}</div>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: '600' }}>%{calcPercent(completedAssignments, totalAssignments)} Başarı</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* GRAFİK */}
        <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Başvuru Akışı</div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '20px' }}>Son 7 günün özeti</div>
          <div style={{ height: '300px' }}>
            {dailySubmissions?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySubmissions}>
                  <defs>
                    <linearGradient id="colorBasvuru" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-2)" />
                  <XAxis dataKey="Name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 12 }} dx={-10} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Area type="monotone" dataKey="Basvuru" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorBasvuru)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)' }}>
                Yeterli veri yok.
              </div>
            )}
          </div>
        </div>

        {/* PERFORMANS LİSTESİ */}
        <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Personel Performansı</div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '20px' }}>Görev tamamlama oranları</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {userPerformance?.map((user, idx) => {
              const pct = calcPercent(user.done, user.total);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-1)' }}>{user.username}</span>
                    <span style={{ color: 'var(--text-2)' }}>{user.done} / {user.total} <strong style={{ color: pct >= 80 ? 'var(--green)' : pct <= 30 ? 'var(--red)' : 'var(--text-1)' }}>(%{pct})</strong></span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: pct >= 80 ? 'var(--green)' : pct <= 30 ? 'var(--red)' : 'var(--accent)', width: `${pct}%`, transition: 'width 1s ease-in-out' }} />
                  </div>
                </div>
              );
            })}
            
            {(!userPerformance || userPerformance.length === 0) && (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px 0' }}>Personel verisi bulunmuyor.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}