import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useRevisions } from '../context/RevisionsContext';
import Tooltip from './Tooltip';

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
              <Tooltip text={`Ver piezas y revisiones de ${client.name}`} position="right">
                <NavLink
                  to={`/cliente/${client.slug}`}
                  className={({ isActive }) =>
                    isActive ? 'client-link active' : 'client-link'
                  }
                >
                  {client.name}
                </NavLink>
              </Tooltip>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <Tooltip text="Regresar al dashboard principal">
          <NavLink to="/" className="home-link">
            Volver a Inicio
          </NavLink>
        </Tooltip>
      </div>
    </aside>
  );
}

export default Sidebar;
