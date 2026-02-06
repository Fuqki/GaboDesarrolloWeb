import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

// Usuario de prueba
const TEST_USER = {
  employeeNumber: '0001',
  password: 'Constraseña123',
  name: 'Usuario de Calidad',
  department: 'Calidad'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función de login con validación básica
  const login = (employeeNumber, password) => {
    // Validar que los campos no estén vacíos
    if (!employeeNumber || !employeeNumber.trim()) {
      return { success: false, error: 'El número de empleado es requerido' };
    }

    if (!password || !password.trim()) {
      return { success: false, error: 'La contraseña es requerida' };
    }

    // Validar que el número de empleado sea numérico
    if (!/^\d+$/.test(employeeNumber)) {
      return { success: false, error: 'El número de empleado debe ser numérico' };
    }

    // Validar credenciales contra el usuario de prueba
    if (employeeNumber !== TEST_USER.employeeNumber) {
      return { success: false, error: 'Número de empleado incorrecto' };
    }

    if (password !== TEST_USER.password) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    // Login exitoso
    setUser({
      employeeNumber: TEST_USER.employeeNumber,
      name: TEST_USER.name,
      photo: null,
      department: TEST_USER.department
    });
    setIsAuthenticated(true);
    
    return { success: true };
  };

  // Función de logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
