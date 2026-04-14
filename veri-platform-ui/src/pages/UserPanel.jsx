import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import { Shield, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';
import DashboardView from '../components/user/DashboardView';
import FormsListView from '../components/user/FormsListView';
import FormFillView from '../components/user/FormFillView';
import './userpanel.css';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default function UserPanel() {
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [selectedFormTitle, setSelectedFormTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const fetchMyTasks = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5062/api/Form/my-tasks');
      setTasks(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5062/api/Form/user-analytics');
      setAnalytics(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchQuestions = useCallback(async (formId) => {
    try {
      const res = await axios.get(`http://localhost:5062/api/Form/templates/${formId}/questions`);
      setQuestions(res.data.sort((a, b) => a.order - b.order));
    } catch { toast.error('Sorular yüklenemedi.'); }
  }, []);

  const handleSelectForm = (task, readOnly = false) => {
    setSelectedFormId(task.formTemplateId);
    setSelectedFormTitle(task.title);
    setIsReadOnly(readOnly || task.status === 'completed' || task.isCompleted);
    fetchQuestions(task.formTemplateId);
    window.history.pushState({}, '', `/user?formId=${task.formTemplateId}`);
  };

  const handleBack = () => {
    setSelectedFormId(null);
    setQuestions([]);
    setAnswers({});
    setIsReadOnly(false);
    window.history.pushState({}, '', '/user');
    fetchMyTasks();
    fetchAnalytics();
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

    try {
      await axios.post(
        `http://localhost:5062/api/Form/templates/${selectedFormId}/submit`,
        answers
      );
      toast.success('Yanıtlarınız başarıyla kaydedildi!');
      setAnswers({});
      setTimeout(() => {
        handleBack();
      }, 1500);
    } catch { toast.error('Gönderim sırasında bir hata oluştu.'); }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const init = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
          if (role === 'Admin' || (Array.isArray(role) && role.includes('Admin'))) setIsAdmin(true);
        } catch { /* ignore */ }
      }
    };
    init();

    const params = new URLSearchParams(window.location.search);
    const formId = params.get('formId');
    if (formId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchQuestions(formId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFormId(formId);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMyTasks();
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewTitle = selectedFormId
    ? selectedFormTitle
    : activeView === 'dashboard'
      ? 'Dashboard'
      : 'Formlarım';

  const viewSubtitle = selectedFormId
    ? isReadOnly
      ? 'Bu formu salt okunur modunda görüntülüyorsunuz.'
      : 'Size atanan formu doldurun.'
    : activeView === 'dashboard'
      ? 'Son 30 günlük performansınızı takip edin.'
      : 'Size atanmış formları seçerek doldurun.';

  return (
    <div className="up-root">
      <div className="up-topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">VP</div>
          <div className="topbar-name">Veri<span>Platform</span></div>
        </div>
        <div className="topbar-actions">
          {isAdmin && (
            <button className="topbar-btn admin" onClick={() => window.location.href = '/admin'}>
              <Shield size={14} /> Yönetim Paneli
            </button>
          )}
          <button className="topbar-btn danger"
            onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}>
            <LogOut size={14} /> Çıkış
          </button>
        </div>
      </div>

      <div className="up-container">
        <div className="up-page-header">
          <div className="up-page-title">{viewTitle}</div>
          <div className="up-page-subtitle">{viewSubtitle}</div>
        </div>

        {!selectedFormId && (
          <div className="view-toggle">
            <button
              className={`toggle-btn ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button
              className={`toggle-btn ${activeView === 'forms' ? 'active' : ''}`}
              onClick={() => { setActiveView('forms'); fetchMyTasks(); }}
            >
              <ClipboardList size={16} /> Formlarım
            </button>
          </div>
        )}

        {selectedFormId ? (
          <FormFillView
            formTitle={selectedFormTitle}
            questions={questions}
            answers={answers}
            isReadOnly={isReadOnly}
            onAnswerChange={handleAnswerChange}
            onFileUpload={handleFileUpload}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        ) : activeView === 'dashboard' ? (
          <DashboardView
            analytics={analytics}
            tasks={tasks}
            onSelectForm={handleSelectForm}
          />
        ) : (
          <FormsListView
            tasks={tasks}
            onSelectForm={handleSelectForm}
          />
        )}
      </div>
    </div>
  );
}