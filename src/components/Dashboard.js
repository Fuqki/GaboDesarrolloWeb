import React, { useState, useEffect } from 'react';
import { useRevisions } from '../context/RevisionsContext';
import RevisionsTable from './RevisionsTable';
import NewEntryForm from './NewEntryForm';
import PieceDetailModal from './PieceDetailModal';
import Tooltip from './Tooltip';

function Dashboard() {
  const { fetchRevisions } = useRevisions();
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    field: 'fechaRevision',
    direction: 'desc'
  });

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  const handleSortChange = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleNewEntryClose = () => {
    setShowNewEntryForm(false);
    fetchRevisions();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Panel de Revisiones</h1>
        <Tooltip text="Registrar una nueva revisión de pieza">
          <button className="new-entry-button" onClick={() => setShowNewEntryForm(true)}>
            + Nueva Revisión
          </button>
        </Tooltip>
      </div>

      <div className="dashboard-tools">
        <div className="sort-controls">
          <label>Ordenar por:</label>
          <Tooltip text="Selecciona el criterio para ordenar la tabla">
            <select value={sortConfig.field} onChange={(e) => handleSortChange(e.target.value)}>
              <option value="fechaRevision">Fecha de Revisado</option>
              <option value="fechaSalida">Fecha de Salida</option>
              <option value="numeroPieza">Número de Pieza</option>
              <option value="fabrica">Fábrica</option>
              <option value="piezasTotales">Piezas totales</option>
            </select>
          </Tooltip>
          <Tooltip text="Cambia entre orden ascendente y descendente">
            <button className="sort-direction-button" onClick={() => handleSortChange(sortConfig.field)}>
              {sortConfig.direction === 'asc' ? '↑ Ascendente' : '↓ Descendente'}
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="dashboard-content">
        <RevisionsTable sortConfig={sortConfig} onPieceSelect={setSelectedPiece} />
      </div>

      {showNewEntryForm && <NewEntryForm onClose={handleNewEntryClose} />}
      {selectedPiece && (
        <PieceDetailModal
          piece={selectedPiece}
          onClose={() => setSelectedPiece(null)}
          onInspectionSaved={fetchRevisions}
        />
      )}
    </div>
  );
}

export default Dashboard;
