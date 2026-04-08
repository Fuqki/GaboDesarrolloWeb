import React, { useState } from 'react';
import { useRevisions } from '../context/RevisionsContext';
import Tooltip from './Tooltip';
import { getOperatorForOperation } from '../utils/operators';

function RevisionsTable({ sortConfig, onPieceSelect }) {
  const { revisions, loadingRevisions } = useRevisions();
  const [selectedOperationByRevision, setSelectedOperationByRevision] = useState({});

  const getSelectedOperation = (revision) => {
    const selected = selectedOperationByRevision[revision.id];
    return selected || 1;
  };

  const handleOperationChange = (revisionId, operationNumber) => {
    setSelectedOperationByRevision((prev) => ({
      ...prev,
      [revisionId]: Number(operationNumber),
    }));
  };

  const sortedRevisions = [...revisions].sort((a, b) => {
    const fieldMap = {
      fechaRevision: 'fecha_revision',
      fechaSalida: 'fecha_salida',
      numeroPieza: 'numero_pieza',
      fabrica: 'fabrica',
      piezasTotales: 'piezas_totales',
    };
    const field = fieldMap[sortConfig.field] || sortConfig.field;
    const aRaw = a[field];
    const bRaw = b[field];
    const aValue = field === 'piezas_totales' ? Number(aRaw) || 0 : (aRaw ?? '');
    const bValue = field === 'piezas_totales' ? Number(bRaw) || 0 : (bRaw ?? '');
    if (field === 'piezas_totales') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
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
            <th>Piezas totales</th>
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
              <td>
                <Tooltip text="Selecciona una operación para ver su operador">
                  <select
                    className="operation-selector"
                    value={getSelectedOperation(revision)}
                    onChange={(e) => handleOperationChange(revision.id, e.target.value)}
                  >
                    {Array.from({ length: revision.num_operaciones }, (_, index) => {
                      const operationNumber = index + 1;
                      return (
                        <option key={operationNumber} value={operationNumber}>
                          Op. {operationNumber}
                        </option>
                      );
                    })}
                  </select>
                </Tooltip>
              </td>
              <td>{revision.piezas_totales ?? 1}</td>
              <td>
                {getOperatorForOperation(
                  revision.operadores,
                  revision.num_operaciones,
                  getSelectedOperation(revision)
                )}
              </td>
              <td>{revision.fecha_revision}</td>
              <td>{revision.fecha_salida || 'Pendiente'}</td>
              <td>
                <Tooltip text="Estado actual de la hoja de calidad">
                  <span className={`inspection-badge ${revision.tiene_inspeccion ? (revision.estado_inspeccion === 'aprobada' ? 'badge-approved' : 'badge-rejected') : 'badge-pending'}`}>
                    {revision.tiene_inspeccion
                      ? (revision.estado_inspeccion === 'aprobada' ? 'Aprobada' : 'Rechazada')
                      : 'Sin inspección'}
                  </span>
                </Tooltip>
              </td>
              <td>
                <Tooltip text="Abrir información completa de la pieza">
                  <button className="view-detail-button" onClick={() => onPieceSelect(revision)}>
                    Ver Detalle
                  </button>
                </Tooltip>
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
