import React, { useState, useEffect } from 'react';
import { requestAccessHelp } from '../services/api';

function RequestAccessModal({ initialEmployeeNumber, onClose }) {
  const [employeeNumber, setEmployeeNumber] = useState(initialEmployeeNumber || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setEmployeeNumber(initialEmployeeNumber || '');
  }, [initialEmployeeNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setFeedback(null);
    setSubmitting(true);
    try {
      const data = await requestAccessHelp({
        employee_number: employeeNumber.trim(),
        message: message.trim() || undefined,
      });
      setFeedback(data.message || 'Solicitud enviada.');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="request-access-title">
      <div className="modal-content new-entry-form request-access-modal">
        <div className="modal-header">
          <h2 id="request-access-title">Solicitar ayuda al administrador</h2>
          <button type="button" className="close-button" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {feedback ? (
          <div className="entry-form">
            <p className="request-access-success">{feedback}</p>
            <p className="field-hint">
              Un administrador verá tu número de empleado y podrá restablecer tu contraseña desde el panel
              de administración.
            </p>
            <div className="form-actions">
              <button type="button" className="submit-button" onClick={onClose}>
                Entendido
              </button>
            </div>
          </div>
        ) : (
          <form className="entry-form" onSubmit={handleSubmit}>
            <p className="field-hint request-access-intro">
              Si olvidaste tu contraseña o no puedes entrar, envía una notificación. Debes usar el mismo
              número de empleado que tienes registrado en el sistema.
            </p>

            <div className="form-group">
              <label htmlFor="req-emp">Número de empleado *</label>
              <input
                id="req-emp"
                type="text"
                inputMode="numeric"
                value={employeeNumber}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '' || /^\d+$/.test(v)) setEmployeeNumber(v);
                }}
                placeholder="Ej: 0001"
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="req-msg">Mensaje (opcional)</label>
              <textarea
                id="req-msg"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ej: No recuerdo mi contraseña desde el cambio de turno…"
                maxLength={500}
                disabled={submitting}
              />
            </div>

            {submitError && <div className="form-error">{submitError}</div>}

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={onClose} disabled={submitting}>
                Cancelar
              </button>
              <button type="submit" className="submit-button" disabled={submitting}>
                {submitting ? 'Enviando…' : 'Enviar notificación'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RequestAccessModal;
