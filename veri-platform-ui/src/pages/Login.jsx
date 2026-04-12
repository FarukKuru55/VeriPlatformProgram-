import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaEnvelope } from 'react-icons/fa';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Lütfen tüm alanları doldurun.');

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5062/api/Auth/login', { username, password });
      const token = res.data.token;
      localStorage.setItem('token', token);

      const decoded = jwtDecode(token);
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;

      toast.success('Giriş başarılı, yönlendiriliyorsunuz...');
      setTimeout(() => {
        if (role === 'Admin' || (Array.isArray(role) && role.includes('Admin'))) navigate('/admin');
        else navigate('/user');
      }, 800);
    } catch (err) {
      if (!err.response) toast.error('Sunucuya ulaşılamıyor.');
      else if (err.response.status === 401) toast.error('Kullanıcı adı veya şifre hatalı.');
      else toast.error('Sistem hatası: ' + err.response.status);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) return toast.error('Lütfen tüm alanları doldurun.');
    if (password !== confirmPassword) return toast.error('Şifreler eşleşmiyor.');
    if (password.length < 4) return toast.error('Şifre en az 4 karakter olmalıdır.');

    setIsLoading(true);
    try {
      await axios.post('http://localhost:5062/api/Auth/register-public', { username, password });
      toast.success('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      setIsRegisterMode(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (!err.response) toast.error('Sunucuya ulaşılamıyor.');
      else toast.error(err.response.data || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetCode = async () => {
    if (!resetUsername.trim()) return toast.error('Kullanıcı adı giriniz.');
    if (!resetEmail.trim()) return toast.error('E-posta adresi giriniz.');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) return toast.error('Geçerli bir e-posta adresi giriniz.');
    
    setIsResetLoading(true);
    try {
      await axios.post('http://localhost:5062/api/Auth/forgot-password', { 
        username: resetUsername,
        email: resetEmail 
      });
      toast.success('Doğrulama kodu e-posta adresinize gönderildi.');
      setResetStep(2);
    } catch (err) {
      toast.error(err.response?.data || 'Kod gönderilemedi.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resetCode.trim() || resetCode.length !== 6) return toast.error('6 haneli kodu giriniz.');
    setResetStep(3);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !newPasswordConfirm) return toast.error('Tüm alanları doldurunuz.');
    if (newPassword !== newPasswordConfirm) return toast.error('Şifreler eşleşmiyor.');
    if (newPassword.length < 4) return toast.error('Şifre en az 4 karakter olmalıdır.');

    setIsResetLoading(true);
    try {
      await axios.post('http://localhost:5062/api/Auth/reset-password', {
        username: resetUsername,
        code: resetCode,
        newPassword
      });
      toast.success('Şifreniz başarıyla güncellendi.');
      setShowResetModal(false);
      setResetStep(1);
      setResetUsername('');
      setResetCode('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err) {
      toast.error(err.response?.data || 'Şifre sıfırlanamadı.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetStep(1);
    setResetUsername('');
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setNewPasswordConfirm('');
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="left-brand">
          <div className="brand-mark">VP</div>
          <div className="brand-name">Veri<span>Platform</span></div>
        </div>

        <div className="left-hero">
          <div className="hero-badge">Kurumsal Sistem</div>
          <h1 className="hero-title">
            Veri topla.<br />
            <span>Analiz et.</span><br />
            Karar ver.
          </h1>
        </div>

        <div className="left-stats">
          <div className="stat-item">
            <div className="stat-value">7/24</div>
            <div className="stat-label">Erişim</div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="card-header">
            <h2 className="card-title">{isRegisterMode ? 'Kayıt Ol' : 'Hoş geldiniz'}</h2>
            <p className="card-subtitle">
              {isRegisterMode ? 'Yeni hesap oluşturmak için bilgilerinizi girin' : 'Sisteme erişmek için kimlik bilgilerinizi girin'}
            </p>
            {!isRegisterMode && (
              <span className="forgot-link" onClick={() => setShowResetModal(true)}>
                Şifremi Unuttum
              </span>
            )}
          </div>

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin}>
            <div className="form-group">
              <label className="form-label">Kullanıcı Adı</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  className="form-input"
                  type="text"
                  placeholder="kullanici_adi"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Şifre</label>
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
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {isRegisterMode && (
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
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`login-submit-btn${isLoading ? ' loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  {isRegisterMode ? (
                    <><div className="spinner" /> Kaydediliyor...</>
                  ) : (
                    <><div className="spinner" /> Doğrulanıyor...</>
                  )}
                </>
              ) : (
                <>
                  {isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap'}
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>

            <div className="auth-toggle">
              {isRegisterMode ? (
                <p className="toggle-text">
                  Zaten hesabınız var mı?{' '}
                  <button type="button" className="toggle-link" onClick={() => { setIsRegisterMode(false); setConfirmPassword(''); }}>
                    Giriş yap
                  </button>
                </p>
              ) : (
                <p className="toggle-text">
                  Hesabınız yok mu?{' '}
                  <button type="button" className="toggle-link" onClick={() => { setIsRegisterMode(true); setConfirmPassword(''); }}>
                    Kayıt ol
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {showResetModal && (
        <div className="reset-modal-overlay" onClick={closeResetModal}>
          <div className="reset-modal" onClick={e => e.stopPropagation()}>
            <div className="reset-modal-header">
              <h3 className="reset-modal-title">
                {resetStep === 3 ? 'Yeni Şifre Belirle' : 'Şifremi Sıfırla'}
              </h3>
              <button className="reset-modal-close" onClick={closeResetModal}>
                <FaTimes size={16} />
              </button>
            </div>

            <div className="reset-steps">
              <div className={`reset-step ${resetStep >= 1 ? 'active' : ''} ${resetStep > 1 ? 'completed' : ''}`} />
              <div className={`reset-step ${resetStep >= 2 ? 'active' : ''} ${resetStep > 2 ? 'completed' : ''}`} />
              <div className={`reset-step ${resetStep >= 3 ? 'active' : ''}`} />
            </div>

            {resetStep === 1 && (
              <>
                <div className="reset-info">
                  Hesabınızı doğrulamak için kullanıcı adınızı ve e-posta adresinizi girin. Doğrulama kodu e-posta adresinize gönderilecektir.
                </div>
                <div className="form-group">
                  <label className="form-label">Kullanıcı Adı</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="kullanici_adi"
                      value={resetUsername}
                      onChange={e => setResetUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">E-Posta Adresi</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <FaEnvelope size={14} />
                    </div>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="ornek@email.com"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  className="login-submit-btn"
                  onClick={handleSendResetCode}
                  disabled={isResetLoading}
                >
                  {isResetLoading ? <><div className="spinner" /> Gönderiliyor...</> : 'Kod Gönder'}
                </button>
              </>
            )}

            {resetStep === 2 && (
              <>
                <div className="reset-info">
                  <strong>{resetUsername}</strong> kullanıcı adına doğrulama kodu gönderildi. Lütfen kodunu girin.
                </div>
                <div className="form-group">
                  <label className="form-label">Doğrulama Kodu</label>
                  <input
                    className="reset-code-input"
                    type="text"
                    maxLength={6}
                    placeholder="------"
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="reset-hint">6 haneli kodu giriniz</p>
                </div>
                <button
                  className="login-submit-btn"
                  onClick={handleVerifyCode}
                  disabled={!resetCode || resetCode.length !== 6}
                >
                  Doğrula ve Devam Et
                </button>
              </>
            )}

            {resetStep === 3 && (
              <>
                <div className="reset-success">
                  <div className="reset-success-icon">
                    <FaCheck size={32} />
                  </div>
                  <p className="reset-success-text">Kod Doğrulandı</p>
                  <p className="reset-success-subtext">Şimdi yeni şifrenizi belirleyin</p>
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
                      value={newPasswordConfirm}
                      onChange={e => setNewPasswordConfirm(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  className="login-submit-btn"
                  onClick={handleResetPassword}
                  disabled={isResetLoading}
                >
                  {isResetLoading ? <><div className="spinner" /> Güncelleniyor...</> : 'Şifremi Sıfırla'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
