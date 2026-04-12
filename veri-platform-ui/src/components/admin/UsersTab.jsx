import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FaCrown, FaUser, FaUserMinus, FaUserPlus } from 'react-icons/fa';

export default function UsersTab({ api, Ico }) {
  const [users, setUsers]           = useState([]);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/Auth/users');
      setUsers(res.data);
    } catch {
      toast.error('Kullanıcılar yüklenemedi.');
    }
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const handleRegister = async () => {
    if (!regUsername.trim() || !regPassword.trim())
      return toast.error('Lütfen tüm alanları doldurunuz.');
    try {
      const res = await api.post('/Auth/register', {
        username: regUsername,
        password: regPassword,
      });
      toast.success(res.data?.message ?? 'Kullanıcı başarıyla oluşturuldu.');
      setRegUsername('');
      setRegPassword('');
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'İşlem başarısız oldu.');
    }
  };

  const handleToggleAdmin = async (id) => {
    try {
      const res = await api.put(`/Auth/users/${id}/toggle-admin`);
      toast.success(res.data?.message ?? 'Yetki başarıyla güncellendi.');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data ?? 'Yetki güncellenemedi.');
    }
  };

  const handleDeleteUser = async (id, username) => {
    const r = await Swal.fire({
      background: '#1e2330',
      color: '#f0f2f8',
      showCancelButton: true,
      title: `${username} kullanıcısı silinsin mi?`,
      text: 'Bu işlem geri alınamaz.',
      icon: 'warning',
      confirmButtonColor: '#f87171',
      cancelButtonColor: '#242938',
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'Vazgeç',
    });
    if (!r.isConfirmed) return;
    try {
      await api.delete(`/Auth/users/${id}`);
      toast.success('Kullanıcı başarıyla silindi.');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data ?? 'Kullanıcı silinemedi.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-start', flexWrap: 'wrap' }}>

      {/* ── Sol: Yeni Kullanıcı Formu ── */}
      <div style={{
        flex: '1 1 350px',
        background: 'var(--bg-2)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        padding: 'var(--space-8)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Arka plan parlaması */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 250, height: 250,
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Başlık */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)', position: 'relative' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-soft)',
            border: '1px solid rgba(79,142,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', margin: '0 auto var(--space-4)',
          }}>
            {Ico.shield}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>
            Yeni Kullanıcı Oluştur
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 5 }}>
            Yeni kullanıcı hesabı oluşturunuz.
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', position: 'relative' }}>
          <div>
            <span className="field-label">Kullanıcı Adı</span>
            <input
              className="text-input"
              type="text"
              placeholder="kullanıcı_adı"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
            />
          </div>
          <div>
            <span className="field-label">Şifre</span>
            <input
              className="text-input"
              type="password"
              placeholder="••••••••"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />
          </div>
          <button className="authorize-btn" onClick={handleRegister}>
            Oluştur
          </button>
        </div>
      </div>

      {/* ── Sağ: Kullanıcı Tablosu ── */}
      <div style={{
        flex: '2 1 500px',
        background: 'var(--bg-2)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        padding: 'var(--space-6)',
      }}>
          <div style={{
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--text-1)',
            marginBottom: 'var(--space-5)',
          }}>
            Mevcut Kullanıcılar ({users.length})
          </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                {['ID', 'KULLANICI ADI', 'YETKİ DÜZEYİ', 'İŞLEMLER'].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '11px 16px',
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--text-3)',
                      fontSize: 10,
                      fontWeight: 600,
                      textAlign: i === 3 ? 'right' : 'left',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.8px',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{
                    padding: '14px 16px',
                    color: 'var(--text-3)',
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    #{user.id}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-1)', fontSize: 13.5 }}>
                    {user.username}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {user.isAdmin ? (
                      <span style={{
                        background: 'var(--purple-bg)',
                        color: 'var(--purple)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                      }}>
                        <FaCrown style={{ marginRight: 4 }} /> ADMIN
                      </span>
                    ) : (
                      <span style={{
                        background: 'var(--bg-3)',
                        color: 'var(--text-2)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                      }}>
                        <FaUser style={{ marginRight: 4 }} /> KULLANICI
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleToggleAdmin(user.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: '1px solid var(--border-2)',
                          background: 'transparent',
                          fontFamily: 'var(--font-sans)',
                          color: user.isAdmin ? 'var(--warning)' : 'var(--success)',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {user.isAdmin ? <FaUserMinus size={13} /> : <FaUserPlus size={13} />}
                        {user.isAdmin ? 'Yetkisini Kaldır' : 'Admin Yap'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: 'none',
                          background: 'var(--red-bg)',
                          color: 'var(--red)',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.15s',
                        }}
                      >
                        {Ico.trash}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)', fontSize: 13 }}
                  >
                    Henüz kayıtlı kullanıcı bulunmamaktadır.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}