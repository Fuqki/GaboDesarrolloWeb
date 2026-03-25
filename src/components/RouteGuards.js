import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Pantallas solo para invitados (p. ej. login): si ya hay sesión, ir al inicio */
export function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Rutas reservadas a administradores (rol en JWT + perfil).
 * El API ya valida con requireAdmin; esto evita mostrar UI admin a usuarios calidad.
 */
export function AdminRoute({ children }) {
  const { loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace state={{ from: location, forbidden: 'admin' }} />;
  }

  return children;
}
