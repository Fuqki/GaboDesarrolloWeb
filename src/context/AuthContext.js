import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { loginAPI, logoutAPI, getProfile } from '../services/api';

const AuthContext = createContext(null);

function normalizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    photo_url: u.photo_url,
    photo: u.photo_url,
    employeeNumber: u.employee_number,
    role: u.role || 'calidad',
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      getProfile()
        .then((profile) => {
          setUser(normalizeUser(profile));
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /** Multisesión: otra pestaña cerró sesión, inició sesión o cambió el token */
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== 'auth_token' || e.storageArea !== localStorage) return;
      if (!e.newValue) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      getProfile()
        .then((profile) => {
          setUser(normalizeUser(profile));
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          setUser(null);
          setIsAuthenticated(false);
        });
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /** Token inválido o expirado en una petición autenticada */
  useEffect(() => {
    function onUnauthorized() {
      setUser(null);
      setIsAuthenticated(false);
    }
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const login = async (employeeNumber, password) => {
    if (!employeeNumber || !employeeNumber.trim()) {
      return { success: false, error: 'El número de empleado es requerido' };
    }
    if (!password || !password.trim()) {
      return { success: false, error: 'La contraseña es requerida' };
    }
    if (!/^\d+$/.test(employeeNumber)) {
      return { success: false, error: 'El número de empleado debe ser numérico' };
    }

    try {
      const data = await loginAPI(employeeNumber, password);
      setUser(normalizeUser(data.user));
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    logoutAPI();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(normalizeUser(profile));
    } catch {
      /* token inválido: no forzar logout aquí */
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshUser,
    /** Roles: admin | calidad (autenticación por tipo de usuario) */
    role: user?.role || null,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
