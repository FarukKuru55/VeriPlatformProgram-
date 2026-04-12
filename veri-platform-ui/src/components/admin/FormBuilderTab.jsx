import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from '../SortableItem';
import { FaClipboardList, FaTextWidth, FaHashtag, FaCalendarAlt, FaDotCircle, FaCheckSquare, FaImage, FaFileAlt } from 'react-icons/fa';

/**
 * FormBuilderTab.jsx
 * ─────────────────────────────────────────────
 * Seçili bir form için soru ekleme / düzenleme / sıralama ekranı.
 * Props:
 *  - selectedForm   : Seçili form objesi { id, title }
 *  - questions      : Soru listesi state'i
 *  - setQuestions   : Soru listesini güncellemek için setter
 *  - fetchQuestions : Soruları API'den yeniden çeker
 *  - api            : Axios instance (baseURL + auth header hazır)
 *  - Ico            : SVG ikon nesnesi
 * ─────────────────────────────────────────────
 * Özellikler:
 *  - Yeni soru ekleme (POST)
 *  - Mevcut soruyu düzenleme (PUT)  →  onEdit prop ile tetiklenir
 *  - Soru silme (DELETE)            →  Swal onayı ile
 *  - Drag & drop sıralama (PUT /reorder)
 *  - Radio/Checkbox için şık yönetimi
 *  - Zorunlu soru işaretleme (isRequired)
 *  - Soru görseli yükleme (imageUrl)
 */
export default function FormBuilderTab({
  selectedForm,
  questions,
  setQuestions,
  fetchQuestions,
  api,
}) {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedType, setSelectedType]       = useState('text');
  const [options, setOptions]                 = useState([]);
  const [currentOption, setCurrentOption]     = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isRequired, setIsRequired]           = useState(false);
  const [imageUrl, setImageUrl]               = useState('');

  /* ── Düzenleme modunu aç ── */
  const handleEditClick = (qId) => {
    const q = questions.find((x) => x.id === qId);
    if (!q) return;
    setNewQuestionText(q.label);
    setSelectedType(q.type);
    setOptions(q.optionsJson ? JSON.parse(q.optionsJson) : []);
    setIsRequired(q.isRequired || false);
    setImageUrl(q.imageUrl || '');
    setEditingQuestionId(q.id);
  };

  /* ── Formu temizle ── */
  const resetForm = () => {
    setNewQuestionText('');
    setOptions([]);
    setSelectedType('text');
    setIsRequired(false);
    setImageUrl('');
    setEditingQuestionId(null);
    setCurrentOption('');
  };

  /* ── Görsel yükle ── */
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

  /* ── Kaydet / Güncelle ── */
  const handleSaveQuestion = async () => {
    if (!newQuestionText.trim()) return toast.error('Soru metni girilmesi zorunludur.');

    const payload = {
      formTemplateId: selectedForm.id,
      label:          newQuestionText,
      type:           selectedType,
      isRequired,
      imageUrl:       imageUrl || null,
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

  /* ── Sil ── */
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

  /* ── Drag & Drop ── */
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

  /* ── Şık ekle ── */
  const addOption = () => {
    if (!currentOption.trim()) return;
    setOptions([...options, currentOption.trim()]);
    setCurrentOption('');
  };

  const typeIcons = {
    text: <FaTextWidth size={14} />,
    number: <FaHashtag size={14} />,
    date: <FaCalendarAlt size={14} />,
    radio: <FaDotCircle size={14} />,
    checkbox: <FaCheckSquare size={14} />,
    image: <FaImage size={14} />,
    file: <FaFileAlt size={14} />,
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

  return (
    <div className="builder-grid">

      {/* ── Sol: Soru Ekle / Düzenle ── */}
      <div className="panel-card">
        <div className="panel-card-header">
          <svg width="16" height="16" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <div className="panel-card-title">
            {editingQuestionId ? 'Soruyu Güncelle' : 'Yeni Soru Oluştur'}
          </div>
        </div>

        <div className="panel-card-body">

          {/* Soru Metni */}
          <div>
            <span className="field-label">Soru Metni</span>
            <input
              className="text-input"
              type="text"
              placeholder="Sorunuzu buraya yazınız..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveQuestion()}
            />
          </div>

          {/* Cevap Tipi */}
          <div>
            <span className="field-label">Yanıt Türü</span>
            <select
              className="field-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {typeIcons[value]} {label}
                </option>
              ))}
            </select>
          </div>

          {/* Zorunlu Alan */}
          <div className="toggle-row">
            <input
              className="toggle-check"
              type="checkbox"
              id="isRequired"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
            <label className="toggle-label" htmlFor="isRequired">
              Yanıt zorunludur
            </label>
          </div>

          {/* Soru Görseli */}
          <div className="options-area">
            <span className="field-label">Soru Görseli (İsteğe Bağlı)</span>
            <input
              type="file"
              accept="image/*"
              style={{ fontSize: 12, color: 'var(--text-2)' }}
              onChange={(e) => handleImageUpload(e.target.files[0])}
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Soru görseli"
                style={{
                  width: '100%',
                  marginTop: 10,
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                }}
              />
            )}
          </div>

          {/* Radio / Checkbox Şıkları */}
          {(selectedType === 'radio' || selectedType === 'checkbox') && (
            <div className="options-area">
              <span className="field-label">Seçenekler</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="text-input"
                  style={{ flex: 1 }}
                  type="text"
                  placeholder="Seçenek giriniz..."
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addOption()}
                />
                <button className="add-btn" onClick={addOption}>
                  Ekle
                </button>
              </div>
              <div className="option-tags">
                {options.map((opt, i) => (
                  <span className="option-tag" key={i}>
                    {opt}
                    <button
                      className="tag-remove"
                      onClick={() => setOptions(options.filter((_, j) => j !== i))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Kaydet / İptal */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="submit-field-btn"
              style={{ flex: 1 }}
              onClick={handleSaveQuestion}
            >
              {editingQuestionId ? '✓ Güncelle' : '+ Ekle'}
            </button>
            {editingQuestionId && (
              <button
                style={{
                  padding: '11px 16px',
                  background: 'var(--surface)',
                  color: 'var(--text-2)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 13,
                }}
                onClick={resetForm}
              >
                İptal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Sağ: Form İskeleti / Sıralama ── */}
      <div className="panel-card">
        <div className="panel-card-header">
          <svg width="16" height="16" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
          </svg>
          <div className="panel-card-title">Form Taslağı</div>
          <span style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'var(--text-3)',
            fontFamily: 'var(--font-mono)',
          }}>
            Sıralamayı değiştirmek için sürükleyin
          </span>
        </div>

        {questions.length === 0 ? (
          <div className="empty-state">
            <FaClipboardList className="empty-icon" />
            <div className="empty-text">Henüz soru oluşturulmadı</div>
          </div>
        ) : (
          <div className="sortable-list">
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