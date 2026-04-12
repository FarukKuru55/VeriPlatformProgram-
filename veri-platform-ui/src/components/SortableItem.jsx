import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableItem({ id, label, type, onDelete, onEdit }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: '15px 20px',
        margin: '8px 0',
        backgroundColor: '#1e2330',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'grab',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    };

    return (
        <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div>
                <strong style={{ color: '#f0f2f8', fontSize: '15px' }}>{label}</strong> 
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#4f8ef7', backgroundColor: 'rgba(79,142,247,0.1)', padding: '3px 8px', borderRadius: '12px' }}>{type}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onEdit(id)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Düzenle</button>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onDelete(id)} style={{ padding: '6px 12px', background: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Sil</button>
            </div>
        </li>
    );
}