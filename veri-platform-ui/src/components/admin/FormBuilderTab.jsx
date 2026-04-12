import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from '../SortableItem';

export default function FormBuilderTab({ 
  selectedForm, questions, setQuestions, fetchQuestions, api, Ico 
}) {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedType, setSelectedType] = useState('text');
  const [options, setOptions] = useState([]);
  const [currentOption, setCurrentOption] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  
  // 🚀 YENİ STATE'LER
  const [isRequired, setIsRequired] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleEditClick = (qId) => {
    const q = questions.find(x => x.id === qId);
    if (!q) return;
    setNewQuestionText(q.label); 
    setSelectedType(q.type);
    setOptions(q.optionsJson ? JSON.parse(q.optionsJson) : []);
    setIsRequired(q.isRequired || false);
    setImageUrl(q.imageUrl || "");
    setEditingQuestionId(q.id);
  };

  // 🚀 GÖRSEL YÜKLEME FONKSİYONU
  const handleImageUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/Form/upload', formData);
      setImageUrl(res.data.url);
      toast.success("Görsel yüklendi!");
    } catch {
      toast.error("Görsel yüklenemedi.");
    }
  };

  const handleSaveQuestion = async () => {
    if (!newQuestionText.trim()) return toast.error("Soru metni boş olamaz!");
    
    const payload = { 
      formTemplateId: selectedForm.id, 
      label: newQuestionText, 
      type: selectedType,
      isRequired: isRequired, // 🚀 Backend'e gidiyor
      imageUrl: imageUrl,     // 🚀 Backend'e gidiyor
      optionsJson: (selectedType === 'radio' || selectedType === 'checkbox') && options.length > 0 
                    ? JSON.stringify(options) : null
    };

    try {
      if (editingQuestionId) {
        await api.put(`/Form/questions/${editingQuestionId}`, payload);
      } else {
        await api.post(`/Form/templates/${selectedForm.id}/questions`, payload);
      }
      resetForm();
      fetchQuestions();
      toast.success("Soru kaydedildi.");
    } catch { toast.error("Hata oluştu!"); }
  };

  const resetForm = () => {
    setNewQuestionText('');
    setOptions([]);
    setSelectedType('text');
    setIsRequired(false);
    setImageUrl("");
    setEditingQuestionId(null);
  };

  // ... Silme ve Drag-End fonksiyonların aynı kalıyor ...
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
    try { await api.delete(`/Form/questions/${id}`); fetchQuestions(); }
    catch { toast.error('Silinemedi.'); }
  };

  const handleDragEnd = async ({ active, over }) => {
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

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 350px', background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          {editingQuestionId ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Soru Metni */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-2)', display: 'block', marginBottom: '8px' }}>Soru Metni</span>
            <input type="text" value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-2)', background: 'var(--bg)', color: 'var(--text-1)' }} />
          </div>

          {/* 🚀 GÖRSEL EKLEME */}
          <div style={{ border: '1px dashed var(--border)', padding: '10px', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '5px' }}>SORU GÖRSELİ</span>
            <input type="file" onChange={e => handleImageUpload(e.target.files[0])} style={{ fontSize: '11px' }} />
            {imageUrl && <img src={imageUrl} style={{ width: '100%', marginTop: '10px', borderRadius: '5px' }} />}
          </div>

          {/* Cevap Tipi */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-2)', display: 'block', marginBottom: '8px' }}>Cevap Tipi</span>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-2)', background: 'var(--bg)', color: 'var(--text-1)' }}>
              <option value="text">Kısa Metin</option>
              <option value="number">Sayı</option>
              <option value="date">Tarih</option>
              <option value="radio">Tekli Seçim</option>
              <option value="checkbox">Çoklu Seçim</option>
              <option value="image">Resim Yükleme (Personel için)</option>
              <option value="file">Dosya Yükleme (Personel için)</option>
            </select>
          </div>

          {/* 🚀 ZORUNLU SORU CHECKBOX */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="isRequired" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
            <label htmlFor="isRequired" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-1)', cursor: 'pointer' }}>Bu soru zorunlu olsun</label>
          </div>

          {/* Şıklar Paneli (Sadece Radio/Checkbox için) */}
          {(selectedType === 'radio' || selectedType === 'checkbox') && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-2)', display: 'block', marginBottom: '8px' }}>Şıklar</span>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input type="text" value={currentOption} onChange={e => setCurrentOption(e.target.value)} onKeyDown={e => e.key === 'Enter' && currentOption.trim() && (setOptions([...options, currentOption]), setCurrentOption(''))} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-2)', background: 'var(--bg)', color: 'var(--text-1)' }} placeholder="Şık ekle..." />
                <button onClick={() => { if(currentOption.trim()) { setOptions([...options, currentOption]); setCurrentOption(''); } }} style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer' }}>Ekle</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {options.map((opt, i) => (
                  <span key={i} style={{ background: 'var(--bg-3)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                    {opt} <button onClick={() => setOptions(options.filter((_, j) => j !== i))} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button onClick={handleSaveQuestion} style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              {editingQuestionId ? 'Güncelle' : 'Ekle'}
            </button>
            {editingQuestionId && (
              <button onClick={resetForm} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>İptal</button>
            )}
          </div>
        </div>
      </div>

      {/* SAĞ TARAF: SORU LİSTESİ */}
      <div style={{ flex: '2 1 400px', background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Form İskeleti</div>
        {questions.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px' }}>Henüz soru eklenmedi</div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions} strategy={verticalListSortingStrategy}>
              {questions.map(q => <SortableItem key={q.id} id={q.id} label={q.label} type={q.type} onDelete={handleDeleteQuestion} onEdit={handleEditClick} />)}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}