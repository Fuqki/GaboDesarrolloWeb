import React from 'react';
import { useRevisions } from '../context/RevisionsContext';

function RevisionsTable({ sortConfig, onPieceSelect }) {
  const { revisions, loadingRevisions } = useRevisions();

  const sortedRevisions = [...revisions].sort((a, b) => {
    const fieldMap = {
      fechaRevision: 'fecha_revision',
      fechaSalida: 'fecha_salida',
      numeroPieza: 'numero_pieza',
      fabrica: 'fabrica',
    };
    const field = fieldMap[sortConfig.field] || sortConfig.field;
    const aValue = a[field] || '';
    const bValue = b[field] || '';
    return sortConfig.direction === 'asc'
      ? (aValue > bValue ? 1 : -1)
      : (aValue < bValue ? 1 : -1);
  });

  if (loadingRevisions) {
    return <div className="no-data-message"><p>Cargando revisiones...</p></div>;
  }

  return (
    <div className="revisions-table-container">
      <table className="revisions-table">
        <thead>
          <tr>
            <th>Número de Pieza</th>
            <th>Plano</th>
            <th>Fábrica</th>
            <th>No. Operaciones</th>
            <th>Operadores</th>
            <th>Fecha Revisado</th>
            <th>Fecha Salida</th>
            <th>Inspección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedRevisions.map((revision) => (
            <tr key={revision.id}>
              <td>{revision.numero_pieza}</td>
              <td>{revision.plano}</td>
              <td>{revision.fabrica}</td>
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
                <button className="view-detail-button" onClick={() => onPieceSelect(revision)}>
                  Ver Detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedRevisions.length === 0 && (
        <div className="no-data-message"><p>No hay revisiones registradas</p></div>
      )}
    </div>
  );
}

export default RevisionsTable;
