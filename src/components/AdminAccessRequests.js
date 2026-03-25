import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccessHelpRequests, resolveAccessHelpRequest } from '../services/api';

function AdminAccessRequests() {
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getAccessHelpRequests()
      .then(setRequests)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role === 'admin') load();
  }, [user?.role]);

  const handleResolve = async (id) => {
    try {
      await resolveAccessHelpRequest(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  const pending = requests.filter((r) => r.status === 'pendiente');

  return (
    <div className="admin-access-requests-page">
      <div className="admin-users-header">
        <h1>Solicitudes de acceso</h1>
        <Link to="/admin/usuarios" className="header-faq-link">
          Ir a usuarios
        </Link>
      </div>

      <p className="admin-users-intro">
        Los empleados de calidad pueden solicitar ayuda desde el inicio de sesión cuando no recuerdan su
        contraseña. Marca como atendida cuando hayas restablecido el acceso.
      </p>

      {error && <div className="error-message" role="alert">{error}</div>}

      {loading ? (
        <p className="no-data-message">Cargando…</p>
      ) : (
        <>
          <h2 className="access-requests-subtitle">
            Pendientes ({pending.length})
          </h2>
          <div className="admin-users-table-wrap">
            <table className="revisions-table admin-users-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>No. empleado</th>
                  <th>Nombre</th>
                  <th>Mensaje</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="faq-empty" style={{ textAlign: 'center' }}>
                      No hay solicitudes pendientes
                    </td>
                  </tr>
                ) : (
                  pending.map((r) => (
                    <tr key={r.id}>
                      <td>{r.created_at ? String(r.created_at).replace('T', ' ').slice(0, 16) : '—'}</td>
                      <td>{r.employee_number}</td>
                      <td>{r.user_name}</td>
                      <td>{r.message || '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="view-detail-button"
                          onClick={() => handleResolve(r.id)}
                        >
                          Marcar atendida
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <h2 className="access-requests-subtitle" style={{ marginTop: 28 }}>
            Historial reciente
          </h2>
          <div className="admin-users-table-wrap">
            <table className="revisions-table admin-users-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Empleado</th>
                  <th>Estado</th>
                  <th>Atendida</th>
                  <th>Por</th>
                </tr>
              </thead>
              <tbody>
                {requests
                  .filter((r) => r.status === 'atendida')
                  .slice(0, 25)
                  .map((r) => (
                    <tr key={r.id}>
                      <td>{r.created_at ? String(r.created_at).slice(0, 10) : '—'}</td>
                      <td>{r.employee_number} — {r.user_name}</td>
                      <td><span className="role-badge role-calidad">Atendida</span></td>
                      <td>{r.resolved_at ? String(r.resolved_at).slice(0, 16) : '—'}</td>
                      <td>{r.resolved_by_name || '—'}</td>
                    </tr>
                  ))}
                {requests.filter((r) => r.status === 'atendida').length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>
                      Sin historial
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminAccessRequests;
