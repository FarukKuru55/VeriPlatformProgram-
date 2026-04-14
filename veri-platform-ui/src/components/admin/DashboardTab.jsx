import React, { useState, useEffect } from 'react';
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
  IconEye,
  IconX,
} from '@tabler/icons-react';

// User Analytics Modal for Drill-Down
const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const UserAnalyticsModal = ({ userId, username, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5062/api/Form/user-analytics/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(res.data);
      } catch { toast.error('Kullanıcı verileri çekilemedi.'); }
      finally { setLoading(false); }
    };
    fetchUserAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-3)' }}>Veriler yükleniyor...</div>
      </div>
    );
  }

  const { summary, dailyData } = analytics || { summary: {}, dailyData: [] };

  const getStatus = (day) => {
    if (!day) return 'empty';
    if (day.Assigned === 0) return 'empty';
    if (day.Completed > 0 && day.Missed === 0) return 'completed';
    if (day.Missed > 0) return 'missed';
    if (day.Pending > 0) return 'pending';
    return 'empty';
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{username}</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Performans Detayı</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
          <IconX size={20} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{summary.totalCompleted ?? 0}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>Tamamlandı</div>
        </div>
        <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{summary.totalAssigned - summary.totalCompleted ?? 0}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>Bekliyor</div>
        </div>
        <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{(summary.totalMissed !== undefined) ? summary.totalMissed : 0}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>Kaçırıldı</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))', padding: 16, borderRadius: 12, textAlign: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{(summary.completionRate !== undefined) ? `%${summary.completionRate}` : '%0'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>Başarı</div>
        </div>
      </div>

      <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Son 30 Gün</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
          {dailyData.slice(-30).map((day, i) => {
            const status = getStatus(day);
            const date = new Date(day?.Date);
            return (
              <div
                key={i}
                title={day ? `${day.Date}: ${day.Completed}/${day.Assigned}` : 'Veri yok'}
                style={{
                  aspectRatio: '1',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: status === 'completed' ? 'linear-gradient(135deg, #10b981, #059669)' 
                    : status === 'missed' ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : status === 'pending' ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'var(--surface)',
                  color: status === 'empty' ? 'var(--text-4)' : 'white',
                }}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, justifyContent: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }}></span> Tamamlandı</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b' }}></span> Bekliyor</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444' }}></span> Kaçırıldı</span>
        </div>
      </div>
    </div>
  );
};

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

const ExportButton = () => {
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
    } catch {
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
  const [adminSummary, setAdminSummary] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchAdminSummary = async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5062/api/Form/admin-summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminSummary(res.data);
      } catch { /* ignore */ }
      finally { setLoadingUsers(false); }
    };
    fetchAdminSummary();
  }, []);

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
    completedAssignments,
    pendingAssignments,
    completionRate,
    dailySubmissions,
    topForms,
    submissionsByStatus,
  } = dashboardStats;

  const { userStats = [] } = adminSummary || {};

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
            {loadingUsers ? (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px 0', fontSize: 13 }}>
                Personel verileri yükleniyor...
              </div>
            ) : userStats.length > 0 ? (
              userStats.map((user, i) => {
                const p = user.completionRate || 0;
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedUser({ userId: user.userId, username: user.username })}
                    style={{ cursor: 'pointer', padding: '10px 12px', borderRadius: 10, transition: 'all 0.2s', border: '1px solid transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{user.username}</span>
                        <IconEye size={12} style={{ color: 'var(--text-4)' }} />
                      </div>
                      <span style={{ color: 'var(--text-2)', fontFamily: "'DM Mono', monospace" }}>
                        {user.totalCompleted}/{user.totalAssigned} <strong style={{ color: p >= 80 ? '#10b981' : p <= 30 ? '#ef4444' : '#6366f1' }}>%{p}</strong>
                      </span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-3)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p}%`, background: p >= 80 ? 'linear-gradient(90deg, #10b981, #059669)' : p <= 30 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease-in-out' }} />
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

      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedUser(null)}>
          <div style={{
            background: 'var(--surface)', borderRadius: 16, width: '90%', maxWidth: 600,
            maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }} onClick={(e) => e.stopPropagation()}>
            <UserAnalyticsModal 
              userId={selectedUser.userId} 
              username={selectedUser.username} 
              onClose={() => setSelectedUser(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
