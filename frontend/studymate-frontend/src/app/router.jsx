import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore';
import LoginPage from '../features/auth/components/LoginPage';
import SignupPage from '../features/auth/components/SignupPage';
import DashboardPage from '../features/notebooks/components/DashboardPage';
import NotebookPage from '../features/notes/components/NotebookPage';

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notebooks/:id',
    element: (
      <ProtectedRoute>
        <NotebookPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
