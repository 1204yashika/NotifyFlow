import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectIsAuthenticated } from '../features/auth/authSlice';

export default function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}