import { useState, useEffect } from 'react';
import AIPanel from './AIPanel';
import { Save, Loader2, FileEdit } from 'lucide-react';

export default function NoteEditor({ note, notebookId, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note) return;
    setSaving(true);
    try {
      await onSave({ title: title || 'Untitled Note', content });
    } finally {
      setSaving(false);
    }
  };

  if (!note) {
    return (
      <div className="no-note-selected">
        <FileEdit size={48} />
        <h3>Select a note or create one</h3>
        <p>Pick a note from the sidebar or click "New Note" to begin writing.</p>
      </div>
    );
  }

  return (
    <div className="note-editor-wrapper">
      <form onSubmit={handleSubmit} className="editor-form">
        <div className="editor-toolbar">
          <input
            type="text"
            name="title"
            className="editor-title-input"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="spinner" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save</span>
              </>
            )}
          </button>
        </div>

        <div className="editor-body">
          <textarea
            name="content"
            className="note-textarea"
            placeholder="Write your note content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </form>

      {/* AI Assistant Panel */}
      {note.id && (
        <AIPanel
          notebookId={notebookId}
          noteId={note.id}
          content={content}
          onBeforeAi={() => onSave({ title: title || 'Untitled Note', content })}
        />
      )}
    </div>
  );
}
