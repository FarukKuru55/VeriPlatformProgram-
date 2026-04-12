import React from 'react';

// "Props" dediğimiz şey, üst ana dosyadan (AdminPanel) bu alt dosyaya gönderilen verilerdir.
export default function Sidebar({
  activeTab, 
  setActiveTab, 
  selectedForm, 
  setSelectedForm, 
  formTemplatesCount, 
  submissionsCount, 
  handleLogout, 
  Ico 
}) {
  return (
    <aside className="ap-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">VP</div>
        <div>
          <div className="brand-text" style={{ color: 'var(--text-1)' }}>Veri<span style={{ color: 'var(--accent)' }}>Platform</span></div>
          <div className="brand-version" style={{ color: 'var(--text-3)', fontSize: '11px' }}> admin</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Formlar</div>
        <button className={`nav-btn ${!selectedForm && activeTab === 'forms' ? 'active' : ''}`}
          onClick={() => { setSelectedForm(null); setActiveTab('forms'); }}>
          {Ico.folder} Tüm Formlarım
          {formTemplatesCount > 0 && <span className="nav-badge">{formTemplatesCount}</span>}
        </button>

        {selectedForm && (
          <div className="nav-sub">
            <button className={`nav-btn ${activeTab === 'builder' ? 'active' : ''}`} style={{ fontSize: 13 }} onClick={() => setActiveTab('builder')}>
              {Ico.list} Soru Düzenleyici
            </button>
            <button className={`nav-btn ${activeTab === 'responses' ? 'active' : ''}`} style={{ fontSize: 13 }} onClick={() => setActiveTab('responses')}>
              {Ico.inbox} Gelen Yanıtlar
              {submissionsCount > 0 && <span className="nav-badge">{submissionsCount}</span>}
            </button>
          </div>
        )}

        <div className="nav-section-label" style={{ marginTop: 6 }}>Sistem</div>
        <button className={`nav-btn ${!selectedForm && activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setSelectedForm(null); setActiveTab('dashboard'); }}>
          {Ico.chart} Raporlar
        </button>
        <button className={`nav-btn ${!selectedForm && activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setSelectedForm(null); setActiveTab('users'); }}>
          {Ico.users} Kullanıcılar
        </button>
      </nav>

      <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
        <div className="sidebar-user" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <div className="sidebar-avatar" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>F</div>
          <div>
            <div className="sidebar-user-name" style={{ color: 'var(--text-1)', fontWeight: '600', fontSize: '14px' }}>Faruk</div>
            <div className="sidebar-user-role" style={{ color: 'var(--text-3)', fontSize: '11px' }}>Sistem Yöneticisi</div>
          </div>
        </div>
        <button className="nav-btn" style={{ color: 'var(--red)' }} onClick={handleLogout}>{Ico.logout} Çıkış Yap</button>
      </div>
    </aside>
  );
}