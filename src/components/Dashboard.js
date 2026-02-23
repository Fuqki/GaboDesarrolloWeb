import React, { useState, useEffect } from 'react';
import { useRevisions } from '../context/RevisionsContext';
import RevisionsTable from './RevisionsTable';
import NewEntryForm from './NewEntryForm';
import PieceDetailModal from './PieceDetailModal';

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
        <button className="new-entry-button" onClick={() => setShowNewEntryForm(true)}>
          + Nueva Revisión
        </button>
      </div>

      <div className="dashboard-tools">
        <div className="sort-controls">
          <label>Ordenar por:</label>
          <select value={sortConfig.field} onChange={(e) => handleSortChange(e.target.value)}>
            <option value="fechaRevision">Fecha de Revisado</option>
            <option value="fechaSalida">Fecha de Salida</option>
            <option value="numeroPieza">Número de Pieza</option>
            <option value="fabrica">Fábrica</option>
          </select>
          <button className="sort-direction-button" onClick={() => handleSortChange(sortConfig.field)}>
            {sortConfig.direction === 'asc' ? '↑ Ascendente' : '↓ Descendente'}
          </button>
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
