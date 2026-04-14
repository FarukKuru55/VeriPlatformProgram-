import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5062/api'
});

export default function PublicForm() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const r = await api.get(`/Form/public/${slug}`);
        setForm(r.data);
      } catch (err) {
        toast.error('Form bulunamadı veya erişilemiyor.');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/Form/public/submit', { slug, answers });
      setSubmitted(true);
    } catch (err) {
      toast.error('Gönderim sırasında hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCurrencyChange = (questionId, value) => {
    const cleaned = value.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
    handleChange(questionId, cleaned);
  };

  const renderQuestion = (q) => {
    const value = answers[q.id] || '';
    const isRequired = q.isRequired;

    switch (q.type) {
      case 'currency':
        return (
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '16px',
              fontSize: '16px',
              fontWeight: 700,
              color: '#6366f1'
            }}>₺</span>
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => handleCurrencyChange(q.id, e.target.value)}
              placeholder="0,00"
              required={isRequired}
              style={{
                width: '100%',
                padding: '14px 16px 14px 36px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(q.id, e.target.value)}
            placeholder="Yanıtınızı buraya yazın..."
            required={isRequired}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '14px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '15px',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        );
      case 'radio':
        const options = q.optionsJson ? JSON.parse(q.optionsJson) : [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {options.map((opt, idx) => (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  border: `1px solid ${value === opt ? '#6366f1' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: value === opt ? 'rgba(99, 102, 241, 0.05)' : 'white',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  style={{ accentColor: '#6366f1', width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '15px', color: '#1e293b' }}>{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        const checkOptions = q.optionsJson ? JSON.parse(q.optionsJson) : [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checkOptions.map((opt, idx) => {
              const checkedValues = Array.isArray(value) ? value : [];
              const isChecked = checkedValues.includes(opt);
              return (
                <label
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    border: `1px solid ${isChecked ? '#6366f1' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isChecked ? 'rgba(99, 102, 241, 0.05)' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newValues = isChecked
                        ? checkedValues.filter(v => v !== opt)
                        : [...checkedValues, opt];
                      handleChange(q.id, newValues);
                    }}
                    style={{ accentColor: '#6366f1', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '15px', color: '#1e293b' }}>{opt}</span>
                </label>
              );
            })}
          </div>
        );
      default:
        return (
          <input
            type={q.type === 'number' ? 'number' : q.type === 'date' ? 'date' : 'text'}
            value={value}
            onChange={(e) => handleChange(q.id, e.target.value)}
            placeholder="Yanıtınızı girin..."
            required={isRequired}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '15px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        );
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
          <div style={{ color: '#64748b', fontSize: '15px' }}>Form yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
          }}>
            <svg width="36" height="36" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '12px'
          }}>
            Teşekkürler!
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '32px'
          }}>
            Yanıtınız başarıyla kaydedildi.
          </p>
          <button
            onClick={() => { setSubmitted(false); setAnswers({}); }}
            style={{
              padding: '12px 28px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            Yeni Yanıt Gönder
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px'
        }}>
          <h2 style={{ color: '#0f172a', marginBottom: '12px' }}>Form bulunamadı</h2>
          <p style={{ color: '#64748b' }}>Bu link geçersiz veya süresi dolmuş olabilir.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '640px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            marginBottom: '16px',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.25)'
          }}>
            <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '8px'
          }}>
            {form.title}
          </h1>
          {form.description && (
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              maxWidth: '480px',
              margin: '0 auto'
            }}>
              {form.description}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0'
          }}>
            {form.questions?.map((q, idx) => (
              <div key={q.id} style={{ marginBottom: '28px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '10px'
                }}>
                  {idx + 1}. {q.label}
                  {q.isRequired && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                </label>
                {q.imageUrl && (
                  <img
                    src={q.imageUrl}
                    alt=""
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '10px',
                      marginBottom: '12px'
                    }}
                  />
                )}
                {renderQuestion(q)}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '16px',
                background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: submitting ? 'none' : '0 4px 16px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                  Gönderiliyor...
                </span>
              ) : (
                'Gönder'
              )}
            </button>
          </div>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          color: '#94a3b8',
          fontSize: '13px'
        }}>
          VeriPlatform © 2026
        </div>
      </div>
    </div>
  );
}