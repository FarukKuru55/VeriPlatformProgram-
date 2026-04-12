import React from 'react';
import { FaFileAlt, FaInbox } from 'react-icons/fa';

/**
 * ResponsesTab.jsx
 * ─────────────────────────────────────────────
 * Seçili formun gelen yanıtlarını listeler.
 * Her yanıt satırı: ID/tarih, yanıtlar, durum, not, kaydet.
 * Props:
 *  - submissions              : Yanıt listesi
 *  - searchQuery / setSearchQuery : Arama filtresi
 *  - questions                : Soru listesi (label eşleştirmek için)
 *  - handleSubmissionChange   : Lokal state günceller (optimistic)
 *  - handleUpdateSubmission   : API'ye kaydeder
 *  - Ico                      : SVG ikon nesnesi
 */

/** Durum seçici için arka plan / metin rengi */
const statusStyle = (status) => {
  switch (status) {
    case 'Tamamlandı':
      return { background: 'var(--green-bg)',  color: 'var(--green)',  border: '1px solid rgba(52,211,153,0.2)' };
    case 'İşlemde':
      return { background: 'var(--amber-bg)', color: 'var(--amber)', border: '1px solid rgba(251,191,36,0.2)' };
    default:
      return { background: 'var(--surface)',  color: 'var(--text-2)', border: '1px solid var(--border-2)' };
  }
};

export default function ResponsesTab({
  submissions,
  searchQuery, setSearchQuery,
  questions,
  handleSubmissionChange,
  handleUpdateSubmission,
  Ico,
}) {
  /* ── Yanıt JSON'ını okunabilir karta dönüştür ── */
  const renderAnswers = (answersJson) => {
    try {
      const parsed = JSON.parse(answersJson);
      return Object.entries(parsed).map(([qId, value]) => {
        const question = questions.find((q) => q.id === parseInt(qId));
        const label    = question ? question.label : `Soru #${qId}`;
        const qType    = question?.type ?? 'text';

        /* Değeri tipine göre formatla */
        let display = value;
        if ((qType === 'date' || qType === 'datetime-local') && value) {
          display = new Date(value).toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', year: 'numeric',
          });
        } else if (qType === 'file' && typeof value === 'string' && value.startsWith('http')) {
          display = (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid rgba(79,142,247,0.2)',
              }}
            >
              <FaFileAlt /> Dosyayı Aç
            </a>
          );
        } else if (Array.isArray(value)) {
          display = value.join(', ');
        }

        return (
          <div className="answer-item" key={qId}>
            <div className="answer-question">{label}</div>
            <div className="answer-value">
              {display || (
                <span style={{ color: 'var(--text-3)', fontStyle: 'italic', fontWeight: 400 }}>
                  Yanıt yok
                </span>
              )}
            </div>
          </div>
        );
      });
    } catch {
      return <span style={{ color: 'var(--red)', fontSize: 12 }}>Veri işlenemedi.</span>;
    }
  };

  const filtered = submissions.filter(
    (s) =>
      !searchQuery ||
      s.answersJson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.id).includes(searchQuery)
  );

  return (
    <div>
      {/* ── Araç Çubuğu ── */}
      <div className="responses-toolbar">
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
          <span style={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 16 }}>
            {filtered.length}
          </span>{' '}
          kayıt bulundu
        </div>
        <div className="responses-search">
          <div className="responses-search-icon">{Ico.search}</div>
          <input
            type="text"
            placeholder="Yanıt veya kayıt numarası ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Tablo ── */}
      <div className="responses-table-wrap">
        <table className="responses-table">
          <thead className="rt-head">
            <tr>
              <th className="rt-th">Kayıt No</th>
              <th className="rt-th">Yanıt Bilgileri</th>
              <th className="rt-th">Durum</th>
              <th className="rt-th">Yönetici Açıklaması</th>
              <th className="rt-th">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((s) => (
                <tr className="rt-tr" key={s.id}>
                  {/* ID & Tarih */}
                  <td className="rt-td">
                    <div className="submission-id">#{s.id}</div>
                    <div className="submission-date">
                      {new Date(s.submittedAt).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="submission-date">
                      {new Date(s.submittedAt).toLocaleTimeString('tr-TR')}
                    </div>
                  </td>

                  {/* Yanıt detayı */}
                  <td className="rt-td">
                    <div className="answer-block">
                      {renderAnswers(s.answersJson)}
                    </div>
                  </td>

                  {/* Durum seçici */}
                  <td className="rt-td">
                    <select
                      className="status-select"
                      value={s.status || 'Yeni'}
                      onChange={(e) => handleSubmissionChange(s.id, 'status', e.target.value)}
                      style={statusStyle(s.status)}
                    >
                      <option value="Yeni">● Yeni</option>
                      <option value="İşlemde">● İşlemde</option>
                      <option value="Tamamlandı">● Tamamlandı</option>
                    </select>
                  </td>

                  {/* Not */}
                  <td className="rt-td">
                    <textarea
                      className="note-textarea"
                      placeholder="Açıklama ekleyiniz..."
                      value={s.adminNote || ''}
                      onChange={(e) => handleSubmissionChange(s.id, 'adminNote', e.target.value)}
                    />
                  </td>

                  {/* Kaydet */}
                  <td className="rt-td">
                    <button
                      className="save-btn"
                      onClick={() => handleUpdateSubmission(s.id, s.status, s.adminNote)}
                    >
                      Güncelle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{ padding: '60px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}
                >
                  <FaInbox style={{ fontSize: 32, marginBottom: 10 }} />
                  {searchQuery
                    ? 'Arama kriterine uygun kayıt bulunamadı.'
                    : 'Bu form için henüz yanıt alınmamıştır.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}