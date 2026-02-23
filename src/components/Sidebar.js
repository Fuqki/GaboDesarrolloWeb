import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useRevisions } from '../context/RevisionsContext';

function Sidebar() {
  const { clients, fetchClients } = useRevisions();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Clientes / Fábricas</h2>
      </div>

      <nav className="sidebar-nav">
        <ul className="client-list">
          {clients.map((client) => (
            <li key={client.id} className="client-item">
              <NavLink
                to={`/cliente/${client.slug}`}
                className={({ isActive }) =>
                  isActive ? 'client-link active' : 'client-link'
                }
              >
                {client.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/" className="home-link">
          Volver a Inicio
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
