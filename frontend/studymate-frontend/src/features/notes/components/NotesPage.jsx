import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  summarizeNote,
  generateQuiz,
} from '../api';
import Navbar from '../../../shared/components/Navbar';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Sparkles,
  HelpCircle,
  FileText,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function NotesPage() {
  const { notebookId } = useParams();

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'summary' | 'quiz' | null
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    fetchNotes();
  }, [notebookId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await getNotes(notebookId);
      const fetchedNotes = res.data || [];
      setNotes(fetchedNotes);
      if (fetchedNotes.length > 0) {
        selectNote(fetchedNotes[0]);
      } else {
        setSelectedNote(null);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content || '');
  };

  const handleCreateNew = async () => {
    try {
      const newNoteData = {
        title: 'Untitled Note',
        content: '',
      };
      const res = await createNote(notebookId, newNoteData);
      setNotes([res.data, ...notes]);
      selectNote(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create note');
    }
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    try {
      setSaving(true);
      const res = await updateNote(notebookId, selectedNote.id, { title, content });
      setSelectedNote(res.data);
      setNotes(notes.map((n) => (n.id === selectedNote.id ? res.data : n)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(notebookId, noteId);
      const remaining = notes.filter((n) => n.id !== noteId);
      setNotes(remaining);
      if (selectedNote?.id === noteId) {
        if (remaining.length > 0) selectNote(remaining[0]);
        else {
          setSelectedNote(null);
          setTitle('');
          setContent('');
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note');
    }
  };

  const handleSummarize = async () => {
    if (!selectedNote) return;
    try {
      setAiLoading(true);
      setActiveModal('summary');
      setSummary('');
      const res = await summarizeNote(notebookId, selectedNote.id);
      setSummary(res.data.summary);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate AI summary');
      setActiveModal(null);
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuiz = async () => {
    if (!selectedNote) return;
    try {
      setAiLoading(true);
      setActiveModal('quiz');
      setQuizQuestions(null);
      setSelectedAnswers({});
      const res = await generateQuiz(notebookId, selectedNote.id);
      setQuizQuestions(res.data.questions);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate quiz');
      setActiveModal(null);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="page-layout notes-workspace-page">
      <Navbar />

      <div className="notes-container">
        {/* Sidebar list */}
        <aside className="notes-sidebar">
          <div className="sidebar-header">
            <Link to="/" className="back-link">
              <ArrowLeft size={16} /> Back to Notebooks
            </Link>
            <div className="sidebar-title-row">
              <h3>Notes</h3>
              <button className="btn-icon-primary" onClick={handleCreateNew} title="New Note">
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="notes-list">
            {loading ? (
              <div className="sidebar-loading">
                <Loader2 className="spinner" size={20} />
              </div>
            ) : notes.length === 0 ? (
              <div className="sidebar-empty">
                <p>No notes in this notebook yet.</p>
                <button className="btn-secondary small" onClick={handleCreateNew}>
                  Create Note
                </button>
              </div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className={`note-item-tab ${selectedNote?.id === n.id ? 'active' : ''}`}
                  onClick={() => selectNote(n)}
                >
                  <div className="note-tab-info">
                    <FileText size={16} className="note-item-icon" />
                    <span className="note-tab-title">{n.title || 'Untitled'}</span>
                  </div>
                  <button
                    className="delete-note-btn"
                    title="Delete Note"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Editor Area */}
        <section className="notes-editor-area">
          {selectedNote ? (
            <>
              <div className="editor-toolbar">
                <input
                  type="text"
                  className="editor-title-input"
                  placeholder="Note Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="editor-actions">
                  <button
                    className="btn-ai"
                    onClick={handleSummarize}
                    disabled={!content.trim() || aiLoading}
                    title="Generate an AI executive summary"
                  >
                    <Sparkles size={16} />
                    <span>AI Summarize</span>
                  </button>

                  <button
                    className="btn-ai-quiz"
                    onClick={handleQuiz}
                    disabled={!content.trim() || aiLoading}
                    title="Generate a quiz to test knowledge"
                  >
                    <HelpCircle size={16} />
                    <span>AI Quiz</span>
                  </button>

                  <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </div>

              <div className="editor-body">
                <textarea
                  className="note-textarea"
                  placeholder="Write your study notes, formulas, concepts, or paste text here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="no-note-selected">
              <FileText size={48} />
              <h3>Select or create a note</h3>
              <p>Choose a note from the left sidebar or click the plus icon to start writing.</p>
              <button className="btn-primary" onClick={handleCreateNew}>
                <Plus size={18} />
                <span>Create New Note</span>
              </button>
            </div>
          )}
        </section>
      </div>

      {/* AI Summary Modal */}
      {activeModal === 'summary' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <Sparkles size={22} className="ai-accent-icon" />
                <h3>AI Note Summary</h3>
              </div>
              <button className="icon-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-scroll">
              {aiLoading ? (
                <div className="ai-processing">
                  <Loader2 className="spinner" size={32} />
                  <p>Analyzing note content and generating key insights...</p>
                </div>
              ) : (
                <div className="ai-result-content">
                  <p style={{ whiteSpace: 'pre-line' }}>{summary}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setActiveModal(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Quiz Modal */}
      {activeModal === 'quiz' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box ai-modal quiz-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <HelpCircle size={22} className="ai-accent-icon" />
                <h3>StudyMate AI Quiz</h3>
              </div>
              <button className="icon-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-scroll">
              {aiLoading ? (
                <div className="ai-processing">
                  <Loader2 className="spinner" size={32} />
                  <p>Crafting interactive practice questions from your notes...</p>
                </div>
              ) : quizQuestions && Array.isArray(quizQuestions) ? (
                <div className="quiz-questions-list">
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className="quiz-question-card">
                      <h4>
                        Q{idx + 1}: {q.question || q.prompt}
                      </h4>
                      {q.options && Array.isArray(q.options) ? (
                        <div className="quiz-options">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswers[idx] === opt;
                            const isCorrect = opt === q.answer || opt === q.correctAnswer;
                            const hasAnswered = selectedAnswers[idx] !== undefined;

                            let optClass = 'quiz-option-btn';
                            if (hasAnswered) {
                              if (isCorrect) optClass += ' correct';
                              else if (isSelected) optClass += ' incorrect';
                            }

                            return (
                              <button
                                key={oIdx}
                                className={optClass}
                                onClick={() =>
                                  setSelectedAnswers((prev) => ({
                                    ...prev,
                                    [idx]: opt,
                                  }))
                                }
                              >
                                <span>{opt}</span>
                                {hasAnswered && isCorrect && <CheckCircle2 size={16} />}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="quiz-open-answer">
                          <strong>Answer:</strong> {q.answer || q.correctAnswer || 'See notes'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ai-result-content">
                  <pre>{JSON.stringify(quizQuestions, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setActiveModal(null)}>
                Close Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
