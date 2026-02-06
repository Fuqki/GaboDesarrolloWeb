import React, { useState } from 'react';

/**
 * UserProfile - Perfil del Empleado
 */
function UserProfile({ user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu(!showMenu);

  const handleLogout = () => {
    setShowMenu(false);
    onLogout();
  };

  return (
    <div className="user-profile">
      <button className="profile-button" onClick={toggleMenu}>
        <div className="profile-photo">
          {user?.photo ? (
            <img src={user.photo} alt={`Foto de ${user.name}`} />
          ) : (
            <div className="profile-photo-placeholder">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <span className="profile-name">{user?.name || 'Usuario'}</span>
      </button>

      {showMenu && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <p className="employee-number">No. Empleado: {user?.employeeNumber}</p>
            <p className="department">Departamento: {user?.department}</p>
          </div>
          <div className="profile-menu-actions">
            <button className="logout-button" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
