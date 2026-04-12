import React from 'react';
import { FaFileAlt, FaInbox, FaSearch, FaCheck, FaClock, FaEdit, FaSave, FaChevronDown, FaChevronUp, FaUser, FaCalendar } from 'react-icons/fa';

export default function ResponsesTab({
  submissions,
  searchQuery, setSearchQuery,
  questions,
  handleSubmissionChange,
  handleUpdateSubmission,
}) {
  const statusConfig = {
    'Yeni': { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <FaEdit size={11} />, label: 'Yeni' },
    'İşlemde': { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: <FaClock size={11} />, label: 'İşlemde' },
    'Tamamlandı': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <FaCheck size={11} />, label: 'Tamamlandı' },
  };

  const [expandedId, setExpandedId] = React.useState(null);

  const renderAnswers = (answersJson) => {
    try {
      const parsed = JSON.parse(answersJson);
      return Object.entries(parsed).map(([qId, value], index) => {
        const question = questions.find((q) => q.id === parseInt(qId));
        const label = question ? question.label : `Soru #${qId}`;
        const qType = question?.type ?? 'text';

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
                gap: '6px',
                padding: '6px 12px',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all var(--transition)'
              }}
            >
              <FaFileAlt size={12} /> Dosyayı Aç
            </a>
          );
        } else if (qType === 'image' && typeof value === 'string' && value.startsWith('http')) {
          display = (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(139, 92, 246, 0.1)',
                color: '#7c3aed',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Görseli Gör
            </a>
          );
        } else if (Array.isArray(value)) {
          display = value.map((v, i) => (
            <span key={i} style={{
              display: 'inline-block',
              padding: '3px 10px',
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              marginRight: '6px',
              marginBottom: '4px',
              border: '1px solid var(--border)'
            }}>
              {v}
            </span>
          ));
        }

        return (
          <div key={qId} style={{
            padding: '12px 0',
            borderBottom: index < Object.entries(parsed).length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-3)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '20px',
                height: '20px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700
              }}>
                {index + 1}
              </span>
              {label}
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-1)',
              paddingLeft: '26px'
            }}>
              {display || (
                <span style={{ color: 'var(--text-4)', fontStyle: 'italic', fontSize: '13px' }}>
                  Yanıt yok
                </span>
              )}
            </div>
          </div>
        );
      });
    } catch {
      return <span style={{ color: '#ef4444', fontSize: '12px' }}>Veri işlenemedi.</span>;
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
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <FaInbox size={20} />
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
              Gelen Yanıtlar
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: '#6366f1'
              }}>
                {filtered.length}
              </span> kayıt bulundu
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          border: '1px solid var(--border)',
          width: '320px'
        }}>
          <FaSearch size={16} color="var(--text-3)" />
          <input
            type="text"
            placeholder="Yanıt veya kayıt numarası ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: 'var(--text-1)',
              width: '100%'
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          padding: '100px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%)',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border)'
          }}>
            <FaInbox size={36} color="var(--text-4)" />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '8px' }}>
            {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz yanıt alınmamış'}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-3)', maxWidth: '300px', margin: '0 auto' }}>
            {searchQuery
              ? 'Farklı bir arama terimi deneyin'
              : 'Kullanıcılar formu doldurduğunda yanıtlar burada görünecek'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((s) => {
            const status = statusConfig[s.status] || statusConfig['Yeni'];
            const isExpanded = expandedId === s.id;

            return (
              <div key={s.id} style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: isExpanded ? 'var(--surface-2)' : 'var(--surface)',
                  transition: 'background var(--transition)'
                }}
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '15px',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)'
                    }}>
                      #{s.id}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCalendar size={11} />
                        Gönderim Tarihi
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>
                        {new Date(s.submittedAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                      value={s.status || 'Yeni'}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSubmissionChange(s.id, 'status', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: '8px 32px 8px 12px',
                        borderRadius: 'var(--radius)',
                        border: `1px solid ${status.color}`,
                        background: status.bg,
                        color: status.color,
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(status.color)}' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        boxShadow: 'none'
                      }}
                    >
                      <option value="Yeni">Yeni</option>
                      <option value="İşlemde">İşlemde</option>
                      <option value="Tamamlandı">Tamamlandı</option>
                    </select>

                    <div style={{
                      padding: '8px',
                      borderRadius: 'var(--radius)',
                      color: 'var(--text-3)',
                      transition: 'all var(--transition)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    animation: 'slideDown 0.2s ease'
                  }}>
                    <div style={{ padding: '20px' }}>
                      {renderAnswers(s.answersJson)}
                    </div>

                    <div style={{
                      padding: '16px 20px',
                      borderTop: '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--text-3)',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Yönetici Notu
                        </label>
                        <textarea
                          placeholder="Açıklama ekleyiniz..."
                          value={s.adminNote || ''}
                          onChange={(e) => handleSubmissionChange(s.id, 'adminNote', e.target.value)}
                          style={{
                            width: '100%',
                            minHeight: '60px',
                            padding: '10px 12px',
                            border: '1px solid var(--border-2)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '13px',
                            color: 'var(--text-1)',
                            background: 'var(--surface)',
                            resize: 'vertical',
                            outline: 'none',
                            transition: 'all var(--transition)',
                            fontFamily: 'inherit'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--accent)';
                            e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border-2)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleUpdateSubmission(s.id, s.status, s.adminNote)}
                        style={{
                          padding: '11px 20px',
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.1)',
                          transition: 'all var(--transition)'
                        }}
                      >
                        <FaSave size={13} />
                        Kaydet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
