import React, { createContext, useState, useContext, useCallback } from 'react';
import { getRevisions, getRevisionById, getClientBySlug, getClients, createRevision, createInspection } from '../services/api';

const RevisionsContext = createContext(null);

export function RevisionsProvider({ children }) {
  const [revisions, setRevisions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  const fetchRevisions = useCallback(async () => {
    setLoadingRevisions(true);
    try {
      const data = await getRevisions();
      setRevisions(data);
    } catch (err) {
      console.error('Error al cargar revisiones:', err);
    } finally {
      setLoadingRevisions(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const fetchClientDetail = useCallback(async (slug) => {
    try {
      return await getClientBySlug(slug);
    } catch (err) {
      console.error('Error al cargar detalle de cliente:', err);
      return null;
    }
  }, []);

  const fetchRevisionDetail = useCallback(async (id) => {
    try {
      return await getRevisionById(id);
    } catch (err) {
      console.error('Error al cargar detalle de revisión:', err);
      return null;
    }
  }, []);

  const addRevision = useCallback(async (formData) => {
    const newRevision = await createRevision(formData);
    await fetchRevisions();
    return newRevision;
  }, [fetchRevisions]);

  const addInspection = useCallback(async (revisionId, inspectionData) => {
    const newInspection = await createInspection(revisionId, inspectionData);
    await fetchRevisions();
    return newInspection;
  }, [fetchRevisions]);

  const value = {
    revisions,
    clients,
    loadingRevisions,
    loadingClients,
    fetchRevisions,
    fetchClients,
    fetchClientDetail,
    fetchRevisionDetail,
    addRevision,
    addInspection,
  };

  return (
    <RevisionsContext.Provider value={value}>
      {children}
    </RevisionsContext.Provider>
  );
}

export function useRevisions() {
  const context = useContext(RevisionsContext);
  if (!context) {
    throw new Error('useRevisions debe usarse dentro de un RevisionsProvider');
  }
  return context;
}
