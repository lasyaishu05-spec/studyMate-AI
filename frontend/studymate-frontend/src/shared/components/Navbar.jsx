import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../features/auth/authStore';
import { BookOpen, LogOut, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand-logo">
          <div className="logo-icon">
            <Sparkles size={20} />
          </div>
          <span>StudyMate <strong>AI</strong></span>
        </Link>

        <div className="nav-actions">
          {user && (
            <span className="user-greeting">
              Welcome, <strong>{user.name || user.email}</strong>
            </span>
          )}
          <Link to="/" className="nav-link">
            <BookOpen size={18} />
            <span>Notebooks</span>
          </Link>
          <button onClick={handleLogout} className="btn-secondary logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
