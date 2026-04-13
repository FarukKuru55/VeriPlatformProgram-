import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as signalR from '@microsoft/signalr';
import SortableItem from '../components/SortableItem';
import { arrayMove } from '@dnd-kit/sortable';
import Sidebar from '../components/admin/Sidebar';
import UsersTab from '../components/admin/UsersTab';
import DashboardTab from '../components/admin/DashboardTab';
import FormsListTab from '../components/admin/FormsListTab';
import FormBuilderTab from '../components/admin/FormBuilderTab';
import ResponsesTab from '../components/admin/ResponsesTab';
import { FaUser, FaKey, FaSignOutAlt, FaTimes, FaCheck } from 'react-icons/fa';

import Swal from 'sweetalert2';
import './AdminPanel.css';

/* ─── İkon seti ─── */
const Ico = {
  folder: <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  list:   <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>,
  inbox:  <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  chart:  <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  users:  <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  back:   <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  eye:    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  logout: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  plus:   <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  trash:  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  search: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  doc:    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  clock:  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  repeat: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  shield: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

/* ─── Özel Tooltip ─── */
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e2330', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
      <div style={{ color: '#8892a4', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#4f8ef7', fontWeight: 700 }}>{payload[0].value} başvuru</div>
    </div>
  );
};

/* ════════════════════════════════════ */
export default function AdminPanel() {
  const api = useMemo(() => {
      const instance = axios.create({ baseURL: 'http://localhost:5062/api' });

      instance.interceptors.request.use((config) => {
          const token = localStorage.getItem('token');
          if (token) config.headers.Authorization = `Bearer ${token}`;
          return config;
      });

      instance.interceptors.response.use(
          (response) => response, 
          (error) => {
              if (error.response && error.response.status === 401) {
                  toast.error("Oturum süren doldu, tekrar giriş yap.");
                  localStorage.removeItem('token'); 
                  window.location.href = "/"; 
              }
              return Promise.reject(error);
          }
      );
      return instance;
  }, []);

  const [activeTab, setActiveTab]         = useState('forms');
  const [formTemplates, setFormTemplates] = useState([]);
  const [newFormTitle, setNewFormTitle]   = useState('');
  const [selectedForm, setSelectedForm]   = useState(null);

  const [startDate, setStartDate]         = useState('');
  const [endDate, setEndDate]             = useState('');
  const [isRecurring, setIsRecurring]     = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('Daily');

  const [questions, setQuestions]         = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedType, setSelectedType]   = useState('text');
  const [options, setOptions]             = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const [submissions, setSubmissions]     = useState([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [dashboardStats, setDashboardStats] = useState(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const dropdownRef = useRef(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const swalOpts = { background: '#1e2330', color: '#f0f2f8', showCancelButton: true };

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5062/hubs/notification", {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.start()
      .then(() => {
        console.log("SignalR bağlantısı kuruldu");
      })
      .catch(err => console.error("SignalR bağlantı hatası:", err));

    connection.on("ReceiveNotification", (data) => {
      console.log("Bildirim alındı:", data);
      setNotificationCount(prev => prev + 1);
      toast.success(`📝 Yeni yanıt: "${data.formTitle}"`);
    });

    return () => {
      connection.stop();
    };
  }, []);

  const fetchTemplates = useCallback(async () => {
    try { const r = await api.get('/Form/templates'); setFormTemplates(r.data); }
    catch { toast.error('Formlar yüklenemedi.'); }
  }, [api]);

  const fetchStats = useCallback(async () => {
    try { const r = await api.get('/Form/stats'); setDashboardStats(r.data); }
    catch { toast.error('İstatistikler çekilemedi.'); }
  }, [api]);

  const fetchQuestions = useCallback(async () => {
    if(!selectedForm) return;
    try { const r = await api.get(`/Form/templates/${selectedForm.id}/questions`); setQuestions(r.data.sort((a,b)=>a.order-b.order)); }
    catch { toast.error('Sorular yüklenemedi.'); }
  }, [api, selectedForm]);

  const fetchSubmissions = useCallback(async () => {
    if(!selectedForm) return;
    try { const r = await api.get(`/Form/templates/${selectedForm.id}/submissions`); setSubmissions(r.data); }
    catch { toast.error('Yanıtlar çekilemedi.'); }
  }, [api, selectedForm]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  useEffect(() => { if (selectedForm) { fetchQuestions(); fetchSubmissions(); } }, [selectedForm, fetchQuestions, fetchSubmissions]);
  useEffect(() => { if (activeTab === 'dashboard') fetchStats(); }, [activeTab, fetchStats]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword)
      return toast.error('Tüm alanları doldurunuz.');
    if (newPassword !== confirmPassword)
      return toast.error('Yeni şifreler eşleşmiyor.');
    if (newPassword.length < 4)
      return toast.error('Şifre en az 4 karakter olmalıdır.');

    setIsChangingPassword(true);
    try {
      await axios.post('http://localhost:5062/api/Auth/change-password', {
        username: localStorage.getItem('username') || 'faruk',
        currentPassword,
        newPassword
      });
      toast.success('Şifreniz başarıyla güncellendi.');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowDropdown(false);
    } catch (err) {
      toast.error(err.response?.data || 'Şifre değiştirilemedi.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfileClick = () => {
    toast.success('Profil bilgileriniz sistem yöneticisi tarafından yönetilmektedir.');
    setShowDropdown(false);
  };

  /* ── Template ── */
  const handleCreateTemplate = async () => {
    if (!newFormTitle.trim()) return toast.error('Form adı boş olamaz!');
    try {
      await api.post('/Form/templates', { title: newFormTitle, startDate: startDate||null, endDate: endDate||null, isRecurring, recurrenceType: isRecurring ? recurrenceType : null });
      toast.success('Form oluşturuldu!');
      setNewFormTitle(''); setStartDate(''); setEndDate(''); setIsRecurring(false);
      fetchTemplates();
    } catch { toast.error('Oluşturulamadı.'); }
  };

  const handleDeleteTemplate = async (id) => {
    const r = await Swal.fire({ ...swalOpts, title: 'Formu sil?', text: 'Tüm veriler silinecek!', icon: 'warning', confirmButtonColor: '#f87171', cancelButtonColor: '#242938', confirmButtonText: 'Evet, Sil', cancelButtonText: 'Vazgeç' });
    if (!r.isConfirmed) return;
    try { await api.delete(`/Form/templates/${id}`); toast.success('Silindi.'); fetchTemplates(); }
    catch { toast.error('Silinemedi.'); }
  };

  /* ── Sorular ── */
  const _handleEditClick = (qId) => {
    const q = questions.find(x => x.id === qId);
    if (!q) return;
    setNewQuestionText(q.label); setSelectedType(q.type);
    setOptions(q.optionsJson ? JSON.parse(q.optionsJson) : []);
    setEditingQuestionId(q.id);
  };

 const _handleSaveQuestion = async () => {
        if (!newQuestionText.trim()) return toast.error("Soru metni boş olamaz!");
        
        const payload = { 
            formTemplateId: selectedForm.id, 
            label: newQuestionText, 
            type: selectedType,
            optionsJson: (selectedType === 'radio' || selectedType === 'checkbox') && options.length > 0 
                         ? JSON.stringify(options) 
                         : null
        };

        try {
            if (editingQuestionId) {
                await api.put(`/Form/questions/${editingQuestionId}`, payload);
            } else {
                await api.post(`/Form/templates/${selectedForm.id}/questions`, payload);
            }
            
            setNewQuestionText(''); 
            setOptions([]); 
            setSelectedType('text'); 
            setEditingQuestionId(null); 
            fetchQuestions();
            toast.success("Soru başarıyla kaydedildi.");
        } catch (error) { 
            console.error("Kayıt Hatası:", error);
            toast.error("Soru kaydedilirken hata oluştu!"); 
        }
    };

  const _handleDeleteQuestion = async (id) => {
    const r = await Swal.fire({ ...swalOpts, title: 'Soruyu sil?', icon: 'warning', confirmButtonColor: '#f87171', cancelButtonColor: '#242938', confirmButtonText: 'Sil', cancelButtonText: 'Vazgeç' });
    if (!r.isConfirmed) return;
    try { await api.delete(`/Form/questions/${id}`); toast.success('Silindi.'); fetchQuestions(); }
    catch { toast.error('Silinemedi.'); }
  };

  const _handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    let ordered = [];
    setQuestions(items => {
      const oi = items.findIndex(i => i.id === active.id);
      const ni = items.findIndex(i => i.id === over.id);
      ordered = arrayMove(items, oi, ni); return ordered;
    });
    try { await api.put('/Form/questions/reorder', ordered.map(q=>q.id)); }
    catch { toast.error('Sıralama kaydedilemedi.'); }
  };

  /* ── Yanıtlar ── */
  const handleSubmissionChange = (id, field, value) => setSubmissions(submissions.map(s => s.id===id ? {...s,[field]:value} : s));

  const handleUpdateSubmission = async (id, status, adminNote) => {
    const r = await Swal.fire({ ...swalOpts, title: 'Kaydedilsin mi?', icon: 'question', confirmButtonColor: '#4f8ef7', confirmButtonText: 'Kaydet', cancelButtonText: 'İptal' });
    if (!r.isConfirmed) return;    try { await api.put(`/Form/submissions/${id}/status`, { status, adminNote }); toast.success('Güncellendi!'); }
    catch { toast.error('Başarısız.'); }
  };

  const handleLogout = async () => {
    const r = await Swal.fire({ ...swalOpts, title: 'Çıkış yapılsın mı?', icon: 'warning', confirmButtonColor: '#f87171', confirmButtonText: 'Çıkış', cancelButtonText: 'Vazgeç' });
    if (!r.isConfirmed) return;
    localStorage.removeItem('token'); window.location.href = '/';
  };

  const pageTitle = () => {
    if (selectedForm) return selectedForm.title;
    return { forms:'Formlarım', dashboard:'Sistem Raporu', users:'Kullanıcılar' }[activeTab] || '';
  };

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div className="ap-root">

      {/* SIDEBAR BİLEŞENİ */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedForm={selectedForm}
        setSelectedForm={setSelectedForm}
        formTemplatesCount={formTemplates.length}
        submissionsCount={submissions.length}
        handleLogout={handleLogout}
        Ico={Ico}
        notificationCount={notificationCount}
      />

      {/* MAIN */}
      <div className="ap-main">
        <header className="ap-header">
          <div className="header-left">
            {selectedForm && (
              <button className="back-btn" onClick={() => { setSelectedForm(null); setActiveTab('forms'); }}>{Ico.back}</button>
            )}
            <div>
              <div className="header-title">{pageTitle()}</div>
              {selectedForm && <div className="header-breadcrumb">formlar / {activeTab==='builder' ? 'düzenleyici' : 'yanıtlar'}</div>}
            </div>
          </div>
          <div className="header-right" ref={dropdownRef}>
            {selectedForm && (
              <button className="preview-btn" onClick={() => window.open(`/user?formId=${selectedForm.id}`, '_blank')}>
                {Ico.eye} Önizle
              </button>
            )}
            <div className="header-divider" />
            <div style={{ position: 'relative' }}>
              <div className="avatar-ring" onClick={() => setShowDropdown(!showDropdown)}>
                FK
              </div>
              {showDropdown && (
                <>
                  <div className="dropdown-overlay" onClick={() => setShowDropdown(false)} />
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-user-name">Faruk K.</div>
                      <div className="dropdown-user-role">Sistem Yöneticisi</div>
                    </div>
                    <button className="dropdown-item" onClick={handleProfileClick}>
                      <FaUser size={16} /> Profil
                    </button>
                    <button className="dropdown-item" onClick={() => { setShowPasswordModal(true); setShowDropdown(false); }}>
                      <FaKey size={16} /> Şifre Değiştir
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <FaSignOutAlt size={16} /> Oturumu Kapat
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="ap-content">

         {/* 🚀 1. FORMLAR SEKME (Geri geldi!) */}
         {!selectedForm && activeTab === 'forms' && (
            <FormsListTab 
              newFormTitle={newFormTitle} setNewFormTitle={setNewFormTitle}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
              isRecurring={isRecurring} setIsRecurring={setIsRecurring}
              recurrenceType={recurrenceType} setRecurrenceType={setRecurrenceType}
              handleCreateTemplate={handleCreateTemplate}
              formTemplates={formTemplates}
              setSelectedForm={setSelectedForm}
              setActiveTab={setActiveTab}
              handleDeleteTemplate={handleDeleteTemplate}
              Ico={Ico}
              api={api} 
            />
          )}

        {/* 🚀 2. DASHBOARD SEKME (Ico hatası çözüldü) */}
          {!selectedForm && activeTab === 'dashboard' && (
            <DashboardTab 
              dashboardStats={dashboardStats} 
              DarkTooltip={DarkTooltip} 
              Ico={Ico}
            />
          )}
          
        {/* 🚀 3. KULLANICI YÖNETİMİ SEKME (Ico hatası çözüldü) */}
          {!selectedForm && activeTab === 'users' && (
            <UsersTab api={api} Ico={Ico} />
          )}
          
        {/* ══ SORU DÜZENLEYİCİ ══ */}
          {selectedForm && activeTab === 'builder' && (
            <FormBuilderTab 
              selectedForm={selectedForm}
              questions={questions}
              setQuestions={setQuestions}
              fetchQuestions={fetchQuestions}
              api={api}
              Ico={Ico}
            />
          )}

         {/* ══ YANITLAR ══ */}
          {selectedForm && activeTab === 'responses' && (
            <ResponsesTab 
              submissions={submissions}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              questions={questions}
              handleSubmissionChange={handleSubmissionChange}
              handleUpdateSubmission={handleUpdateSubmission}
              Ico={Ico}
            />
          )}

        </main>
      </div>

      {showPasswordModal && (
        <div className="reset-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="reset-modal" onClick={e => e.stopPropagation()}>
            <div className="reset-modal-header">
              <h3 className="reset-modal-title">Şifre Değiştir</h3>
              <button className="reset-modal-close" onClick={() => setShowPasswordModal(false)}>
                <FaTimes size={16} />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Mevcut Şifre</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  className="form-input"
                  type="password"
                  placeholder="********"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Yeni Şifre</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  className="form-input"
                  type="password"
                  placeholder="********"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Şifre Tekrar</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  className="form-input"
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <button
              className="login-submit-btn"
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? <><div className="spinner" /> Güncelleniyor...</> : <><FaCheck size={16} /> Şifreyi Güncelle</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}