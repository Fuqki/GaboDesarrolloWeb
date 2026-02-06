import React, { useState } from 'react';
import SearchResults from './SearchResults';

/**
 * SearchBar - Buscador Inteligente
 * Búsqueda por número de pieza
 */
function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setError('');
    if (!value.trim()) {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Ingresa un número de pieza para buscar');
      return;
    }

    // Datos de prueba
    const mockResults = [
      { id: 1, pieceNumber: searchQuery, plane: 'PLN-001', factory: 'Amphenol' },
      { id: 2, pieceNumber: searchQuery + '-A', plane: 'PLN-002', factory: 'Magnetics' },
    ];

    setSearchResults(mockResults);
    setShowResults(true);
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  return (
    <div className="search-bar-container">
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por número de pieza..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button type="submit" className="search-button">
          Buscar
        </button>
      </form>

      {error && <div className="search-error">{error}</div>}

      {showResults && (
        <SearchResults 
          results={searchResults} 
          onClose={handleCloseResults}
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
}

export default SearchBar;
