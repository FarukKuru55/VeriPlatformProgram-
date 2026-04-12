import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import { FaInbox, FaClipboard, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import './userpanel.css';

/* ─── İkonlar ─── */
const BackIcon   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const ArrowIcon  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const SendIcon   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4z"/></svg>;
const AdminIcon  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const LogoutIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
const CheckIcon  = () => <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>;

/* ──────────────────────────────────────
   GÖREV LİSTESİ
────────────────────────────────────── */
const UserTasks = ({ tasks, handleSelectForm }) => {
  const getDeadlineStatus = (endDate) => {
    if (!endDate) return { label: 'Süresiz', cls: 'neutral' };
    const diff = Math.ceil((new Date(endDate) - new Date()) / 86400000);
    if (diff < 0)  return { label: 'Süresi Doldu', cls: 'urgent' };
    if (diff <= 3) return { label: `${diff} gün kaldı`, cls: 'urgent' };
    return { label: `${new Date(endDate).toLocaleDateString('tr-TR')} bitiş`, cls: 'normal' };
  };

  if (tasks.length === 0) {
    return (
      <div className="no-tasks">
        <FaInbox className="no-tasks-icon" />
        <div className="no-tasks-title">Atanmış göreviniz bulunmuyor</div>
        <div className="no-tasks-desc">Yöneticiniz size bir form atadığında burada görünecek.</div>
      </div>
    );
  }

  return (
    <div className="tasks-grid">
      {tasks.map(task => {
        const dl = getDeadlineStatus(task.endDate);
        return (
          <div key={task.id} className="task-card" onClick={() => handleSelectForm(task)}>
            <div className="task-icon"><FaClipboard /></div>
            <div className="task-content">
              <div className="task-title">{task.title}</div>
              <div className="task-date">
                <span className={`task-deadline-badge ${dl.cls}`}>{dl.label}</span>
              </div>
            </div>
            <div className="task-arrow"><ArrowIcon /></div>
          </div>
        );
      })}
    </div>
  );
};

/* ──────────────────────────────────────
   ANA COMPONENT
────────────────────────────────────── */
export default function UserPanel() {
  const [tasks, setTasks]                         = useState([]);
  const [selectedFormId, setSelectedFormId]       = useState(null);
  const [selectedFormTitle, setSelectedFormTitle] = useState('');
  const [questions, setQuestions]                 = useState([]);
  const [answers, setAnswers]                     = useState({});
  const [isAdmin, setIsAdmin]                     = useState(false);
  const [answeredCount, setAnsweredCount]         = useState(0);

  const checkIfAdmin = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
      if (role === 'Admin' || (Array.isArray(role) && role.includes('Admin'))) setIsAdmin(true);
    } catch { /* silent */ }
  };

  const fetchMyTasks = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5062/api/Form/my-tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch { toast.error('Görev listeniz yüklenemedi.'); }
  };

  const fetchQuestions = async (formId) => {
    try {
      const res = await axios.get(`http://localhost:5062/api/Form/templates/${formId}/questions`);
      setQuestions(res.data.sort((a, b) => a.order - b.order));
    } catch { toast.error('Sorular yüklenemedi.'); }
  };

  const handleSelectForm = (task) => {
    setSelectedFormId(task.formTemplateId);
    setSelectedFormTitle(task.title);
    fetchQuestions(task.formTemplateId);
    window.history.pushState({}, '', `/user?formId=${task.formTemplateId}`);
  };

  const handleBack = () => {
    setSelectedFormId(null); setQuestions([]); setAnswers({});
    window.history.pushState({}, '', '/user');
    fetchMyTasks();
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleFileUpload = async (questionId, file) => {
    if (!file) return;
    const toastId = toast.loading('Dosya yükleniyor...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5062/api/Form/upload', formData, {
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

    if (missing.length > 0)
      return toast.error(`Zorunlu alanları doldurun: ${missing.map(q => q.label).join(', ')}`);

    if (Object.keys(answers).length === 0)
      return toast.error('Lütfen en az bir soruyu cevaplayın.');

    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `http://localhost:5062/api/Form/templates/${selectedFormId}/submit`,
        answers,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Yanıtlarınız başarıyla kaydedildi!');
      setAnswers({});
      setTimeout(handleBack, 1500);
    } catch { toast.error('Gönderim sırasında bir hata oluştu.'); }
  };

  useEffect(() => {
    checkIfAdmin();
    const params = new URLSearchParams(window.location.search);
    const formId = params.get('formId');
    if (formId) { setSelectedFormId(formId); fetchQuestions(formId); }
    else fetchMyTasks();
  }, []);

  useEffect(() => {
    const count = questions.filter(q => {
      const val = answers[q.id];
      if (val === undefined || val === null || val === '') return false;
      if (Array.isArray(val)) return val.length > 0;
      return true;
    }).length;
    setAnsweredCount(count);
  }, [answers, questions]);

  const renderInput = (q) => {
    const options = q.optionsJson ? JSON.parse(q.optionsJson) : [];

    switch (q.type) {
      case 'radio':
        return (
          <div className="options-container">
            {options.map((opt, i) => (
              <label key={i} className={`radio-option ${answers[q.id] === opt ? 'selected' : ''}`}>
                <input type="radio" name={`q-${q.id}`} value={opt}
                  checked={answers[q.id] === opt}
                  onChange={e => handleAnswerChange(q.id, e.target.value)}
                  style={{ display: 'none' }} />
                <div className="custom-radio">
                  {answers[q.id] === opt && <div className="radio-dot" />}
                </div>
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="options-container">
            {options.map((opt, i) => {
              const checked = (answers[q.id] || []).includes(opt);
              return (
                <label key={i} className={`checkbox-option ${checked ? 'selected' : ''}`}>
                  <input type="checkbox" value={opt} checked={checked}
                    onChange={e => {
                      const cur = answers[q.id] || [];
                      handleAnswerChange(q.id, e.target.checked
                        ? [...cur, opt]
                        : cur.filter(a => a !== opt));
                    }} style={{ display: 'none' }} />
                  <div className="custom-checkbox">
                    {checked && <CheckIcon />}
                  </div>
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div className="file-upload-wrapper">
            <label className="file-upload-area">
              <input type="file" style={{ display: 'none' }}
                onChange={e => handleFileUpload(q.id, e.target.files[0])} />
              <div className="file-upload-icon"><FaFileAlt /></div>
              <div className="file-upload-text">
                {answers[q.id] ? 'Dosyayı Değiştir' : 'Dosya seçmek için tıklayın'}
              </div>
              <div className="file-upload-hint">veya sürükleyip bırakın</div>
            </label>
            {answers[q.id] && (
              <div className="file-success">
                <FaCheckCircle style={{ marginRight: 4 }} /> Yüklendi —{' '}
                <a href={answers[q.id]} target="_blank" rel="noreferrer">Görüntüle</a>
              </div>
            )}
          </div>
        );

      default:
        return (
          <input className="q-input"
            type={q.type === 'money' ? 'number' : q.type}
            placeholder={
              q.type === 'number' ? '0'
              : q.type === 'date' ? ''
              : 'Cevabınızı buraya yazın...'
            }
            value={answers[q.id] || ''}
            onChange={e => handleAnswerChange(q.id, e.target.value)}
          />
        );
    }
  };

  const progressPercent = questions.length > 0
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  /* ─────────── RENDER ─────────── */
  return (
    <div className="up-root">

      {/* TOPBAR */}
      <div className="up-topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">VP</div>
          <div className="topbar-name">Veri<span>Platform</span></div>
        </div>
        <div className="topbar-actions">
          {isAdmin && (
            <button className="topbar-btn admin"
              onClick={() => window.location.href = '/admin'}>
              <AdminIcon /> Yönetim Paneli
            </button>
          )}
          <button className="topbar-btn danger"
            onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}>
            <LogoutIcon /> Çıkış
          </button>
        </div>
      </div>

      {/* CONTAINER */}
      <div className="up-container">

        {/* GÖREV LİSTESİ */}
        {!selectedFormId && (
          <>
            <div className="up-page-header">
              <div className="up-page-title">Görev Listem</div>
              <div className="up-page-subtitle">
                Size atanmış formları seçerek doldurun.
              </div>
            </div>
            <UserTasks tasks={tasks} handleSelectForm={handleSelectForm} />
          </>
        )}

        {/* FORM DOLDURMA */}
        {selectedFormId && (
          <div className="form-animation-fade">
            <div className="form-fill-header">
              <div className="back-link" onClick={handleBack}>
                <BackIcon /> Görev Listesine Dön
              </div>
              <div className="form-fill-title">{selectedFormTitle}</div>
              <div className="progress-container">
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="progress-footer">
                  <div className="progress-label">{answeredCount} / {questions.length} soru yanıtlandı</div>
                  <div className="progress-pct">%{progressPercent}</div>
                </div>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="no-tasks">
                <div className="no-tasks-icon"><FaClipboard /></div>
                <div className="no-tasks-title">Bu formda henüz soru yok</div>
                <div className="no-tasks-desc">Yönetici soru ekledikten sonra burada görünecek.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="questions-list">
                  {questions.map((q, index) => (
                    <div key={q.id}
                      className={`question-card ${q.isRequired ? 'required-card' : ''}`}>
                      <div className="question-header">
                        <span className="question-number">Soru {index + 1}</span>
                        {q.isRequired && <span className="required-badge">Zorunlu</span>}
                      </div>
                      <div className="question-label">{q.label}</div>
                      {q.imageUrl && (
                        <div className="q-admin-image-container">
                          <img src={q.imageUrl} alt="Soru görseli" className="q-admin-image" />
                        </div>
                      )}
                      {renderInput(q)}
                    </div>
                  ))}
                </div>

                <div className="form-submit-area">
                  <div className="submit-info">
                    <strong>{answeredCount}</strong> / {questions.length} soru yanıtlandı
                  </div>
                  <button type="submit" className="submit-btn">
                    Formu Gönder <SendIcon />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}