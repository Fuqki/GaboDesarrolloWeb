import React, { useState } from 'react';
import { useRevisions } from '../context/RevisionsContext';
import { useAuth } from '../context/AuthContext';

function QualityInspectionForm({ piece, onClose, onSaved }) {
  const { addInspection } = useRevisions();
  const { user } = useAuth();

  const numOps = piece.num_operaciones || 1;
  const [operations, setOperations] = useState(
    Array.from({ length: numOps }, (_, i) => ({
      num_operacion: i + 1,
      medida_nominal: '',
      tolerancia: '',
      medida_real: '',
      aprobada: false,
    }))
  );
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleOperationChange = (index, field, value) => {
    setOperations(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: field === 'aprobada' ? value : value };
      return updated;
    });
  };

  const validateForm = () => {
    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      if (!op.medida_nominal.trim() || !op.tolerancia.trim() || !op.medida_real.trim()) {
        setError(`Completa todos los campos de la operación ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await addInspection(piece.id, { observaciones, operations });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content quality-form-modal">
        <div className="modal-header">
          <h2>Hoja de Inspección de Calidad</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="quality-form">
          <div className="quality-form-info">
            <div className="info-row">
              <span><strong>Pieza:</strong> {piece.numero_pieza}</span>
              <span><strong>Plano:</strong> {piece.plano}</span>
              <span><strong>Inspector:</strong> {user?.name || 'N/A'}</span>
            </div>
          </div>

          <div className="quality-table-wrapper">
            <table className="quality-operations-table">
              <thead>
                <tr>
                  <th>Op.</th>
                  <th>Medida Nominal</th>
                  <th>Tolerancia</th>
                  <th>Medida Real</th>
                  <th>Aprobada</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op, index) => (
                  <tr key={op.num_operacion}>
                    <td className="op-number">{op.num_operacion}</td>
                    <td>
                      <input
                        type="text"
                        value={op.medida_nominal}
                        onChange={(e) => handleOperationChange(index, 'medida_nominal', e.target.value)}
                        placeholder="Ej: 25.00 mm"
                        disabled={isSubmitting}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={op.tolerancia}
                        onChange={(e) => handleOperationChange(index, 'tolerancia', e.target.value)}
                        placeholder="Ej: ±0.05"
                        disabled={isSubmitting}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={op.medida_real}
                        onChange={(e) => handleOperationChange(index, 'medida_real', e.target.value)}
                        placeholder="Ej: 25.02 mm"
                        disabled={isSubmitting}
                      />
                    </td>
                    <td className="op-checkbox">
                      <input
                        type="checkbox"
                        checked={op.aprobada}
                        onChange={(e) => handleOperationChange(index, 'aprobada', e.target.checked)}
                        disabled={isSubmitting}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones Generales</label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas adicionales sobre la inspección..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Inspección'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QualityInspectionForm;
