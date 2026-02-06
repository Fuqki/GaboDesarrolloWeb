import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PieceDetailModal from './PieceDetailModal';

/**
 * ClientView - Vista por Cliente
 */
const clientData = {
  amphenol: {
    name: 'Amphenol',
    description: 'Información del cliente Amphenol',
    revisions: [
      { id: 1, numeroPieza: 'AMP-001', plano: 'PLN-AMP-001', fabrica: 'Amphenol', numOperaciones: 4, operadores: 'Juan Pérez', fechaRevision: '2026-02-04', fechaSalida: '2026-02-05' },
      { id: 2, numeroPieza: 'AMP-002', plano: 'PLN-AMP-002', fabrica: 'Amphenol', numOperaciones: 6, operadores: 'María García', fechaRevision: '2026-02-03', fechaSalida: '2026-02-04' },
    ]
  },
  magnetics: {
    name: 'Magnetics',
    description: 'Información del cliente Magnetics',
    revisions: [
      { id: 1, numeroPieza: 'MAG-001', plano: 'PLN-MAG-001', fabrica: 'Magnetics', numOperaciones: 3, operadores: 'Carlos López', fechaRevision: '2026-02-02', fechaSalida: '2026-02-03' },
    ]
  },
  ichor: {
    name: 'Ichor',
    description: 'Información del cliente Ichor',
    revisions: [
      { id: 1, numeroPieza: 'ICH-001', plano: 'PLN-ICH-001', fabrica: 'Ichor', numOperaciones: 5, operadores: 'Ana Martínez', fechaRevision: '2026-02-01', fechaSalida: '2026-02-02' },
    ]
  }
};

function ClientView() {
  const { clientId } = useParams();
  const [selectedPiece, setSelectedPiece] = useState(null);
  const client = clientData[clientId];

  if (!client) {
    return (
      <div className="client-view error">
        <h2>Cliente no encontrado</h2>
        <p>El cliente "{clientId}" no existe en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="client-view">
      <div className="client-header">
        <h1>Vista de Cliente: {client.name}</h1>
        <p className="client-description">{client.description}</p>
      </div>

      <section className="client-info-section">
        <h2>Información del Cliente</h2>
        <div className="client-info-details">
          <div className="info-item"><label>Nombre:</label><span>{client.name}</span></div>
          <div className="info-item"><label>Total de Piezas:</label><span>{client.revisions.length}</span></div>
        </div>
      </section>

      <section className="client-revisions-section">
        <h2>Revisiones de {client.name}</h2>
        <div className="client-table-container">
          <table className="client-revisions-table">
            <thead>
              <tr>
                <th>Número de Pieza</th>
                <th>Plano</th>
                <th>No. Operaciones</th>
                <th>Operadores</th>
                <th>Fecha Revisado</th>
                <th>Fecha Salida</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {client.revisions.map((revision) => (
                <tr key={revision.id}>
                  <td>{revision.numeroPieza}</td>
                  <td>{revision.plano}</td>
                  <td>{revision.numOperaciones}</td>
                  <td>{revision.operadores}</td>
                  <td>{revision.fechaRevision}</td>
                  <td>{revision.fechaSalida}</td>
                  <td>
                    <button className="view-detail-button" onClick={() => setSelectedPiece(revision)}>
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {client.revisions.length === 0 && (
            <div className="no-data-message"><p>No hay revisiones registradas para este cliente</p></div>
          )}
        </div>
      </section>

      {selectedPiece && <PieceDetailModal piece={selectedPiece} onClose={() => setSelectedPiece(null)} />}
    </div>
  );
}

export default ClientView;
