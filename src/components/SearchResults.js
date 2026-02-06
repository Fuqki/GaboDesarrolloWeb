import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SearchResults - Resultados de búsqueda
 */
function SearchResults({ results, onClose, searchQuery }) {
  return (
    <div className="search-results-overlay">
      <div className="search-results-popup">
        <div className="search-results-header">
          <h3>Resultados para: "{searchQuery}"</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="search-results-content">
          {results.length > 0 ? (
            <ul className="results-list">
              {results.map((result) => (
                <li key={result.id} className="result-item">
                  <Link to={`/pieza/${result.pieceNumber}`} onClick={onClose}>
                    <div className="result-info">
                      <span className="piece-number">Pieza: {result.pieceNumber}</span>
                      <span className="piece-plane">Plano: {result.plane}</span>
                      <span className="piece-factory">Fábrica: {result.factory}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">
              <p>No se encontraron resultados para "{searchQuery}"</p>
            </div>
          )}
        </div>

        <div className="search-results-footer">
          <button onClick={onClose} className="close-results-button">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default SearchResults;
