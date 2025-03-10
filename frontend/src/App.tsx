import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAppDispatch } from './hooks/reduxHooks';
import { checkAuthStatus } from './features/auth/authSlice';

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check authentication status when app loads
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <Box as="main" minH="100vh" bg="gray.900" color="white">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="auth" element={<AuthPage />} />
          
          {/* Protected routes */}
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="project">
            <Route path="new" element={
              <ProtectedRoute>
                <ProjectPage />
              </ProtectedRoute>
            } />
            <Route path=":id" element={
              <ProtectedRoute>
                <ProjectPage />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* 404 route */}
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Box>
  );
};

export default App;