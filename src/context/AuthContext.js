import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginAPI, logoutAPI, getProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      getProfile()
        .then((profile) => {
          setUser(profile);
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
      setUser(data.user);
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

  const value = { user, isAuthenticated, loading, login, logout };

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
