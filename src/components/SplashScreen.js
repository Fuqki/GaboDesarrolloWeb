import React from 'react';

/**
 * SplashScreen - Animación de Entrada
 * Muestra el logo de MaquinadosRBS durante 3 segundos
 */
function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <h1>MaquinadosRBS</h1>
        </div>
        <div className="splash-loader">
          <p>Cargando...</p>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
