import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/AuthContext';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import DreamInput from './components/DreamInput';
import DreamHistory from './components/DreamHistory';
import SharedDream from './components/SharedDream';
import AdminPanel from './components/AdminPanel';
import { isAdmin } from './lib/supabase';

const Dashboard: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Layout>
      <DreamInput onDreamSaved={() => setRefreshKey((k) => k + 1)} />
      <DreamHistory refreshKey={refreshKey} />
    </Layout>
  );
};

const App: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="bg-effects"><div className="stars" /></div>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/shared/:shareId" element={<SharedDream />} />

      <Route
        path="/"
        element={
          session ? <Navigate to="/dashboard" replace /> : (
            <div style={{ position: 'relative' }}>
              <div className="bg-effects"><div className="stars" /></div>
              <AuthForm />
            </div>
          )
        }
      />

      <Route
        path="/dashboard"
        element={session ? <Dashboard /> : <Navigate to="/" replace />}
      />

      <Route
        path="/admin"
        element={
          session && isAdmin(session.user.email) ? (
            <Layout>
              <AdminPanel />
            </Layout>
          ) : <Navigate to="/" replace />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
