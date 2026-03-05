import React, { useState, useEffect } from 'react';
import { useRevisions } from '../context/RevisionsContext';
import Tooltip from './Tooltip';

function NewEntryForm({ onClose }) {
  const { addRevision, fetchClients, clients } = useRevisions();
  const [formData, setFormData] = useState({
    numeroPieza: '',
    plano: '',
    client_id: '',
    numOperaciones: '',
    operadores: '',
    fechaRevision: '',
    fechaSalida: ''
  });
  const [planoArchivo, setPlanoArchivo] = useState(null);
  const [operatorAssignments, setOperatorAssignments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'numOperaciones') {
      const count = Math.max(Number(value) || 0, 0);
      setOperatorAssignments((prev) =>
        Array.from({ length: count }, (_, index) => prev[index] || '')
      );
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOperatorAssignmentChange = (index, value) => {
    setOperatorAssignments((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (errors.operadores) {
      setErrors((prev) => ({ ...prev, operadores: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPlanoArchivo(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.numeroPieza.trim()) newErrors.numeroPieza = 'El número de pieza es requerido';
    if (!formData.plano.trim()) newErrors.plano = 'El plano es requerido';
    if (!formData.client_id) newErrors.client_id = 'Selecciona una fábrica';
    if (!formData.numOperaciones || parseInt(formData.numOperaciones) < 1) {
      newErrors.numOperaciones = 'Ingresa un número válido de operaciones';
    }
    if (operatorAssignments.length === 0 || operatorAssignments.some((name) => !name.trim())) {
      newErrors.operadores = 'Debes asignar un operador por cada operación';
    }
    if (!formData.fechaRevision) newErrors.fechaRevision = 'La fecha de revisión es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('numero_pieza', formData.numeroPieza);
      data.append('plano', formData.plano);
      data.append('client_id', formData.client_id);
      data.append('num_operaciones', formData.numOperaciones);
      data.append(
        'operadores',
        JSON.stringify(
          operatorAssignments.map((operador, index) => ({
            numOperacion: index + 1,
            operador: operador.trim(),
          }))
        )
      );
      data.append('fecha_revision', formData.fechaRevision);
      if (formData.fechaSalida) data.append('fecha_salida', formData.fechaSalida);
      if (planoArchivo) data.append('plano_archivo', planoArchivo);

      await addRevision(data);
      onClose();
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content new-entry-form">
        <div className="modal-header">
          <h2>Nueva Revisión de Pieza</h2>
          <Tooltip text="Cerrar formulario sin guardar">
            <button className="close-button" onClick={onClose}>✕</button>
          </Tooltip>
        </div>

        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-group">
            <label htmlFor="numeroPieza">Número de Pieza *</label>
            <input type="text" id="numeroPieza" name="numeroPieza" value={formData.numeroPieza} onChange={handleChange} placeholder="Ej: PZ-001234" disabled={isSubmitting} />
            {errors.numeroPieza && <span className="field-error">{errors.numeroPieza}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="plano">Plano (Identificador) *</label>
            <input type="text" id="plano" name="plano" value={formData.plano} onChange={handleChange} placeholder="Ej: PLN-2024-001" disabled={isSubmitting} />
            {errors.plano && <span className="field-error">{errors.plano}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="planoArchivo">Archivo del Plano (PDF o Imagen)</label>
            <Tooltip text="Sube PDF o imagen del plano técnico">
              <input type="file" id="planoArchivo" accept=".pdf,image/*" onChange={handleFileChange} disabled={isSubmitting} />
            </Tooltip>
            {planoArchivo && <span className="field-hint">Archivo: {planoArchivo.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="client_id">Fábrica *</label>
            <select id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} disabled={isSubmitting}>
              <option value="">Selecciona una fábrica</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.client_id && <span className="field-error">{errors.client_id}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="numOperaciones">Número de Operaciones *</label>
            <input type="number" id="numOperaciones" name="numOperaciones" value={formData.numOperaciones} onChange={handleChange} min="1" placeholder="Ej: 5" disabled={isSubmitting} />
            {errors.numOperaciones && <span className="field-error">{errors.numOperaciones}</span>}
          </div>

          <div className="form-group">
            <label>Operadores por operación *</label>
            {operatorAssignments.length > 0 ? (
              <div className="operator-assignments-grid">
                {operatorAssignments.map((operador, index) => (
                  <div key={`op-${index + 1}`} className="operator-assignment-item">
                    <label htmlFor={`operador-op-${index + 1}`}>Operación {index + 1}</label>
                    <input
                      type="text"
                      id={`operador-op-${index + 1}`}
                      value={operador}
                      onChange={(e) => handleOperatorAssignmentChange(index, e.target.value)}
                      placeholder={`Empleado operación ${index + 1}`}
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <span className="field-hint">Define primero el número de operaciones para asignar operadores.</span>
            )}
            {errors.operadores && <span className="field-error">{errors.operadores}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="fechaRevision">Fecha de Revisión *</label>
            <input type="date" id="fechaRevision" name="fechaRevision" value={formData.fechaRevision} onChange={handleChange} disabled={isSubmitting} />
            {errors.fechaRevision && <span className="field-error">{errors.fechaRevision}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="fechaSalida">Fecha de Salida</label>
            <input type="date" id="fechaSalida" name="fechaSalida" value={formData.fechaSalida} onChange={handleChange} disabled={isSubmitting} />
          </div>

          {errors.submit && <div className="form-error">{errors.submit}</div>}

          <div className="form-actions">
            <Tooltip text="Cancelar y volver al panel">
              <button type="button" className="cancel-button" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
            </Tooltip>
            <Tooltip text="Guardar revisión en la base de datos">
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Revisión'}
              </button>
            </Tooltip>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewEntryForm;
