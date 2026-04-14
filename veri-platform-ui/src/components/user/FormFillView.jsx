import React, { useMemo } from 'react';
import { ArrowLeft, Send, Check, FileText, ClipboardList } from 'lucide-react';
import ReadOnlyBanner from './ReadOnlyBanner';

const LiraIcon = () => <span style={{ fontSize: '14px', fontWeight: 700 }}>₺</span>;

export default function FormFillView({
  formTitle,
  questions,
  answers,
  isReadOnly,
  onAnswerChange,
  onFileUpload,
  onSubmit,
  onBack
}) {
  const answeredCount = useMemo(() => {
    return questions.filter(q => {
      const val = answers[q.id];
      if (val === undefined || val === null || val === '') return false;
      if (Array.isArray(val)) return val.length > 0;
      return true;
    }).length;
  }, [answers, questions]);

  const progressPercent = questions.length > 0
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const renderInput = (q) => {
    const options = q.optionsJson ? JSON.parse(q.optionsJson) : [];
    const disabled = isReadOnly;

    switch (q.type) {
      case 'radio':
        return (
          <div className="options-container">
            {options.map((opt, i) => (
              <label key={i} className={`radio-option ${answers[q.id] === opt ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}>
                <input type="radio" name={`q-${q.id}`} value={opt}
                  checked={answers[q.id] === opt}
                  onChange={e => onAnswerChange(q.id, e.target.value)}
                  style={{ display: 'none' }} disabled={disabled} />
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
                <label key={i} className={`checkbox-option ${checked ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}>
                  <input type="checkbox" value={opt} checked={checked}
                    onChange={e => {
                      const cur = answers[q.id] || [];
                      onAnswerChange(q.id, e.target.checked
                        ? [...cur, opt]
                        : cur.filter(a => a !== opt));
                    }} style={{ display: 'none' }} disabled={disabled} />
                  <div className={`custom-checkbox ${checked ? 'checked' : ''}`}>
                    {checked && <Check size={10} />}
                  </div>
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        );

      case 'currency':
        return (
          <div className="currency-input-wrapper">
            <span className="currency-prefix"><LiraIcon /></span>
            <input className="q-input currency"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={answers[q.id] || ''}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
                onAnswerChange(q.id, val);
              }}
              disabled={disabled}
            />
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div className="file-upload-wrapper">
            <label className={`file-upload-area ${disabled ? 'disabled' : ''}`}>
              <input type="file" style={{ display: 'none' }}
                onChange={e => onFileUpload(q.id, e.target.files[0])} disabled={disabled} />
              <div className="file-upload-icon"><FileText size={36} /></div>
              <div className="file-upload-text">
                {answers[q.id] ? 'Dosyayı Değiştir' : 'Dosya seçmek için tıklayın'}
              </div>
              <div className="file-upload-hint">veya sürükleyip bırakın</div>
            </label>
            {answers[q.id] && (
              <div className="file-success">
                <Check size={14} style={{ marginRight: 4 }} /> Yüklendi —{' '}
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
            onChange={e => onAnswerChange(q.id, e.target.value)}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="form-animation-fade">
      <div className="form-fill-header">
        <div className="back-link" onClick={onBack}>
          <ArrowLeft size={13} /> Geri Dön
        </div>
        <div className="form-fill-title">{formTitle}</div>
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

      {isReadOnly && <ReadOnlyBanner />}

      {questions.length === 0 ? (
        <div className="no-tasks">
          <div className="no-tasks-icon"><ClipboardList size={48} /></div>
          <div className="no-tasks-title">Bu formda henüz soru yok</div>
          <div className="no-tasks-desc">Yönetici soru ekledikten sonra burada görünecek.</div>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
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
            {isReadOnly ? null : (
              <>
                <div className="submit-info">
                  <strong>{answeredCount}</strong> / {questions.length} soru yanıtlandı
                </div>
                <button type="submit" className="submit-btn">
                  Formu Gönder <Send size={15} />
                </button>
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
}