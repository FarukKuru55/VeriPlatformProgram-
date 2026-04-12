import React from 'react';

/**
 * Sidebar.jsx
 * ─────────────────────────────────────────────
 * AdminPanel'in sol navigasyon paneli.
 * Props olarak üst bileşenden (AdminPanel.jsx) şunları alır:
 *  - activeTab / setActiveTab   : Hangi sekme açık?
 *  - selectedForm / setSelectedForm : Form seçildi mi? (alt menü için)
 *  - formTemplatesCount         : Badge sayısı
 *  - submissionsCount           : Yanıt sayısı badge'i
 *  - handleLogout               : Çıkış fonksiyonu
 *  - Ico                        : SVG ikon nesnesi
 * ─────────────────────────────────────────────
 */
export default function Sidebar({
  activeTab,
  setActiveTab,
  selectedForm,
  setSelectedForm,
  formTemplatesCount,
  submissionsCount,
  handleLogout,
  Ico,
}) {
  const goTo = (tab) => {
    setSelectedForm(null);
    setActiveTab(tab);
  };

  return (
    <aside className="ap-sidebar">

      {/* ── Marka / Logo ── */}
      <div className="sidebar-brand">
        <div className="brand-icon">VP</div>
        <div>
          <div className="brand-text">
            Veri<span>Platform</span>
          </div>
          <div className="brand-version">v2.0 · admin</div>
        </div>
      </div>

      {/* ── Navigasyon ── */}
      <nav className="sidebar-nav">

        {/* Formlar bölümü */}
        <div className="nav-section-label">Formlar</div>

        <button
          className={`nav-btn ${!selectedForm && activeTab === 'forms' ? 'active' : ''}`}
          onClick={() => goTo('forms')}
        >
          {Ico.folder}
          Tüm Formlarım
          {formTemplatesCount > 0 && (
            <span className="nav-badge">{formTemplatesCount}</span>
          )}
        </button>

        {/* Form seçiliyse alt menü açılır */}
        {selectedForm && (
          <div className="nav-sub">
            <button
              className={`nav-btn ${activeTab === 'builder' ? 'active' : ''}`}
              style={{ fontSize: 13 }}
              onClick={() => setActiveTab('builder')}
            >
              {Ico.list} Soru Düzenleyici
            </button>
            <button
              className={`nav-btn ${activeTab === 'responses' ? 'active' : ''}`}
              style={{ fontSize: 13 }}
              onClick={() => setActiveTab('responses')}
            >
              {Ico.inbox} Gelen Yanıtlar
              {submissionsCount > 0 && (
                <span className="nav-badge">{submissionsCount}</span>
              )}
            </button>
          </div>
        )}

        {/* Sistem bölümü */}
        <div className="nav-section-label" style={{ marginTop: 6 }}>
          Sistem
        </div>

        <button
          className={`nav-btn ${!selectedForm && activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => goTo('dashboard')}
        >
          {Ico.chart} Raporlar
        </button>

        <button
          className={`nav-btn ${!selectedForm && activeTab === 'users' ? 'active' : ''}`}
          onClick={() => goTo('users')}
        >
          {Ico.users} Kullanıcılar
        </button>

      </nav>

      {/* ── Alt Alan: Kullanıcı + Çıkış ── */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">F</div>
          <div>
            <div className="sidebar-user-name">Faruk</div>
            <div className="sidebar-user-role">Sistem Yöneticisi</div>
          </div>
        </div>
        <button
          className="nav-btn"
          style={{ color: 'var(--red)' }}
          onClick={handleLogout}
        >
          {Ico.logout} Çıkış Yap
        </button>
      </div>

    </aside>
  );
}