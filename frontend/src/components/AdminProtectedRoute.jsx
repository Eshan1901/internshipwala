import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';

export default function AdminProtectedRoute({ children }) {
  const { isAdminAuthenticated, loading } = useAdminAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '6rem' }}><LoadingSpinner /></div>;
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}
