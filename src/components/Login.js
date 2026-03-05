import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Tooltip from './Tooltip';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(employeeNumber, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
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
            <Tooltip text="Usa tu número de empleado de Calidad">
              <input
                type="text"
                id="employeeNumber"
                value={employeeNumber}
                onChange={handleEmployeeNumberChange}
                placeholder="Ingresa tu número de empleado"
                disabled={isLoading}
              />
            </Tooltip>
            <span className="field-hint">Solo valores numéricos</span>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <Tooltip text="Contraseña asignada para acceso al sistema">
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Ingresa tu contraseña"
                disabled={isLoading}
              />
            </Tooltip>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <Tooltip text="Inicia sesión y abre el panel principal">
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </Tooltip>
        </form>
      </div>
    </div>
  );
}

export default Login;
