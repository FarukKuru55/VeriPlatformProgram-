import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaClipboard, FaPencilAlt, FaTrash, FaPlus, FaCheck, FaClock, FaUser, FaUsers, FaFileAlt, FaSearch, FaShareAlt } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import {
  IconPlus,
  IconUsers,
  IconTrash,
  IconClock,
  IconRepeat,
  IconFileText,
  IconSearch,
  IconCalendar,
  IconArrowRight,
  IconSettings,
} from '@tabler/icons-react';

const Ico = {
  plus: <IconPlus size={16} stroke={2.5} />,
  users: <IconUsers size={14} stroke={2} />,
  trash: <IconTrash size={16} stroke={2} />,
  clock: <IconClock size={14} stroke={2} />,
  repeat: <IconRepeat size={14} stroke={2} />,
  doc: <IconFileText size={20} stroke={1.8} />,
  search: <IconSearch size={16} stroke={2} />,
  calendar: <IconCalendar size={14} stroke={2} />,
  arrow: <IconArrowRight size={14} stroke={2} />,
  settings: <IconSettings size={14} stroke={2} />,
};

export default function FormsListTab({
  newFormTitle, setNewFormTitle,
  periodType, setPeriodType,
  handleCreateTemplate,
  formTemplates,
  setSelectedForm, setActiveTab,
  handleDeleteTemplate,
  api,
  onFormUpdated,
}) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetForm, setTargetForm] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareForm, setShareForm] = useState(null);
  const [shareSlug, setShareSlug] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPeriodType, setEditPeriodType] = useState(1);

  const handleEditForm = (form) => {
    setEditForm(form);
    setEditTitle(form.title || '');
    setEditDescription(form.description || '');
    setEditPeriodType(form.periodType || 1);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return toast.error('Form adı boş olamaz.');
    try {
      await api.put(`/Form/templates/${editForm.id}`, {
        title: editTitle,
        description: editDescription,
        periodType: editPeriodType
      });
      toast.success('Form başarıyla güncellendi.');
      setShowEditModal(false);
      if (onFormUpdated) onFormUpdated();
    } catch {
      toast.error('Form güncellenemedi.');
    }
  };

  const handleShare = async (form) => {
    setShareForm(form);
    try {
      const r = await api.post(`/Form/templates/${form.id}/share`);
      setShareSlug(r.data.slug);
      setShowShareModal(true);
    } catch {
      toast.error('Paylaşım linki oluşturulamadı.');
    }
  };

  const copyShareLink = () => {
    const link = `http://localhost:5173/f/${shareSlug}`;
    navigator.clipboard.writeText(link);
    toast.success('Link kopyalandı!');
  };

  const formStatus = (form) => {
    const periodLabels = { 1: 'Günlük', 2: 'Haftalık', 3: 'Aylık' };
    return { 
      label: periodLabels[form.periodType] || 'Günlük', 
      cls: 'active', 
      color: '#10b981', 
      bg: 'rgba(16, 185, 129, 0.1)' 
    };
  };

  const openAssignModal = async (form) => {
    setTargetForm(form);
    try {
      const r = await api.get('/Auth/users');
      setAllUsers(r.data);
      setShowAssignModal(true);
    } catch {
      toast.error('Kullanıcı listesi alınamadı.');
    }
  };

  const handleAssign = async () => {
    if (selectedUserIds.length === 0)
      return toast.error('En az bir kullanıcı seçilmelidir.');
    if (!targetForm?.id)
      return toast.error('Form bilgisi alınamadı.');
    
    const payload = {
      FormTemplateId: targetForm.id,
      UserIds: selectedUserIds
    };
    console.log('Assign payload:', payload);
    
    try {
      await api.post('/Form/assign', payload);
      toast.success('Görev başarıyla atandı!');
      setShowAssignModal(false);
      setSelectedUserIds([]);
    } catch (err) {
      console.error('Assign error:', err.response?.data);
      toast.error('Görev atama işlemi başarısız.');
    }
  };

  const toggleUser = (id) =>
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const recurrenceLabel = (type) => {
    const labels = { 1: 'Günlük', 2: 'Haftalık', 3: 'Aylık' };
    return labels[type] || 'Günlük';
  };

  const filteredForms = formTemplates.filter(f =>
    !searchQuery || f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Form Yönetimi
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-3)' }}>
          Personel atamaları için form oluşturun ve yönetin.
        </p>
      </div>

      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Form adı girin (Örn: Aylık Performans Değerlendirmesi)"
            value={newFormTitle}
            onChange={(e) => setNewFormTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTemplate()}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              outline: 'none',
              transition: 'all var(--transition)'
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
          <button
            onClick={handleCreateTemplate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.1)',
              transition: 'all var(--transition)'
            }}
          >
            <FaPlus size={14} />
            Yeni Form Oluştur
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-3)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Görev Periyodu
            </label>
            <select
              value={periodType}
              onChange={(e) => setPeriodType(Number(e.target.value))}
              style={{
                padding: '10px 14px',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                outline: 'none',
                background: 'var(--surface)',
                minWidth: '160px',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-2)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value={1}>Günlük</option>
              <option value={2}>Haftalık</option>
              <option value={3}>Aylık</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '14px',
          color: 'var(--text-3)'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{filteredForms.length}</span> form bulundu
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          border: '1px solid var(--border)',
          width: '240px'
        }}>
          <FaSearch size={14} color="var(--text-3)" />
          <input
            type="text"
            placeholder="Form ara..."
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '16px'
      }}>
        {filteredForms.map((form) => {
          const st = formStatus(form);
          return (
            <div
              key={form.id}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all var(--transition)'
              }}
              onClick={() => { setSelectedForm(form); setActiveTab('builder'); }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--border-2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{
                padding: '20px',
                borderBottom: '1px solid var(--border)',
                background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                    }}>
                      <IconFileText size={20} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text-1)',
                        marginBottom: '2px',
                        letterSpacing: '-0.01em'
                      }}>
                        {form.title}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--text-4)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        #{form.id}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: st.bg,
                    color: st.color
                  }}>
                    {st.label}
                  </span>
                </div>
              </div>

              <div style={{ padding: '16px 20px' }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '14px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'var(--text-3)'
                  }}>
                    <IconRepeat size={13} />
                    {recurrenceLabel(form.periodType)}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border)'
                }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openAssignModal(form); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      color: '#7c3aed',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition)'
                    }}
                  >
                    <IconUsers size={13} />
                    Personel Ata
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(form); }}
                      style={{
                        padding: '8px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: 'var(--radius)',
                        color: '#10b981',
                        cursor: 'pointer',
                        display: 'flex',
                        transition: 'all var(--transition)'
                      }}
                      title="Paylaş"
                    >
                      <FaShareAlt size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditForm(form); }}
                      style={{
                        padding: '8px',
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--text-3)',
                        cursor: 'pointer',
                        display: 'flex',
                        transition: 'all var(--transition)'
                      }}
                      title="Düzenle"
                    >
                      <FaPencilAlt size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(form.id); }}
                      style={{
                        padding: '8px',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: 'var(--radius)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        transition: 'all var(--transition)'
                      }}
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredForms.length === 0 && (
          <div style={{
            gridColumn: '1/-1',
            textAlign: 'center',
            padding: '80px 20px',
            color: 'var(--text-3)',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              background: 'var(--surface-2)',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)'
            }}>
              <FaClipboard size={28} color="var(--text-4)" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '6px' }}>
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz form oluşturulmadı'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>
              {searchQuery ? 'Farklı bir arama terimi deneyin' : 'Yukarıdan yeni bir form oluşturarak başlayın.'}
            </div>
          </div>
        )}
      </div>

      {showAssignModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--surface)',
            width: '440px',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
            animation: 'fadeUp 0.2s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
                  Personel Görevlendirme
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>
                  {targetForm?.title}
                </div>
              </div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#6366f1'
              }}>
                {selectedUserIds.length} seçili
              </span>
            </div>

            <div style={{
              maxHeight: '320px',
              overflowY: 'auto',
              marginBottom: '20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}>
              {allUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                      transition: 'background var(--transition)'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: 'var(--radius-sm)',
                      border: `2px solid ${isSelected ? '#3b82f6' : 'var(--border-2)'}`,
                      background: isSelected ? '#3b82f6' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 700,
                      transition: 'all var(--transition)'
                    }}>
                      {isSelected && <FaCheck size={12} />}
                    </div>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-1)'
                    }}>
                      {user.username}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setShowAssignModal(false); setSelectedUserIds([]); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-2)',
                  background: 'var(--surface)',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all var(--transition)'
                }}
              >
                İptal
              </button>
              <button
                onClick={handleAssign}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(59, 130, 246, 0.2)',
                  transition: 'all var(--transition)'
                }}
              >
                Görevlendir
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && shareSlug && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--surface)',
            width: '420px',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
            animation: 'fadeUp 0.2s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
                Form Paylaş
              </div>
              <button
                onClick={() => { setShowShareModal(false); setShareForm(null); setShareSlug(null); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-3)',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                display: 'inline-flex',
                padding: '16px',
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}>
                <QRCodeCanvas value={`http://localhost:5173/f/${shareSlug}`} size={180} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '6px' }}>Paylaşım Linki</div>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <input
                  readOnly
                  value={`http://localhost:5173/f/${shareSlug}`}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    color: 'var(--text-2)',
                    background: 'var(--surface-2)'
                  }}
                />
                <button
                  onClick={copyShareLink}
                  style={{
                    padding: '12px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Kopyala
                </button>
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: '#10b981',
              textAlign: 'center'
            }}>
              Bu link herkesle paylaşılabilir. Giriş yapmadan da form doldurulabilir.
            </div>
          </div>
        </div>
      )}

      {showEditModal && editForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--surface)',
            width: '440px',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
            animation: 'fadeUp 0.2s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
                  Formu Düzenle
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>
                  Form bilgilerini güncelleyin
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-3)',
                  padding: '4px',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Form Adı
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--border-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all var(--transition)',
                    boxSizing: 'border-box'
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Açıklama
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Form açıklaması (isteğe bağlı)"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--border-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all var(--transition)',
                    boxSizing: 'border-box',
                    resize: 'vertical',
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Görev Periyodu
                </label>
                <select
                  value={editPeriodType}
                  onChange={(e) => setEditPeriodType(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid var(--border-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    outline: 'none',
                    background: 'var(--surface)',
                    cursor: 'pointer'
                  }}
                >
                  <option value={1}>Günlük</option>
                  <option value={2}>Haftalık</option>
                  <option value={3}>Aylık</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-2)',
                  background: 'var(--surface)',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all var(--transition)'
                }}
              >
                İptal
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.1)',
                  transition: 'all var(--transition)'
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
