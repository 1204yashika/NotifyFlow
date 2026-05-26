import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '../components/layout/AuthLayout';
import AppLayout from '../components/layout/AppLayout';

// lazy load all pages
const LoginPage      = lazy(() => import('../pages/LoginPage'));
const RegisterPage   = lazy(() => import('../pages/RegisterPage'));
const DashboardPage  = lazy(() => import('../pages/DashboardPage'));
const WorkspacePage  = lazy(() => import('../pages/WorkspacePage'));
const MyTasksPage    = lazy(() => import('../pages/MyTaskPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const NotFoundPage   = lazy(() => import('../pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
              <Route path="/my-tasks" element={<MyTasksPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}