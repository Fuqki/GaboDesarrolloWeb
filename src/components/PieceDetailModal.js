import React, { useState, useEffect } from 'react';
import { useRevisions } from '../context/RevisionsContext';
import QualityInspectionForm from './QualityInspectionForm';
import Tooltip from './Tooltip';
import { getOperatorsSummary } from '../utils/operators';

import { getBlueprintBlob } from '../services/api';

function PieceDetailModal({ piece, onClose, onInspectionSaved }) {
  const { fetchRevisionDetail } = useRevisions();
  const [activeTab, setActiveTab] = useState('info');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInspectionForm, setShowInspectionForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRevisionDetail(piece.id).then((data) => {
      if (!cancelled) {
        setDetail(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [piece.id, fetchRevisionDetail]);

  const handleInspectionSaved = () => {
    setShowInspectionForm(false);
    fetchRevisionDetail(piece.id).then(setDetail);
    if (onInspectionSaved) onInspectionSaved();
  };

  const data = detail || piece;
  const [blueprintUrl, setBlueprintUrl] = useState('');
  const [blueprintError, setBlueprintError] = useState('');
  useEffect(() => {
    let cancelled = false;
    let url;
    setBlueprintUrl('');
    setBlueprintError('');
    if (activeTab === 'plano' && data.plano_archivo_path) {
      getBlueprintBlob(data.plano_archivo_path).then(blob => {
        if (!cancelled) { url = URL.createObjectURL(blob); setBlueprintUrl(url); }
      }).catch(err => { if (!cancelled) setBlueprintError(err.message); });
    }
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [activeTab, data.plano_archivo_path]);

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content piece-detail-modal">
          <div className="modal-header">
            <h2>Detalle de Pieza: {data.numero_pieza}</h2>
            <Tooltip text="Cerrar ventana de detalle">
              <button className="close-button" onClick={onClose}>✕</button>
            </Tooltip>
          </div>

          <div className="detail-tabs">
            <Tooltip text="Datos generales de la pieza">
              <button className={`tab-button ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                Información
              </button>
            </Tooltip>
            <Tooltip text="Visualizar archivo o identificador del plano">
              <button className={`tab-button ${activeTab === 'plano' ? 'active' : ''}`} onClick={() => setActiveTab('plano')}>
                Plano
              </button>
            </Tooltip>
            <Tooltip text="Consultar o capturar hoja de inspección">
              <button className={`tab-button ${activeTab === 'inspeccion' ? 'active' : ''}`} onClick={() => setActiveTab('inspeccion')}>
                Inspección de Calidad
              </button>
            </Tooltip>
          </div>

          <div className="piece-detail-content">
            {loading && <div className="loading-section"><p>Cargando detalle...</p></div>}

            {!loading && activeTab === 'info' && (
              <>
                <section className="detail-section">
                  <h3>Información General</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Número de Pieza</label>
                      <span>{data.numero_pieza}</span>
                    </div>
                    <div className="detail-item">
                      <label>Plano</label>
                      <span>{data.plano}</span>
                    </div>
                    <div className="detail-item">
                      <label>Fábrica</label>
                      <span>{data.fabrica}</span>
                    </div>
                  </div>
                </section>
                <section className="detail-section">
                  <h3>Operaciones</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Número de Operaciones</label>
                      <span>{data.num_operaciones}</span>
                    </div>
                    <div className="detail-item">
                      <label>Cantidad de piezas totales</label>
                      <span>{data.piezas_totales ?? 1}</span>
                    </div>
                    <div className="detail-item">
                      <label>Operadores</label>
                      <span>{getOperatorsSummary(data.operadores, data.num_operaciones)}</span>
                    </div>
                  </div>
                </section>
                <section className="detail-section">
                  <h3>Fechas</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Fecha de Revisión</label>
                      <span>{data.fecha_revision}</span>
                    </div>
                    <div className="detail-item">
                      <label>Fecha de Salida</label>
                      <span>{data.fecha_salida || 'Pendiente'}</span>
                    </div>
                  </div>
                </section>
              </>
            )}

            {!loading && activeTab === 'plano' && (
              <section className="detail-section plano-section">
                <h3>Archivo del Plano</h3>
                {data.plano_archivo_path ? (
                  <div className="plano-viewer">
                    {blueprintError && <p role="alert">{blueprintError}</p>}
                    {data.plano_nombre_archivo?.match(/\.pdf$/i) ? (
                      <div className="plano-pdf">
                        <a
                          href={blueprintUrl || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-pdf-button"
                        >
                          Ver PDF: {data.plano_nombre_archivo}
                        </a>
                      </div>
                    ) : (
                      <img
                        src={blueprintUrl || undefined}
                        alt={`Plano ${data.plano}`}
                        className="plano-image"
                      />
                    )}
                  </div>
                ) : (
                  <div className="no-plano">
                    <p>No se ha subido archivo de plano.</p>
                    <p className="plano-id">Identificador: {data.plano}</p>
                  </div>
                )}
              </section>
            )}

            {!loading && activeTab === 'inspeccion' && (
              <section className="detail-section inspection-section">
                <h3>Hoja de Inspección de Calidad</h3>
                {detail?.inspection ? (
                  <div className="inspection-result">
                    <div className="inspection-header-info">
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Inspector</label>
                          <span>{detail.inspection.inspector_nombre}</span>
                        </div>
                        <div className="detail-item">
                          <label>Fecha</label>
                          <span>{detail.inspection.fecha_inspeccion}</span>
                        </div>
                        <div className="detail-item">
                          <label>Estado</label>
                          <span className={`inspection-badge ${detail.inspection.estado === 'aprobada' ? 'badge-approved' : 'badge-rejected'}`}>
                            {detail.inspection.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="quality-table-wrapper">
                      <table className="quality-operations-table readonly">
                        <thead>
                          <tr>
                            <th>Op.</th>
                            <th>Medida Nominal</th>
                            <th>Tolerancia</th>
                            <th>Medida Real</th>
                            <th>Resultado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.inspection.operations.map((op) => (
                            <tr key={op.num_operacion} className={op.aprobada ? 'row-approved' : 'row-rejected'}>
                              <td className="op-number">{op.num_operacion}</td>
                              <td>{op.medida_nominal}</td>
                              <td>{op.tolerancia}</td>
                              <td>{op.medida_real}</td>
                              <td>
                                <span className={`inspection-badge ${op.aprobada ? 'badge-approved' : 'badge-rejected'}`}>
                                  {op.aprobada ? 'Aprobada' : 'Rechazada'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {detail.inspection.observaciones && (
                      <div className="inspection-observations">
                        <label>Observaciones:</label>
                        <p>{detail.inspection.observaciones}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-inspection">
                    <p>Esta pieza aún no tiene hoja de inspección de calidad.</p>
                    <Tooltip text="Capturar mediciones y aprobar/rechazar operaciones">
                      <button className="submit-button" onClick={() => setShowInspectionForm(true)}>
                        Llenar Hoja de Inspección
                      </button>
                    </Tooltip>
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="modal-footer">
            <Tooltip text="Cerrar y volver a la tabla">
              <button className="close-detail-button" onClick={onClose}>Cerrar</button>
            </Tooltip>
          </div>
        </div>
      </div>

      {showInspectionForm && (
        <QualityInspectionForm
          piece={data}
          onClose={() => setShowInspectionForm(false)}
          onSaved={handleInspectionSaved}
        />
      )}
    </>
  );
}

export default PieceDetailModal;
