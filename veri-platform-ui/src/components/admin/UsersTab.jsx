import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function UsersTab({ api, Ico }) {
  const [users, setUsers] = useState([]);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Sadece bu sekme açıldığında kullanıcıları çeker
  const fetchUsers = async () => {
    try {
      const response = await api.get('/Auth/users');
      setUsers(response.data);
    } catch (error) {
      toast.error("Kullanıcılar yüklenemedi.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Yeni Kullanıcı Ekleme / Terfi İşlemi
  const handleRegister = async () => {
    if (!regUsername.trim() || !regPassword.trim()) return toast.error('Tüm alanları doldurun.');
    try {
      const response = await api.post('/Auth/register', { username: regUsername, password: regPassword });
      toast.success(response.data.message || 'Kayıt başarılı.');
      setRegUsername('');
      setRegPassword('');
      fetchUsers(); // Tabloyu anında güncelle!
    } catch (error) {
      const errorMsg = error.response?.data;
      typeof errorMsg === 'string' ? toast.error(errorMsg) : toast.error('İşlem başarısız oldu.');
    }
  };

  // Rütbe Takma / Sökme
  const handleToggleAdmin = async (id, username) => {
    try {
      const response = await api.put(`/Auth/users/${id}/toggle-admin`);
      toast.success(response.data.message);
      fetchUsers(); // Tabloyu yenile
    } catch (error) {
      toast.error(error.response?.data || "Yetki işlemi başarısız.");
    }
  };

  // Komple Silme
  const handleDeleteUser = async (id, username) => {
    const swalOpts = { background: '#0f172a', color: '#f8fafc', showCancelButton: true };
    const r = await Swal.fire({ ...swalOpts, title: `${username} silinsin mi?`, text: "Bu işlem geri alınamaz!", icon: 'warning', confirmButtonColor: '#ef4444', cancelButtonColor: '#334155', confirmButtonText: 'Evet, Sil', cancelButtonText: 'Vazgeç' });
    
    if (!r.isConfirmed) return;
    
    try {
      await api.delete(`/Auth/users/${id}`);
      toast.success("Kullanıcı silindi.");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data || "Silme işlemi başarısız.");
    }
  };

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      
      {/* SOL TARAF: YENİ KULLANICI EKLEME FORMU */}
      <div style={{ flex: '1 1 350px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '32px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--accent-glow)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', margin: '0 auto 16px' }}>{Ico.shield}</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-1)', letterSpacing: '-0.4px' }}>Personel Yetkilendir</div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '6px' }}>Sisteme yeni giriş izni verin.</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
          <div>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-2)', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>Kullanıcı Adı</span>
            <input type="text" placeholder="Kullanıcı adı girin..." value={regUsername} onChange={e => setRegUsername(e.target.value)} style={{ width: '100%', padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border-2)', borderRadius: '10px', color: 'var(--text-1)', fontSize: '14px', fontWeight: '600', outline: 'none' }} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-2)', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>Geçici Şifre</span>
            <input type="password" placeholder="••••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} style={{ width: '100%', padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border-2)', borderRadius: '10px', color: 'var(--text-1)', fontSize: '14px', fontWeight: '600', outline: 'none' }} />
          </div>
          <button onClick={handleRegister} style={{ width: '100%', padding: '14px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s' }}>
            Oluştur ve Kaydet
          </button>
        </div>
      </div>

      {/* SAĞ TARAF: SİSTEMDEKİ KULLANICILAR TABLOSU */}
      <div style={{ flex: '2 1 600px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-1)', marginBottom: '20px' }}>Sistemdeki Kullanıcılar ({users.length})</div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '12px', fontWeight: '600' }}>ID</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '12px', fontWeight: '600' }}>KULLANICI ADI</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '12px', fontWeight: '600' }}>ROLÜ</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '12px', fontWeight: '600', textAlign: 'right' }}>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-3)', fontSize: '13px', fontFamily: "'Inter', monospace" }}>#{user.id}</td>
                  <td style={{ padding: '16px', color: 'var(--text-1)', fontWeight: '600', fontSize: '14px' }}>{user.username}</td>
                  <td style={{ padding: '16px' }}>
                    {user.isAdmin ? (
                      <span style={{ background: 'var(--purple-bg)', color: 'var(--purple)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>👑 ADMIN</span>
                    ) : (
                      <span style={{ background: 'var(--bg-3)', color: 'var(--text-2)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>👤 PERSONEL</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleToggleAdmin(user.id, user.username)} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: user.isAdmin ? 'var(--amber)' : 'var(--green)' }}>
                        {user.isAdmin ? 'Yetkiyi Al' : 'Admin Yap'}
                      </button>
                      <button onClick={() => handleDeleteUser(user.id, user.username)} style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', background: 'var(--red-bg)', color: 'var(--red)' }}>
                        {Ico.trash}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>Sistemde kayıtlı kullanıcı bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}