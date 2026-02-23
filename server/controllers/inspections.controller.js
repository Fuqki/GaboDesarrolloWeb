const { getDatabase } = require('../config/database');

function getByRevisionId(req, res) {
  const db = getDatabase();
  const inspection = db.prepare(`
    SELECT qi.*, u.name as inspector_nombre
    FROM quality_inspections qi
    JOIN users u ON u.id = qi.inspector_id
    WHERE qi.revision_id = ?
  `).get(req.params.revisionId);

  if (!inspection) {
    return res.status(404).json({ error: 'No se encontró hoja de inspección para esta revisión' });
  }

  const operations = db.prepare(
    'SELECT * FROM inspection_operations WHERE inspection_id = ? ORDER BY num_operacion'
  ).all(inspection.id);

  res.json({ ...inspection, operations });
}

function create(req, res) {
  const { revisionId } = req.params;
  const { observaciones, estado, operations } = req.body;

  if (!operations || !Array.isArray(operations) || operations.length === 0) {
    return res.status(400).json({ error: 'Se requiere al menos una operación' });
  }

  const db = getDatabase();

  const revision = db.prepare('SELECT * FROM revisions WHERE id = ?').get(revisionId);
  if (!revision) {
    return res.status(404).json({ error: 'Revisión no encontrada' });
  }

  const existing = db.prepare('SELECT id FROM quality_inspections WHERE revision_id = ?').get(revisionId);
  if (existing) {
    return res.status(409).json({ error: 'Ya existe una hoja de inspección para esta revisión' });
  }

  const insertInspection = db.prepare(`
    INSERT INTO quality_inspections (revision_id, inspector_id, aprobado_por, fecha_inspeccion, observaciones, estado)
    VALUES (?, ?, ?, DATE('now'), ?, ?)
  `);

  const insertOperation = db.prepare(`
    INSERT INTO inspection_operations (inspection_id, num_operacion, medida_nominal, tolerancia, medida_real, aprobada)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    const allApproved = operations.every(op => op.aprobada);
    const finalEstado = estado || (allApproved ? 'aprobada' : 'rechazada');

    const result = insertInspection.run(
      revisionId, req.user.id, req.user.name,
      observaciones || null, finalEstado
    );

    const inspectionId = result.lastInsertRowid;

    for (const op of operations) {
      insertOperation.run(
        inspectionId, op.num_operacion,
        op.medida_nominal, op.tolerancia,
        op.medida_real, op.aprobada ? 1 : 0
      );
    }

    return inspectionId;
  });

  try {
    const inspectionId = transaction();
    const inspection = db.prepare('SELECT * FROM quality_inspections WHERE id = ?').get(inspectionId);
    const ops = db.prepare('SELECT * FROM inspection_operations WHERE inspection_id = ? ORDER BY num_operacion').all(inspectionId);

    res.status(201).json({ ...inspection, operations: ops });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la hoja de inspección' });
  }
}

module.exports = { getByRevisionId, create };
