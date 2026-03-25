import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsersList, createUserAdmin, resetUserPassword } from '../services/api';

function AdminUsers() {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    setError('');
    getUsersList()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role === 'admin') loadUsers();
  }, [user?.role]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <h1>Administración de usuarios</h1>
        <button type="button" className="new-entry-button" onClick={() => setShowNewModal(true)}>
          + Nuevo usuario
        </button>
      </div>

      <p className="admin-users-intro">
        Registra empleados de calidad, consulta sus datos y restablece contraseñas cuando sea necesario.
      </p>

      {error && <div className="error-message" role="alert">{error}</div>}

      {loading ? (
        <p className="no-data-message">Cargando usuarios…</p>
      ) : (
        <div className="admin-users-table-wrap">
          <table className="revisions-table admin-users-table">
            <thead>
              <tr>
                <th>No. empleado</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Alta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.employee_number}</td>
                  <td>{u.name}</td>
                  <td>
                    <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-calidad'}`}>
                      {u.role === 'admin' ? 'Administrador' : 'Calidad'}
                    </span>
                  </td>
                  <td>{u.created_at ? String(u.created_at).slice(0, 10) : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="view-detail-button"
                      onClick={() => setResetTarget(u)}
                    >
                      Restablecer contraseña
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNewModal && (
        <NewUserModal
          onClose={() => setShowNewModal(false)}
          onSaved={() => {
            setShowNewModal(false);
            loadUsers();
          }}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onSaved={() => {
            setResetTarget(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
}

function NewUserModal({ onClose, onSaved }) {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('calidad');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await createUserAdmin({
        employee_number: employeeNumber.trim(),
        name: name.trim(),
        password,
        role,
      });
      onSaved();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content new-entry-form">
        <div className="modal-header">
          <h2>Nuevo usuario</h2>
          <button type="button" className="close-button" onClick={onClose}>✕</button>
        </div>
        <form className="entry-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nu-emp">Número de empleado *</label>
            <input
              id="nu-emp"
              value={employeeNumber}
              onChange={(e) => /^\d*$/.test(e.target.value) && setEmployeeNumber(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="nu-name">Nombre completo *</label>
            <input
              id="nu-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="nu-pass">Contraseña inicial * (mín. 6 caracteres)</label>
            <input
              id="nu-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="nu-role">Rol</label>
            <select id="nu-role" value={role} onChange={(e) => setRole(e.target.value)} disabled={submitting}>
              <option value="calidad">Calidad</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {submitError && <div className="form-error">{submitError}</div>}
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose} disabled={submitting}>Cancelar</button>
            <button type="submit" className="submit-button" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({ user: targetUser, onClose, onSaved }) {
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await resetUserPassword(targetUser.id, password);
      onSaved();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content new-entry-form">
        <div className="modal-header">
          <h2>Restablecer contraseña</h2>
          <button type="button" className="close-button" onClick={onClose}>✕</button>
        </div>
        <form className="entry-form" onSubmit={handleSubmit}>
          <p className="field-hint">
            Usuario: <strong>{targetUser.name}</strong> ({targetUser.employee_number})
          </p>
          <div className="form-group">
            <label htmlFor="rp-pass">Nueva contraseña * (mín. 6 caracteres)</label>
            <input
              id="rp-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={submitting}
            />
          </div>
          {submitError && <div className="form-error">{submitError}</div>}
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose} disabled={submitting}>Cancelar</button>
            <button type="submit" className="submit-button" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUsers;
