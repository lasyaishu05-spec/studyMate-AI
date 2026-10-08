import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { noteApi } from '../api';
import Navbar from '../../../shared/components/Navbar';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';
import { Loader2 } from 'lucide-react';

export default function NotebookPage() {
  const params = useParams();
  const notebookId = params.id || params.notebookId;

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (notebookId) {
      loadNotes();
    }
  }, [notebookId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await noteApi.list(notebookId);
      const fetched = data || [];
      setNotes(fetched);
      if (fetched.length > 0) {
        setSelectedNote(fetched[0]);
      } else {
        setSelectedNote(null);
      }
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await noteApi.create(notebookId, {
        title: 'Untitled Note',
        content: '',
      });
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create note');
    }
  };

  const handleSaveNote = async (updatedFields) => {
    if (!selectedNote) return;
    try {
      const updated = await noteApi.update(notebookId, selectedNote.id, updatedFields);
      setSelectedNote(updated);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save note');
      throw err;
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await noteApi.delete(notebookId, noteId);
      const remaining = notes.filter((n) => n.id !== noteId);
      setNotes(remaining);
      if (selectedNote?.id === noteId) {
        setSelectedNote(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete note');
    }
  };

  return (
    <div className="page-layout notes-workspace-page">
      <Navbar />
      <div className="notes-container">
        {loading ? (
          <div className="workspace-loading">
            <Loader2 size={32} className="spinner" />
            <p>Loading notes...</p>
          </div>
        ) : (
          <>
            <NoteList
              notes={notes}
              selectedNoteId={selectedNote?.id}
              onSelectNote={setSelectedNote}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
            />
            <div className="editor-container">
              <NoteEditor
                note={selectedNote}
                notebookId={notebookId}
                onSave={handleSaveNote}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
