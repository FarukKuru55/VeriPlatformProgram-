import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function FormsListTab({
  newFormTitle, setNewFormTitle,
  startDate, setStartDate,
  endDate, setEndDate,
  isRecurring, setIsRecurring,
  recurrenceType, setRecurrenceType,
  handleCreateTemplate,
  formTemplates,
  setSelectedForm,
  setActiveTab,
  handleDeleteTemplate,
  api,
  Ico
}) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetForm, setTargetForm] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const openAssignModal = async (form) => {
    setTargetForm(form);
    try {
      const r = await api.get('/Auth/users');
      setAllUsers(r.data);
      setShowAssignModal(true);
    } catch {
      toast.error("Kullanıcı listesi alınamadı.");
    }
  };

  const handleAssign = async () => {
    if (selectedUserIds.length === 0) return toast.error("En az bir kullanıcı seçmelisiniz.");
    try {
      await api.post('/Form/assign', {
        formTemplateId: targetForm.id,
        userIds: selectedUserIds
      });
      toast.success(`Görevlendirildi!`);
      setShowAssignModal(false);
      setSelectedUserIds([]);
    } catch {
      toast.error("Atama başarısız.");
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-1)' }}>Form Yönetimi</div>
        <div className="page-desc" style={{ color: 'var(--text-2)', fontSize: '14px' }}>Yeni form oluşturun veya personellere form atayın.</div>
      </div>

      {/* 🟢 FORM EKLEME PANELİ */}
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input className="text-input" style={{ flex: 1, marginBottom: 0, background: 'var(--bg)', color: 'var(--text-1)', border: '1px solid var(--border-2)', padding: '12px', borderRadius: '10px', outline: 'none' }} type="text"
            placeholder="Yeni form adı girin (Örn: Haftalık Rapor)"
            value={newFormTitle} onChange={e => setNewFormTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateTemplate()} 
          />
          <button className="primary-btn" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }} onClick={handleCreateTemplate}>
            {Ico.plus} Oluştur
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ flex: '1 1 200px' }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-2)', marginBottom: '8px' }}>AÇILIŞ TARİHİ</span>
            <input className="text-input" style={{ width: '100%', marginBottom: 0, background: 'var(--bg)', color: 'var(--text-1)', border: '1px solid var(--border-2)', padding: '12px', borderRadius: '10px' }} type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-2)', marginBottom: '8px' }}>KAPANIŞ TARİHİ</span>
            <input className="text-input" style={{ width: '100%', marginBottom: 0, background: 'var(--bg)', color: 'var(--text-1)', border: '1px solid var(--border-2)', padding: '12px', borderRadius: '10px' }} type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px', height: '44px' }}>
            <input type="checkbox" id="rec" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }} />
            <label htmlFor="rec" style={{ fontSize: '13px', color: 'var(--text-1)', fontWeight: '600', cursor: 'pointer' }}>Periyodik</label>
            {isRecurring && (
              <select className="text-input" style={{ width: 'auto', padding: '0 8px', height: '36px', background: 'var(--bg)', border: '1px solid var(--border-2)', borderRadius: '8px' }} value={recurrenceType} onChange={e => setRecurrenceType(e.target.value)}>
                <option value="Daily">Günlük</option>
                <option value="Weekly">Haftalık</option>
                <option value="Monthly">Aylık</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* 🚀 FORM KARTLARI LİSTESİ */}
      <div className="forms-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {formTemplates.map(form => (
          <div className="form-card" key={form.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '8px', borderRadius: '10px', display: 'flex' }}>{Ico.doc}</div>
              <button onClick={() => openAssignModal(form)} style={{ background: 'var(--purple-bg)', color: 'var(--purple)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {Ico.users} GÖREV ATA
              </button>
            </div>

            <div onClick={() => { setSelectedForm(form); setActiveTab('builder'); }} style={{ cursor: 'pointer' }}>
              <div style={{ color: 'var(--text-1)', fontSize: '18px', fontWeight: '700' }}>{form.title}</div>
              <div style={{ color: 'var(--text-3)', fontSize: '12px', marginTop: '4px' }}>#{form.id}</div>
            </div>

            {/* 🕒 TARİH VE DURUM BİLGİSİ */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--accent)', display: 'flex' }}>{Ico.clock}</span>
                <span>Başlangıç: <b>{form.startDate ? new Date(form.startDate).toLocaleDateString('tr-TR') : 'Belirtilmedi'}</b></span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--red)', display: 'flex' }}>{Ico.clock}</span>
                <span>Bitiş: <b>{form.endDate ? new Date(form.endDate).toLocaleDateString('tr-TR') : 'Süresiz'}</b></span>
              </div>

             {form.isRecurring && (
  <div style={{ 
    marginTop: '4px', 
    display: 'inline-flex', 
    alignSelf: 'flex-start', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '4px 8px', 
    background: 'var(--purple-bg)', 
    color: 'var(--purple)', 
    borderRadius: '6px', 
    fontSize: '10px', 
    fontWeight: '800', 
    textTransform: 'uppercase' 
  }}>
    {Ico.repeat} 
    {(() => {
      switch(form.recurrenceType) {
        case 'Daily':   return 'Her Gün ';
        case 'Weekly':  return 'Haftalık ';
        case 'Monthly': return 'Aylık ';
        default:        return 'Periyodik Form';
      }
    })()}
  </div>
)}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
               <button onClick={() => { setSelectedForm(form); setActiveTab('builder'); }} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>Düzenle →</button>
               <button onClick={() => handleDeleteTemplate(form.id)} style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>{Ico.trash}</button>
            </div>
          </div>
        ))}
      </div>

      {/* ATAMA MODALI */}
      {showAssignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', width: '400px', borderRadius: '20px', padding: '24px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-1)', marginBottom: '16px' }}>Personel Görevlendir</div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' }}>
              {allUsers.map(user => (
                <div key={user.id} onClick={() => setSelectedUserIds(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '8px', transition: '0.2s', background: selectedUserIds.includes(user.id) ? 'var(--accent-glow)' : 'var(--bg-2)' }}>
                  <div style={{ width: '18px', height: '18px', border: '2px solid var(--accent)', borderRadius: '5px', background: selectedUserIds.includes(user.id) ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
                    {selectedUserIds.includes(user.id) && '✓'}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-1)' }}>{user.username}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAssignModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>Vazgeç</button>
              <button onClick={handleAssign} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Ata</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}