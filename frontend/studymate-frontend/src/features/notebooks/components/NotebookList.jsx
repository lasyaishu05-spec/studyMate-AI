import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notebookApi } from '../api';
import { Plus, BookOpen, Trash2, ArrowRight, FolderPlus, AlertCircle } from 'lucide-react';

export default function NotebookList() {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notebookApi.list();
      setNotebooks(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load notebooks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const created = await notebookApi.create({ title: title.trim() });
      setNotebooks((prev) => [created, ...prev]);
      setTitle('');
      setShowCreateModal(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create notebook');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this notebook?')) return;
    try {
      await notebookApi.delete(id);
      setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete notebook');
    }
  };

  return (
    <div className="notebook-list-wrapper">
      <div className="section-header">
        <div>
          <h1 className="page-title">My Notebooks</h1>
          <p className="page-subtitle">Organize and manage your study materials</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          <span>New Notebook</span>
        </button>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="notebook-card skeleton-card">
              <div className="skeleton-icon"></div>
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-date"></div>
            </div>
          ))}
        </div>
      ) : notebooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FolderPlus size={48} />
          </div>
          <h3>No notebooks yet — create your first one</h3>
          <p>Create your first notebook to begin storing notes and generating summaries and quizzes.</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>New Notebook</span>
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {notebooks.map((nb) => (
            <div
              key={nb.id}
              className="notebook-card"
              onClick={() => navigate(`/notebooks/${nb.id}`)}
            >
              <div className="notebook-card-header">
                <div className="notebook-icon-wrap">
                  <BookOpen size={20} />
                </div>
                <button
                  className="icon-btn danger"
                  title="Delete Notebook"
                  onClick={(e) => handleDelete(e, nb.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="notebook-title">{nb.title}</h3>
              <div className="notebook-card-footer">
                <span className="notebook-date">
                  {new Date(nb.createdAt || Date.now()).toLocaleDateString()}
                </span>
                <span className="open-link">
                  Open <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Notebook</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="title">Notebook Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Biology, Modern History"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
