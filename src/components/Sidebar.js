import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useRevisions } from '../context/RevisionsContext';
import { useAuth } from '../context/AuthContext';
import Tooltip from './Tooltip';

function Sidebar() {
  const { isAdmin } = useAuth();
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
        {isAdmin && (
          <>
            <Tooltip text="Gestionar usuarios del sistema">
              <NavLink
                to="/admin/usuarios"
                className={({ isActive }) =>
                  isActive ? 'admin-sidebar-link active' : 'admin-sidebar-link'
                }
              >
                Usuarios
              </NavLink>
            </Tooltip>
            <Tooltip text="Solicitudes de empleados que no pueden acceder">
              <NavLink
                to="/admin/solicitudes-acceso"
                className={({ isActive }) =>
                  isActive ? 'admin-sidebar-link active' : 'admin-sidebar-link'
                }
              >
                Solicitudes de acceso
              </NavLink>
            </Tooltip>
          </>
        )}
        <Tooltip text="Preguntas frecuentes y guía de uso">
          <NavLink
            to="/ayuda"
            className={({ isActive }) =>
              isActive ? 'faq-sidebar-link active' : 'faq-sidebar-link'
            }
          >
            Ayuda / FAQ
          </NavLink>
        </Tooltip>
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
