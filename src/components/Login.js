import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login - Módulo de Autenticación
 * Credenciales: ID 0001 / Constraseña123
 */
function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmployeeNumberChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setEmployeeNumber(value);
      setError('');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(employeeNumber, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <h1>MaquinadosRBS</h1>
          <p>Sistema de Calidad</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Acceso a Calidad</h2>
          
          <div className="form-group">
            <label htmlFor="employeeNumber">Número de Empleado</label>
            <input
              type="text"
              id="employeeNumber"
              value={employeeNumber}
              onChange={handleEmployeeNumberChange}
              placeholder="Ingresa tu número de empleado"
            />
            <span className="field-hint">Solo valores numéricos</span>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
