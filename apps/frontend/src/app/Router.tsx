import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from '../components/pages/AuthPage';
import { useAuthStore } from '../stores';
import AppLayout from '../components/pages/AppLayout';
import NotFound from '../components/pages/NotFound';

const AppRouter: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/apsp" /> : <Navigate to="/auth" />}
      />
      <Route
        path="/auth"
        element={user ? <Navigate to="/app" /> : <AuthPage />}
      />
      <Route
        path="/app"
        element={user ? <AppLayout /> : <Navigate to="/auth" />}
      />
      <Route
        path="/app/:serverId"
        element={user ? <AppLayout /> : <Navigate to="/auth" />}
      />
      <Route
        path="/app/:serverId/:channelId"
        element={user ? <AppLayout /> : <Navigate to="/auth" />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
