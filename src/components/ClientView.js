import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRevisions } from '../context/RevisionsContext';
import PieceDetailModal from './PieceDetailModal';

function ClientView() {
  const { clientId } = useParams();
  const { fetchClientDetail } = useRevisions();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPiece, setSelectedPiece] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchClientDetail(clientId).then((data) => {
      if (!cancelled) {
        setClient(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [clientId, fetchClientDetail]);

  if (loading) {
    return <div className="client-view"><p>Cargando...</p></div>;
  }

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
                <th>Inspección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {client.revisions.map((revision) => (
                <tr key={revision.id}>
                  <td>{revision.numero_pieza}</td>
                  <td>{revision.plano}</td>
                  <td>{revision.num_operaciones}</td>
                  <td>{revision.operadores}</td>
                  <td>{revision.fecha_revision}</td>
                  <td>{revision.fecha_salida || 'Pendiente'}</td>
                  <td>
                    <span className={`inspection-badge ${revision.tiene_inspeccion ? (revision.estado_inspeccion === 'aprobada' ? 'badge-approved' : 'badge-rejected') : 'badge-pending'}`}>
                      {revision.tiene_inspeccion
                        ? (revision.estado_inspeccion === 'aprobada' ? 'Aprobada' : 'Rechazada')
                        : 'Sin inspección'}
                    </span>
                  </td>
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

      {selectedPiece && (
        <PieceDetailModal
          piece={selectedPiece}
          onClose={() => setSelectedPiece(null)}
          onInspectionSaved={() => {
            fetchClientDetail(clientId).then(setClient);
          }}
        />
      )}
    </div>
  );
}

export default ClientView;
