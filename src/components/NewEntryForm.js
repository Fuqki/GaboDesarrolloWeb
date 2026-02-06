import React, { useState } from 'react';

/**
 * NewEntryForm - Formulario de Nueva Entrada
 */
function NewEntryForm({ onClose }) {
  const [formData, setFormData] = useState({
    numeroPieza: '',
    plano: '',
    fabrica: '',
    numOperaciones: '',
    operadores: '',
    fechaRevision: '',
    fechaSalida: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const factories = ['Amphenol', 'Magnetics', 'Ichor'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.numeroPieza.trim()) newErrors.numeroPieza = 'El número de pieza es requerido';
    if (!formData.plano.trim()) newErrors.plano = 'El plano es requerido';
    if (!formData.fabrica) newErrors.fabrica = 'Selecciona una fábrica';
    if (!formData.numOperaciones || parseInt(formData.numOperaciones) < 1) {
      newErrors.numOperaciones = 'Ingresa un número válido de operaciones';
    }
    if (!formData.operadores.trim()) newErrors.operadores = 'Los operadores son requeridos';
    if (!formData.fechaRevision) newErrors.fechaRevision = 'La fecha de revisión es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    console.log('Datos a enviar:', formData);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content new-entry-form">
        <div className="modal-header">
          <h2>Nueva Revisión de Pieza</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-group">
            <label htmlFor="numeroPieza">Número de Pieza *</label>
            <input type="text" id="numeroPieza" name="numeroPieza" value={formData.numeroPieza} onChange={handleChange} placeholder="Ej: PZ-001234" disabled={isSubmitting} />
            {errors.numeroPieza && <span className="field-error">{errors.numeroPieza}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="plano">Plano *</label>
            <input type="text" id="plano" name="plano" value={formData.plano} onChange={handleChange} placeholder="Ej: PLN-2024-001" disabled={isSubmitting} />
            {errors.plano && <span className="field-error">{errors.plano}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="fabrica">Fábrica *</label>
            <select id="fabrica" name="fabrica" value={formData.fabrica} onChange={handleChange} disabled={isSubmitting}>
              <option value="">Selecciona una fábrica</option>
              {factories.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            {errors.fabrica && <span className="field-error">{errors.fabrica}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="numOperaciones">Número de Operaciones *</label>
            <input type="number" id="numOperaciones" name="numOperaciones" value={formData.numOperaciones} onChange={handleChange} min="1" placeholder="Ej: 5" disabled={isSubmitting} />
            {errors.numOperaciones && <span className="field-error">{errors.numOperaciones}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="operadores">Operadores *</label>
            <input type="text" id="operadores" name="operadores" value={formData.operadores} onChange={handleChange} placeholder="Nombres separados por coma" disabled={isSubmitting} />
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
            <button type="button" className="cancel-button" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Revisión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewEntryForm;
