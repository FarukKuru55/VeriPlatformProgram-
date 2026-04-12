import React from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  IconFileText,
  IconUsers,
  IconCheck,
  IconInbox,
  IconDownload,
  IconTrendingUp,
  IconCalendar,
  IconChartPie,
  IconChartBar,
} from '@tabler/icons-react';

const pct = (done, total) =>
  !total || total === 0 ? 0 : Math.round((done / total) * 100);

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1d27',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '12px 16px',
      fontSize: 12,
      fontFamily: "'DM Mono', monospace"
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      {payload.map((entry, index) => (
        <div key={index} style={{ color: entry.color, fontWeight: 700 }}>
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  );
};

const ExportButton = ({ api }) => {
  const handleExport = async (format) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5062/api/Form/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `veri_yanitlari_${new Date().toISOString().slice(0,10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} dosyası indirildi!`);
    } catch (error) {
      toast.error('Export sırasında hata oluştu.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={() => handleExport('xlsx')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 16px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
        }}
      >
        <IconDownload size={16} stroke={2} />
        Excel'e Aktar
      </button>
      <button
        onClick={() => handleExport('csv')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 16px',
          background: 'var(--surface)',
          color: 'var(--text-2)',
          border: '1px solid var(--border-2)',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = 'var(--primary)';
          e.target.style.color = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'var(--border-2)';
          e.target.style.color = 'var(--text-2)';
        }}
      >
        CSV
      </button>
    </div>
  );
};

export default function DashboardTab({ dashboardStats, api }) {
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
    totalSubmissions,
    totalUsers,
    activeForms,
    expiredForms,
    pendingForms,
    totalAssignments,
    completedAssignments,
    pendingAssignments,
    completionRate,
    dailySubmissions,
    topForms,
    submissionsByStatus,
    submissionsByDate,
    formStatusBreakdown,
    userPerformance,
  } = dashboardStats;

  const statCards = [
    {
      icon: <IconFileText size={22} stroke={1.8} />,
      label: 'Toplam Form',
      value: totalForms || 0,
      sub: `${activeForms || 0} aktif`,
      subColor: '#6366f1',
      iconBg: 'rgba(99, 102, 241, 0.1)',
      iconColor: '#6366f1',
    },
    {
      icon: <IconInbox size={22} stroke={1.8} />,
      label: 'Toplam Başvuru',
      value: totalSubmissions || 0,
      sub: `${totalForms > 0 ? (totalSubmissions / totalForms).toFixed(1) : '—'} / form`,
      subColor: '#3b82f6',
      iconBg: 'rgba(59, 130, 246, 0.1)',
      iconColor: '#3b82f6',
    },
    {
      icon: <IconUsers size={22} stroke={1.8} />,
      label: 'Toplam Kullanıcı',
      value: totalUsers || 0,
      sub: 'Sistem geneli',
      subColor: '#8b5cf6',
      iconBg: 'rgba(139, 92, 246, 0.1)',
      iconColor: '#8b5cf6',
    },
    {
      icon: <IconCheck size={22} stroke={1.8} />,
      label: 'Tamamlanan',
      value: completedAssignments || 0,
      sub: `%${completionRate || 0} tamamlandı`,
      subColor: '#10b981',
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#10b981',
    },
  ];

  const pieData = submissionsByStatus?.map((item, index) => ({
    name: item.Status || 'Bilinmeyen',
    value: item.Count,
    color: COLORS[index % COLORS.length],
  })) || [];

  const statusBreakdownData = [
    { name: 'Aktif', value: activeForms || 0, color: '#10b981' },
    { name: 'Bekleyen', value: pendingForms || 0, color: '#f59e0b' },
    { name: 'Süresi Dolmuş', value: expiredForms || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Sistem Raporu</div>
          <div className="page-desc">
            Görev tamamlama ve personel performans takibi.
          </div>
        </div>
        <ExportButton api={api} />
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-icon" style={{ background: s.iconBg, color: s.iconColor }}>
              {s.icon}
            </div>
            <div>
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-trend up" style={{ color: s.subColor }}>
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <IconChartPie size={18} stroke={1.8} style={{ color: 'var(--primary)' }} />
            <div className="chart-card-title">Başvuru Durumları</div>
          </div>
          <div className="chart-card-subtitle">Yanıtların durum dağılımı</div>
          <ResponsiveContainer width="100%" height={200}>
            {pieData.length > 0 ? (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                />
              </PieChart>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)' }}>
                Veri yok
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <IconChartBar size={18} stroke={1.8} style={{ color: 'var(--primary)' }} />
            <div className="chart-card-title">Form Durumları</div>
          </div>
          <div className="chart-card-subtitle">Aktif / Bekleyen / Süresi Dolmuş</div>
          <ResponsiveContainer width="100%" height={200}>
            {statusBreakdownData.length > 0 ? (
              <BarChart data={statusBreakdownData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-2)' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={30}>
                  {statusBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)' }}>
                Form yok
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <IconTrendingUp size={18} stroke={1.8} style={{ color: 'var(--primary)' }} />
            <div className="chart-card-title">Görev Durumu</div>
          </div>
          <div className="chart-card-subtitle">Tamamlanan vs Bekleyen</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { name: 'Tamamlanan', value: completedAssignments || 0, color: '#10b981' },
                { name: 'Bekleyen', value: pendingAssignments || 0, color: '#f59e0b' },
              ]}
              margin={{ left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-2)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <IconCalendar size={18} stroke={1.8} style={{ color: 'var(--primary)' }} />
            <div className="chart-card-title">Günlük Başvuru Trendi</div>
          </div>
          <div className="chart-card-subtitle">Son 7 gün</div>
          <ResponsiveContainer width="100%" height={260}>
            {dailySubmissions?.length > 0 ? (
              <AreaChart data={dailySubmissions} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="grad-primary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="Name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-3)' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Basvuru" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad-primary)" dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#6366f1' }} />
              </AreaChart>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)' }}>
                Yeterli veri yok.
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <IconChartBar size={18} stroke={1.8} style={{ color: 'var(--primary)' }} />
            <div className="chart-card-title">Personel Performansı</div>
          </div>
          <div className="chart-card-subtitle">Görev tamamlama oranları</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            {userPerformance?.length > 0 ? (
              userPerformance.map((user, i) => {
                const p = pct(user.Done, user.Total);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{user.Username}</span>
                      <span style={{ color: 'var(--text-2)', fontFamily: "'DM Mono', monospace" }}>
                        {user.Done}/{user.Total} <strong style={{ color: p >= 80 ? '#10b981' : p <= 30 ? '#ef4444' : '#6366f1' }}>%{p}</strong>
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p}%`, background: p >= 80 ? '#10b981' : p <= 30 ? '#ef4444' : '#6366f1', borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease-in-out' }} />
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

      {topForms?.length > 0 && (
        <div className="chart-card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <IconChartBar size={18} stroke={1.8} style={{ color: 'var(--primary)' }} />
            <div className="chart-card-title">En Çok Başvuru Alan Formlar</div>
          </div>
          <div className="chart-card-subtitle">Form bazlı dağılım</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topForms} layout="vertical" margin={{ left: 80, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
              <YAxis dataKey="Name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-2)' }} width={70} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
              <Bar dataKey="Basvuru" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
