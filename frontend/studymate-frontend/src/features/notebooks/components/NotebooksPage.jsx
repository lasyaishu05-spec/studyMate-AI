import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotebooks, createNotebook, deleteNotebook } from '../api';
import Navbar from '../../../shared/components/Navbar';
import { Plus, BookOpen, Trash2, ArrowRight, FolderPlus, Loader2 } from 'lucide-react';

export default function NotebooksPage() {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  const fetchNotebooks = async () => {
    try {
      setLoading(true);
      const res = await getNotebooks();
      setNotebooks(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notebooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setCreating(true);
      const res = await createNotebook({ title: title.trim() });
      setNotebooks([res.data, ...notebooks]);
      setTitle('');
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create notebook');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this notebook and its notes?')) return;
    try {
      await deleteNotebook(id);
      setNotebooks(notebooks.filter((n) => n.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete notebook');
    }
  };

  return (
    <div className="page-layout">
      <Navbar />

      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="page-title">My Notebooks</h1>
            <p className="page-subtitle">Organize and manage your study materials</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            <span>New Notebook</span>
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <Loader2 className="spinner" size={32} />
            <p>Loading notebooks...</p>
          </div>
        ) : notebooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FolderPlus size={48} />
            </div>
            <h3>No notebooks yet</h3>
            <p>Create your first notebook to begin storing and analyzing notes with AI.</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              <span>Create Notebook</span>
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
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Notebook</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="nb-title">Notebook Title</label>
                <input
                  id="nb-title"
                  type="text"
                  placeholder="e.g. Computer Networks, Biology 101"
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
                  onClick={() => setShowModal(false)}
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
