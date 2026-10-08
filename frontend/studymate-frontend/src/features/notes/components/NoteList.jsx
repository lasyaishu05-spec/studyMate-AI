import { FileText, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
}) {
  return (
    <aside className="notes-sidebar">
      <div className="sidebar-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Notebooks</span>
        </Link>
        <div className="sidebar-title-row">
          <h3>Notes</h3>
          <button
            className="btn-primary small"
            onClick={onCreateNote}
            title="Create a new note"
          >
            <Plus size={16} />
            <span>New Note</span>
          </button>
        </div>
      </div>

      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="sidebar-empty">
            <p>No notes yet.</p>
            <button className="btn-secondary small" onClick={onCreateNote}>
              <Plus size={14} />
              <span>New Note</span>
            </button>
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className={`note-item-tab ${selectedNoteId === n.id ? 'active' : ''}`}
              onClick={() => onSelectNote(n)}
            >
              <div className="note-tab-info">
                <FileText size={16} className="note-item-icon" />
                <span className="note-tab-title">{n.title || 'Untitled Note'}</span>
              </div>
              <button
                className="delete-note-btn"
                title="Delete note"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(n.id);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
