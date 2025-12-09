import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AreaDetailPage } from './pages/AreaDetailPage';
import { Layout } from './components/Layout';
import { UserSession } from './types';

// Mock Auth Protection Wrapper
const ProtectedRoute = ({ 
  user, 
  children 
}: { 
  user: UserSession | null, 
  children?: React.ReactNode 
}) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session on load
    const savedUser = localStorage.getItem('magenta_xp_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('magenta_xp_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (session: UserSession) => {
    setUser(session);
    localStorage.setItem('magenta_xp_user', JSON.stringify(session));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('magenta_xp_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-magenta-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
          } 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/area/:id" 
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <AreaDetailPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;