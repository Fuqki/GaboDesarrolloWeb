import React from 'react';

/**
 * RevisionsTable - Tabla de Revisiones
 */
const mockRevisions = [
  {
    id: 1,
    numeroPieza: 'PZ-001234',
    plano: 'PLN-2024-001',
    fabrica: 'Amphenol',
    numOperaciones: 5,
    operadores: 'Juan Pérez, María García',
    fechaRevision: '2026-02-04',
    fechaSalida: '2026-02-05'
  },
  {
    id: 2,
    numeroPieza: 'PZ-001235',
    plano: 'PLN-2024-002',
    fabrica: 'Magnetics',
    numOperaciones: 3,
    operadores: 'Carlos López',
    fechaRevision: '2026-02-03',
    fechaSalida: '2026-02-04'
  },
  {
    id: 3,
    numeroPieza: 'PZ-001236',
    plano: 'PLN-2024-003',
    fabrica: 'Ichor',
    numOperaciones: 7,
    operadores: 'Ana Martínez, Roberto Sánchez',
    fechaRevision: '2026-02-02',
    fechaSalida: '2026-02-03'
  },
];

function RevisionsTable({ sortConfig, onPieceSelect }) {
  const sortedRevisions = [...mockRevisions].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];
    return sortConfig.direction === 'asc' 
      ? (aValue > bValue ? 1 : -1)
      : (aValue < bValue ? 1 : -1);
  });

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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedRevisions.map((revision) => (
            <tr key={revision.id}>
              <td>{revision.numeroPieza}</td>
              <td>{revision.plano}</td>
              <td>{revision.fabrica}</td>
              <td>{revision.numOperaciones}</td>
              <td>{revision.operadores}</td>
              <td>{revision.fechaRevision}</td>
              <td>{revision.fechaSalida}</td>
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
