import React from 'react';

/**
 * PieceDetailModal - Detalle de Pieza
 */
function PieceDetailModal({ piece, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content piece-detail-modal">
        <div className="modal-header">
          <h2>Detalle de Pieza</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="piece-detail-content">
          <section className="detail-section">
            <h3>Información General</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Número de Pieza</label>
                <span>{piece.numeroPieza}</span>
              </div>
              <div className="detail-item">
                <label>Plano</label>
                <span>{piece.plano}</span>
              </div>
              <div className="detail-item">
                <label>Fábrica</label>
                <span>{piece.fabrica}</span>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <h3>Operaciones</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Número de Operaciones</label>
                <span>{piece.numOperaciones}</span>
              </div>
              <div className="detail-item">
                <label>Operadores</label>
                <span>{piece.operadores}</span>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <h3>Fechas</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Fecha de Revisión</label>
                <span>{piece.fechaRevision}</span>
              </div>
              <div className="detail-item">
                <label>Fecha de Salida</label>
                <span>{piece.fechaSalida || 'Pendiente'}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button className="close-detail-button" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default PieceDetailModal;
