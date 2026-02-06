import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NotFound - Página 404
 */
function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-logo">
          <h1>MaquinadosRBS</h1>
        </div>

        <div className="error-code">
          <span>404</span>
        </div>

        <div className="error-message">
          <h2>Página no encontrada</h2>
          <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
        </div>

        <div className="error-actions">
          <Link to="/" className="home-button">Volver al Inicio</Link>
          <Link to="/login" className="login-button">Ir al Login</Link>
        </div>

        <div className="error-help">
          <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
