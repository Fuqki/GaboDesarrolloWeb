import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import UserProfile from './UserProfile';

/**
 * Header - Barra Superior
 * Logo + Buscador + Perfil
 */
function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-logo">
        <Link to="/">
          <h1>MaquinadosRBS</h1>
        </Link>
      </div>

      <div className="header-search">
        <SearchBar />
      </div>

      <div className="header-profile">
        <UserProfile user={user} onLogout={logout} />
      </div>
    </header>
  );
}

export default Header;
