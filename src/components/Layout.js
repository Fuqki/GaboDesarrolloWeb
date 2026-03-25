import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Layout - Estructura principal
 * Header + Sidebar + Contenido
 */
function Layout() {
  const { isAuthenticated, loading, refreshUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      refreshUser();
    }
  }, [isAuthenticated, loading, refreshUser]);

  if (loading) {
    return <div className="loading-screen"><p>Cargando...</p></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
