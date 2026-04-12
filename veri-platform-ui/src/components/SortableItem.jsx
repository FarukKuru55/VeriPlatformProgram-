import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripVertical, FaEdit, FaTrash, FaQuestion, FaTextWidth, FaHashtag, FaCalendarAlt, FaDotCircle, FaCheckSquare } from 'react-icons/fa';
import { IconPhoto, IconFile } from '@tabler/icons-react';

const typeIcons = {
  text: <FaTextWidth size={14} />,
  number: <FaHashtag size={14} />,
  date: <FaCalendarAlt size={14} />,
  radio: <FaDotCircle size={14} />,
  checkbox: <FaCheckSquare size={14} />,
  image: <IconPhoto size={14} />,
  file: <IconFile size={14} />,
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

export default function SortableItem({ id, label, type, onDelete, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const tc = typeColors[type] || typeColors.text;

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div style={{
        padding: '14px 16px',
        margin: '6px 0',
        background: 'var(--surface)',
        border: `1px solid ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'grab',
        boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transition: 'all var(--transition)',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{
            padding: '8px',
            borderRadius: 'var(--radius)',
            background: 'var(--surface-2)',
            color: 'var(--text-3)',
            display: 'flex',
            cursor: 'grab'
          }}>
            <FaGripVertical size={14} />
          </div>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: tc.bg,
            color: tc.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {typeIcons[type] || <FaQuestion size={14} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-1)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {label}
            </div>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius)',
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            background: tc.bg,
            color: tc.color,
            flexShrink: 0
          }}>
            {type}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onEdit(id)}
            style={{
              padding: '8px 12px',
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-glow)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--transition)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--accent)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--accent-soft)';
              e.target.style.color = 'var(--accent)';
            }}
          >
            <FaEdit size={11} />
            Düzenle
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(id)}
            style={{
              padding: '8px 12px',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--transition)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ef4444';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.08)';
              e.target.style.color = '#ef4444';
            }}
          >
            <FaTrash size={11} />
            Sil
          </button>
        </div>
      </div>
    </li>
  );
}
