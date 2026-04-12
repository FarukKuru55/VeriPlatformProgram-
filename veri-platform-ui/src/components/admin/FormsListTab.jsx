import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaClipboard, FaPencilAlt } from 'react-icons/fa';
import {
  IconPlus,
  IconUsers,
  IconTrash,
  IconClock,
  IconRepeat,
  IconFileText,
  IconSearch,
} from '@tabler/icons-react';

const Ico = {
  plus: <IconPlus size={16} stroke={2.5} />,
  users: <IconUsers size={14} stroke={2} />,
  trash: <IconTrash size={16} stroke={2} />,
  clock: <IconClock size={14} stroke={2} />,
  repeat: <IconRepeat size={14} stroke={2} />,
  doc: <IconFileText size={20} stroke={1.8} />,
  search: <IconSearch size={16} stroke={2} />,
};

export default function FormsListTab({
  newFormTitle, setNewFormTitle,
  startDate, setStartDate,
  endDate, setEndDate,
  isRecurring, setIsRecurring,
  recurrenceType, setRecurrenceType,
  handleCreateTemplate,
  formTemplates,
  setSelectedForm, setActiveTab,
  handleDeleteTemplate,
  api,
}) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetForm, setTargetForm] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const formStatus = (form) => {
    const now = new Date();
    const s = form.startDate ? new Date(form.startDate) : null;
    const e = form.endDate ? new Date(form.endDate) : null;
    if (s && now < s) return { label: 'BEKLEMEDE', cls: 'pending' };
    if (e && now > e) return { label: 'SONA ERDİ', cls: 'expired' };
    return { label: 'AKTİF', cls: 'active' };
  };

  const openAssignModal = async (form) => {
    setTargetForm(form);
    try {
      const r = await api.get('/Auth/users');
      setAllUsers(r.data);
      setShowAssignModal(true);
    } catch {
      toast.error('Kullanıcı listesi alınamadı.');
    }
  };

  const handleAssign = async () => {
    if (selectedUserIds.length === 0)
      return toast.error('En az bir kullanıcı seçilmelidir.');
    try {
      await api.post('/Form/assign', {
        formTemplateId: targetForm.id,
        userIds: selectedUserIds,
      });
      toast.success('Görev başarıyla atandı!');
      setShowAssignModal(false);
      setSelectedUserIds([]);
    } catch {
      toast.error('Görev atama işlemi başarısız.');
    }
  };

  const toggleUser = (id) =>
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const recurrenceLabel = (type) =>
    ({ Daily: 'Günlük Tekrar', Weekly: 'Haftalık Tekrar', Monthly: 'Aylık Tekrar' }[type] ?? 'Periyodik');

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Form Yönetimi</div>
        <div className="page-desc">
          Personel atamaları için form oluşturun ve yönetin.
        </div>
      </div>

      <div className="create-box">
        <div className="create-box-row">
          <input
            className="text-input"
            style={{ flex: 1 }}
            type="text"
            placeholder="Form adı girin (Örn: Aylık Performans Değerlendirmesi)"
            value={newFormTitle}
            onChange={(e) => setNewFormTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTemplate()}
          />
          <button className="primary-btn" onClick={handleCreateTemplate}>
            {Ico.plus} Yeni Form Oluştur
          </button>
        </div>

        <div className="create-box-meta">
          <div>
            <span className="field-label">Başlangıç Tarihi</span>
            <input
              className="text-input"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <span className="field-label">Bitiş Tarihi</span>
            <input
              className="text-input"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="toggle-row">
            <input
              className="toggle-check"
              type="checkbox"
              id="rec"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <label className="toggle-label" htmlFor="rec">
              {Ico.repeat} Periyodik Form
            </label>
            {isRecurring && (
              <select
                className="text-input"
                style={{ width: 'auto', padding: '8px 12px' }}
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value)}
              >
                <option value="Daily">Günlük</option>
                <option value="Weekly">Haftalık</option>
                <option value="Monthly">Aylık</option>
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="forms-grid">
        {formTemplates.map((form) => {
          const st = formStatus(form);
          return (
            <div
              className="form-card"
              key={form.id}
              onClick={() => { setSelectedForm(form); setActiveTab('builder'); }}
            >
              <div className="form-card-top">
                <div className="form-card-icon">{Ico.doc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`status-badge ${st.cls}`}>{st.label}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); openAssignModal(form); }}
                    style={{
                      background: 'var(--purple-bg)',
                      color: 'var(--purple)',
                      border: '1px solid var(--purple-border)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {Ico.users} ATA
                  </button>
                </div>
              </div>

              <div>
                <div className="form-card-title">{form.title}</div>
                <div className="form-card-meta">
                  {Ico.clock}
                  {form.endDate
                    ? `Bitiş: ${new Date(form.endDate).toLocaleDateString('tr-TR')}`
                    : 'Süresiz'}
                  {form.isRecurring && (
                    <span style={{
                      color: 'var(--purple)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      marginLeft: 6,
                    }}>
                      {Ico.repeat} {recurrenceLabel(form.recurrenceType)}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-card-footer">
                <button className="form-card-action">
                  <FaPencilAlt size={13} style={{ marginRight: 6 }} /> Düzenle
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 11,
                    color: 'var(--text-3)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    #{form.id}
                  </span>
                  <button
                    className="form-card-delete"
                    onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(form.id); }}
                  >
                    {Ico.trash}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {formTemplates.length === 0 && (
          <div style={{
            gridColumn: '1/-1',
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-3)',
            background: 'var(--bg-2)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}>
            <FaClipboard style={{ fontSize: 40, marginBottom: 12 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>
              Henüz form oluşturulmadı
            </div>
            <div style={{ fontSize: 12, marginTop: 6 }}>
              Yukarıdan yeni bir form oluşturarak başlayın.
            </div>
          </div>
        )}
      </div>

      {showAssignModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--surface)',
            width: 420,
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>
              Personel Görevlendirme
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 20 }}>
              {allUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    marginBottom: 6,
                    background: selectedUserIds.includes(user.id)
                      ? 'var(--accent-soft)'
                      : 'var(--bg-2)',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 20, height: 20,
                    border: `2px solid var(--accent)`,
                    borderRadius: 'var(--radius-sm)',
                    background: selectedUserIds.includes(user.id) ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 12,
                  }}>
                    {selectedUserIds.includes(user.id) && '✓'}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>
                    {user.username}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowAssignModal(false); setSelectedUserIds([]); }}
                style={{
                  flex: 1, padding: 12, borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', background: 'none',
                  color: 'var(--text-2)', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontWeight: 600,
                }}
              >
                İptal
              </button>
              <button
                onClick={handleAssign}
                style={{
                  flex: 1, padding: 12, borderRadius: 'var(--radius)',
                  border: 'none', background: 'var(--accent)',
                  color: 'white', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Görevlendir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
