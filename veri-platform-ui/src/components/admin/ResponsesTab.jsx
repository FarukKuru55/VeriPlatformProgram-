import React from 'react';

export default function ResponsesTab({
  submissions,
  searchQuery,
  setSearchQuery,
  questions, // Soruları eşleştirmek için kullanacağız
  handleSubmissionChange,
  handleUpdateSubmission,
  Ico
}) {

  // Durum renklerini belirleyen yardımcı fonksiyon (Eksikti, ekledim)
  const statusStyle = (status) => {
    switch (status) {
      case 'Tamamlandı': return { border: '1px solid var(--green)', color: 'var(--green)', background: 'var(--green-bg)' };
      case 'İşlemde': return { border: '1px solid var(--amber)', color: 'var(--amber)', background: 'var(--amber-bg)' };
      default: return { border: '1px solid var(--red)', color: 'var(--red)', background: 'var(--red-bg)' };
    }
  };

  // Yanıtları okunaklı hale getiren ve SORU METNİNİ bulan fonksiyon
const renderAnswers = (answersJson) => {
  try {
    const answers = JSON.parse(answersJson);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(answers).map(([questionId, value], index) => {
          const question = questions.find(q => q.id === parseInt(questionId));
          const questionLabel = question ? question.label : `Soru #${questionId}`;
          const questionType = question ? question.type : 'text';

          // 🛠 Değeri tipine göre formatlayalım
          let formattedValue = value;

          if (questionType === 'date' || questionType === 'datetime-local') {
            // Tarihi daha okunaklı yap (Örn: 9 Mayıs 2026)
            formattedValue = new Date(value).toLocaleDateString('tr-TR', {
              day: 'numeric', month: 'long', year: 'numeric'
            });
          } else if (questionType === 'file' && value && value.startsWith('http')) {
            // Dosya ise buton yap
            formattedValue = (
              <a href={value} target="_blank" rel="noreferrer" 
                 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: '6px', fontSize: '12px', fontWeight: '700', textDecoration: 'none', border: '1px solid var(--accent)' }}>
                {Ico.doc || '📁'} Dosyayı Aç
              </a>
            );
          } else if (Array.isArray(value)) {
            formattedValue = value.join(', ');
          }

          return (
            <div key={index} style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{questionLabel}</span>
                <span style={{ opacity: 0.5 }}>{questionType}</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-1)', fontWeight: '600', lineHeight: '1.4' }}>
                {formattedValue || <span style={{ color: 'var(--text-3)', fontWeight: '400', fontStyle: 'italic' }}>Yanıt yok</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  } catch (e) {
    return <span style={{ color: 'var(--red)' }}>Veri ayrıştırılamadı.</span>;
  }
};

  const filteredSubs = submissions.filter(s => 
    !searchQuery || 
    s.answersJson?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    String(s.id).includes(searchQuery)
  );

  return (
    <div>
      {/* TOOLBAR */}
      <div className="responses-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
          <span style={{ color: 'var(--text-1)', fontFamily: "'Inter', monospace", fontSize: '16px' }}>{filteredSubs.length}</span> kayıt bulundu
        </div>
        <div className="responses-search" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', width: '300px' }}>
          <div style={{ color: 'var(--text-3)', marginRight: '8px', display: 'flex' }}>{Ico.search}</div>
          <input type="text" placeholder="Yanıt veya ID ara..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', color: 'var(--text-1)', outline: 'none', width: '100%', fontSize: '13px' }} />
        </div>
      </div>

      {/* TABLO */}
      <div className="responses-table-wrap" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <table className="responses-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '16px', color: 'var(--text-2)', fontSize: '12px', fontWeight: '600', width: '150px' }}>KAYIT BİLGİSİ</th>
              <th style={{ padding: '16px', color: 'var(--text-2)', fontSize: '12px', fontWeight: '600' }}>YANITLAR</th>
              <th style={{ padding: '16px', color: 'var(--text-2)', fontSize: '12px', fontWeight: '600', width: '160px' }}>DURUM</th>
              <th style={{ padding: '16px', color: 'var(--text-2)', fontSize: '12px', fontWeight: '600', width: '200px' }}>YÖNETİCİ NOTU</th>
              <th style={{ padding: '16px', color: 'var(--text-2)', fontSize: '12px', fontWeight: '600', textAlign: 'right', width: '100px' }}>İŞLEM</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.length > 0 ? filteredSubs.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  <div style={{ color: 'var(--accent)', fontWeight: '700', fontFamily: "'Inter', monospace", marginBottom: '4px' }}>#{s.id}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: '12px' }}>{new Date(s.submittedAt).toLocaleDateString('tr-TR')}</div>
                  <div style={{ color: 'var(--text-3)', fontSize: '11px' }}>{new Date(s.submittedAt).toLocaleTimeString('tr-TR')}</div>
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  {renderAnswers(s.answersJson)}
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  <select 
                    value={s.status || 'Yeni'} 
                    onChange={e => handleSubmissionChange(s.id, 'status', e.target.value)} 
                    style={{ 
                        ...statusStyle(s.status), 
                        width: '100%',
                        padding: '8px', 
                        borderRadius: '8px', 
                        outline: 'none', 
                        cursor: 'pointer', 
                        fontSize: '12px', 
                        fontWeight: '700' 
                    }}
                  >
                    <option value="Yeni">Yeni</option>
                    <option value="İşlemde">İşlemde</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                  </select>
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  <textarea 
                    placeholder="Not ekle..." 
                    value={s.adminNote || ''} 
                    onChange={e => handleSubmissionChange(s.id, 'adminNote', e.target.value)} 
                    style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', fontSize: '12px', outline: 'none' }} 
                  />
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleUpdateSubmission(s.id, s.status, s.adminNote)} 
                    style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Kaydet
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-3)' }}>
                  {searchQuery ? 'Arama kriterine uygun kayıt bulunamadı.' : 'Bu form için henüz yanıt yok.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}