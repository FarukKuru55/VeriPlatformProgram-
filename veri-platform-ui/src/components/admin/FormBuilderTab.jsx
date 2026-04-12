import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from '../SortableItem';
import { FaPlus, FaTextWidth, FaHashtag, FaCalendarAlt, FaDotCircle, FaCheckSquare, FaImage, FaFileAlt, FaTrashAlt, FaEdit, FaGripVertical, FaAsterisk, FaQuestion } from 'react-icons/fa';
import { IconPhoto, IconFile } from '@tabler/icons-react';

export default function FormBuilderTab({
  selectedForm,
  questions,
  setQuestions,
  fetchQuestions,
  api,
}) {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedType, setSelectedType] = useState('text');
  const [options, setOptions] = useState([]);
  const [currentOption, setCurrentOption] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isRequired, setIsRequired] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleEditClick = (qId) => {
    const q = questions.find((x) => x.id === qId);
    if (!q) return;
    setNewQuestionText(q.label);
    setSelectedType(q.type);
    setOptions(q.optionsJson ? JSON.parse(q.optionsJson) : []);
    setIsRequired(q.isRequired || false);
    setImageUrl(q.imageUrl || '');
    setEditingQuestionId(q.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setNewQuestionText('');
    setOptions([]);
    setSelectedType('text');
    setIsRequired(false);
    setImageUrl('');
    setEditingQuestionId(null);
    setCurrentOption('');
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/Form/upload', formData);
      setImageUrl(res.data.url);
      toast.success('Görsel başarıyla yüklendi.');
    } catch {
      toast.error('Görsel yüklenemedi.');
    }
  };

  const handleSaveQuestion = async () => {
    if (!newQuestionText.trim()) return toast.error('Soru metni girilmesi zorunludur.');

    const payload = {
      formTemplateId: selectedForm.id,
      label: newQuestionText,
      type: selectedType,
      isRequired,
      imageUrl: imageUrl || null,
      optionsJson:
        (selectedType === 'radio' || selectedType === 'checkbox') && options.length > 0
          ? JSON.stringify(options)
          : null,
    };

    try {
      if (editingQuestionId) {
        await api.put(`/Form/questions/${editingQuestionId}`, payload);
        toast.success('Soru başarıyla güncellendi.');
      } else {
        await api.post(`/Form/templates/${selectedForm.id}/questions`, payload);
        toast.success('Soru başarıyla eklendi.');
      }
      resetForm();
      fetchQuestions();
    } catch {
      toast.error('İşlem sırasında bir hata oluştu.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Bu soruyu silmek istediğinizden emin misiniz?')) return;
    try {
      await api.delete(`/Form/questions/${id}`);
      toast.success('Soru başarıyla silindi.');
      fetchQuestions();
    } catch {
      toast.error('Soru silinemedi.');
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    let ordered = [];
    setQuestions((items) => {
      const oi = items.findIndex((i) => i.id === active.id);
      const ni = items.findIndex((i) => i.id === over.id);
      ordered = arrayMove(items, oi, ni);
      return ordered;
    });
    try {
      await api.put('/Form/questions/reorder', ordered.map((q) => q.id));
    } catch {
      toast.error('Sıralama güncellenemedi.');
    }
  };

  const addOption = () => {
    if (!currentOption.trim()) return;
    setOptions([...options, currentOption.trim()]);
    setCurrentOption('');
  };

  const typeIcons = {
    text: <FaTextWidth size={15} />,
    number: <FaHashtag size={15} />,
    date: <FaCalendarAlt size={15} />,
    radio: <FaDotCircle size={15} />,
    checkbox: <FaCheckSquare size={15} />,
    image: <IconPhoto size={15} />,
    file: <IconFile size={15} />,
  };

  const typeLabels = {
    text: 'Kısa Yanıt',
    number: 'Sayısal Yanıt',
    date: 'Tarih Seçimi',
    radio: 'Tek Seçim',
    checkbox: 'Çoklu Seçim',
    image: 'Görsel Yükleme',
    file: 'Belge Yükleme',
  };

  const typeColors = {
    text: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    number: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    date: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    radio: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    checkbox: { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
    image: { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    file: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '400px 1fr',
      gap: '24px',
      alignItems: 'start'
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: '24px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <FaQuestion size={18} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
              {editingQuestionId ? 'Soruyu Güncelle' : 'Yeni Soru Oluştur'}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
              {editingQuestionId ? 'Mevcut soruyu düzenleyin' : 'Formunuza soru ekleyin'}
            </div>
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              Soru Metni
            </label>
            <textarea
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Sorunuzu buraya yazınız..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px 14px',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                color: 'var(--text-1)',
                background: 'var(--surface)',
                resize: 'vertical',
                outline: 'none',
                transition: 'all var(--transition)',
                boxSizing: 'border-box',
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
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Yanıt Türü
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px'
            }}>
              {Object.entries(typeLabels).map(([value, label]) => {
                const tc = typeColors[value];
                const isActive = selectedType === value;
                return (
                  <button
                    key={value}
                    onClick={() => setSelectedType(value)}
                    style={{
                      padding: '12px 6px',
                      borderRadius: 'var(--radius-md)',
                      border: isActive ? `2px solid ${tc.color}` : '1px solid var(--border-2)',
                      background: isActive ? tc.bg : 'var(--surface)',
                      color: isActive ? tc.color : 'var(--text-3)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all var(--transition)',
                      fontSize: '9px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}
                  >
                    {typeIcons[value]}
                    <span style={{ fontSize: '9px' }}>{label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: isRequired ? 'rgba(239, 68, 68, 0.05)' : 'var(--surface-2)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${isRequired ? 'rgba(239, 68, 68, 0.2)' : 'var(--border)'}`,
            cursor: 'pointer',
            transition: 'all var(--transition)'
          }}
          onClick={() => setIsRequired(!isRequired)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaAsterisk size={14} color={isRequired ? '#ef4444' : 'var(--text-4)'} />
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: isRequired ? '#dc2626' : 'var(--text-2)'
              }}>
                Zorunlu Alan
              </span>
            </div>
            <div style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              background: isRequired ? '#ef4444' : 'var(--slate-300)',
              position: 'relative',
              transition: 'all var(--transition)'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '2px',
                left: isRequired ? '22px' : '2px',
                transition: 'all var(--transition)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
              }} />
            </div>
          </div>

          {(selectedType === 'radio' || selectedType === 'checkbox') && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-3)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Seçenekler
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addOption()}
                  placeholder="Seçenek giriniz..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '1px solid var(--border-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
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
                  onClick={addOption}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                    boxShadow: '0 1px 2px rgba(59, 130, 246, 0.2)'
                  }}
                >
                  Ekle
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {options.map((opt, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius)',
                      fontSize: '13px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <span style={{ color: 'var(--text-2)' }}>{opt}</span>
                    <button
                      onClick={() => setOptions(options.filter((_, j) => j !== i))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        opacity: 0.6,
                        transition: 'opacity var(--transition)'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = 1}
                      onMouseLeave={(e) => e.target.style.opacity = 0.6}
                    >
                      <FaTrashAlt size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-3)',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Soru Görseli (İsteğe bağlı)
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '20px',
              border: '2px dashed var(--border-2)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--text-3)',
              fontSize: '13px',
              transition: 'all var(--transition)',
              background: 'var(--surface-2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.background = 'var(--accent-soft)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--border-2)';
              e.target.style.background = 'var(--surface-2)';
            }}
            >
              <IconPhoto size={18} />
              Görsel yüklemek için tıklayın
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
            {imageUrl && (
              <div style={{ marginTop: '12px', position: 'relative' }}>
                <img
                  src={imageUrl}
                  alt="Soru görseli"
                  style={{
                    width: '100%',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}
                />
                <button
                  onClick={() => setImageUrl('')}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <FaTrashAlt size={12} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              onClick={handleSaveQuestion}
              style={{
                flex: 1,
                padding: '13px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.1)',
                transition: 'all var(--transition)'
              }}
            >
              <FaPlus size={14} />
              {editingQuestionId ? 'Güncelle' : 'Ekle'}
            </button>
            {editingQuestionId && (
              <button
                onClick={resetForm}
                style={{
                  padding: '13px 20px',
                  background: 'var(--surface)',
                  color: 'var(--text-2)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition)'
                }}
              >
                İptal
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        minHeight: '500px'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FaEdit size={16} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
                Soru Listesi
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                {questions.length} soru oluşturuldu
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-4)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}>
            <FaGripVertical size={14} />
            Sürükleyerek sıralayın
          </div>
        </div>

        {questions.length === 0 ? (
          <div style={{
            padding: '80px 24px',
            textAlign: 'center',
            color: 'var(--text-3)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%)',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)'
            }}>
              <FaQuestion size={32} color="var(--text-4)" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '6px' }}>
              Henüz soru oluşturulmadı
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>
              Sol taraftaki formu doldurarak ilk sorunuzu ekleyin
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={questions} strategy={verticalListSortingStrategy}>
                {questions.map((q) => (
                  <SortableItem
                    key={q.id}
                    id={q.id}
                    label={q.label}
                    type={q.type}
                    onDelete={handleDeleteQuestion}
                    onEdit={handleEditClick}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
