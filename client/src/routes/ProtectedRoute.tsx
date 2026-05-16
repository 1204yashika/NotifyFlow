import { Navigate, Outlet } from 'react-router-dom';
import { tokenStorage } from '../utils/tokenStorage';

export default function ProtectedRoute() {
  const token = tokenStorage.getAccess();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}