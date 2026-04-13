import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5062/api/Form';

export default function PublicFormPage() {
  const [slug, setSlug] = useState('');
  const [formData, setFormData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/f\/([a-zA-Z0-9]+)$/);
    if (match) {
      setSlug(match[1]);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;

    const fetchForm = async () => {
      try {
        const res = await axios.get(`${API_URL}/public/${slug}`);
        setFormData(res.data.template);
        setQuestions(res.data.questions.sort((a, b) => a.order - b.order));
        setLoading(false);
      } catch (err) {
        setError('Form bulunamadı veya erişime kapalı.');
        setLoading(false);
      }
    };

    fetchForm();
  }, [slug]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleFileUpload = async (questionId, file) => {
    if (!file) return;
    const toastId = toast.loading('Dosya yükleniyor...');
    const formDataFile = new FormData();
    formDataFile.append('file', file);
    try {
      const res = await axios.post(`${API_URL}/upload`, formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleAnswerChange(questionId, res.data.url);
      toast.success('Dosya eklendi!', { id: toastId });
    } catch { toast.error('Yükleme başarısız.', { id: toastId }); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missing = questions.filter(q => {
      if (!q.isRequired) return false;
      const ans = answers[q.id];
      return !ans || (Array.isArray(ans) && ans.length === 0);
    });

    if (missing.length > 0) {
      return toast.error(`Lütfen zorunlu alanları doldurun: ${missing.map(q => q.label).join(', ')}`);
    }

    if (Object.keys(answers).length === 0) {
      return toast.error('Lütfen en az bir soruyu cevaplayın.');
    }

    try {
      await axios.post(`${API_URL}/public/submit`, {
        slug,
        answers
      });
      setSubmitted(true);
      toast.success('Yanıtınız başarıyla kaydedildi!');
    } catch { toast.error('Gönderim sırasında bir hata oluştu.'); }
  };

  const renderInput = (q) => {
    const options = q.optionsJson ? JSON.parse(q.optionsJson) : [];

    switch (q.type) {
      case 'radio':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {options.map((opt, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  style={{ width: '18px', height: '18px', accentColor: '#6366f1' }}
                />
                <span style={{ fontSize: '14px' }}>{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {options.map((opt, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={(answers[q.id] || []).includes(opt)}
                  onChange={(e) => {
                    const current = answers[q.id] || [];
                    const updated = e.target.checked
                      ? [...current, opt]
                      : current.filter(x => x !== opt);
                    handleAnswerChange(q.id, updated);
                  }}
                  style={{ width: '18px', height: '18px', accentColor: '#6366f1' }}
                />
                <span style={{ fontSize: '14px' }}>{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'select':
        return (
          <select
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="">Seçiniz...</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        );
      case 'file':
        return (
          <div>
            {answers[q.id] && (
              <div style={{ marginBottom: '8px', color: '#10b981', fontSize: '13px' }}>Dosya yüklendi</div>
            )}
            <input
              type="file"
              onChange={(e) => handleFileUpload(q.id, e.target.files[0])}
              style={{ fontSize: '14px' }}
            />
          </div>
        );
      case 'date':
        return (
          <input
            type="date"
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        );
      default:
        return (
          <input
            type={q.type === 'number' ? 'number' : 'text'}
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        );
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: '#64748b' }}>Form yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>{error}</div>
          <a href="/" style={{ color: '#6366f1', textDecoration: 'none' }}>Anasayfaya dön</a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '480px', width: '100%' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white', fontSize: '40px' }}>✓</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Teşekkürler!</div>
          <div style={{ fontSize: '15px', color: '#64748b', marginBottom: '32px' }}>Yanıtınız başarıyla kaydedildi.</div>
          <a href="/" style={{ display: 'inline-block', padding: '12px 24px', background: '#6366f1', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Anasayfaya Dön</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '32px', color: 'white' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '8px' }}>Form</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{formData?.title}</div>
            {formData?.description && <div style={{ marginTop: '8px', opacity: 0.9, fontSize: '14px' }}>{formData.description}</div>}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
            {questions.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Bu formda henüz soru bulunmuyor.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {questions.map((q, idx) => (
                  <div key={q.id}>
                    <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>
                      {idx + 1}. {q.label}
                      {q.isRequired && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                    </label>
                    {q.imageUrl && (
                      <img src={q.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '12px' }} />
                    )}
                    {renderInput(q)}
                  </div>
                ))}
              </div>
            )}

            {questions.length > 0 && (
              <button
                type="submit"
                style={{
                  marginTop: '32px',
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
              >
                Gönder
              </button>
            )}
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#94a3b8' }}>
          VeriPlatform • Açık Form
        </div>
      </div>
    </div>
  );
}