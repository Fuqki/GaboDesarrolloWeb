const path = require('path');
const { getDatabase } = require('../config/database');

function getAll(_req, res) {
  const db = getDatabase();
  const revisions = db.prepare(`
    SELECT r.*, c.name as fabrica, c.slug as client_slug,
           CASE WHEN qi.id IS NOT NULL THEN 1 ELSE 0 END as tiene_inspeccion,
           qi.estado as estado_inspeccion
    FROM revisions r
    JOIN clients c ON c.id = r.client_id
    LEFT JOIN quality_inspections qi ON qi.revision_id = r.id
    ORDER BY r.fecha_revision DESC
  `).all();

  res.json(revisions);
}

function getById(req, res) {
  const db = getDatabase();
  const revision = db.prepare(`
    SELECT r.*, c.name as fabrica, c.slug as client_slug
    FROM revisions r
    JOIN clients c ON c.id = r.client_id
    WHERE r.id = ?
  `).get(req.params.id);

  if (!revision) {
    return res.status(404).json({ error: 'Revisión no encontrada' });
  }

  const inspection = db.prepare(`
    SELECT qi.*, u.name as inspector_nombre
    FROM quality_inspections qi
    JOIN users u ON u.id = qi.inspector_id
    WHERE qi.revision_id = ?
  `).get(revision.id);

  let operations = [];
  if (inspection) {
    operations = db.prepare(
      'SELECT * FROM inspection_operations WHERE inspection_id = ? ORDER BY num_operacion'
    ).all(inspection.id);
  }

  res.json({
    ...revision,
    inspection: inspection ? { ...inspection, operations } : null
  });
}

function create(req, res) {
  const { numero_pieza, plano, client_id, num_operaciones, piezas_totales, operadores, fecha_revision, fecha_salida } = req.body;

  if (!numero_pieza || !plano || !client_id || !num_operaciones || !fecha_revision) {
    return res.status(400).json({ error: 'Campos obligatorios: numero_pieza, plano, client_id, num_operaciones, fecha_revision' });
  }

  const piezasTotalesNum = parseInt(piezas_totales, 10);
  if (Number.isNaN(piezasTotalesNum) || piezasTotalesNum < 1) {
    return res.status(400).json({ error: 'piezas_totales debe ser un entero mayor o igual a 1' });
  }

  const db = getDatabase();

  let plano_archivo_path = null;
  let plano_nombre_archivo = null;

  if (req.file) {
    plano_archivo_path = path.posix.join('blueprints', req.file.filename);
    plano_nombre_archivo = req.file.originalname;
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO revisions (numero_pieza, plano, client_id, num_operaciones, piezas_totales, operadores, fecha_revision, fecha_salida, plano_archivo_path, plano_nombre_archivo, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      numero_pieza, plano, client_id, num_operaciones, piezasTotalesNum,
      operadores || null, fecha_revision, fecha_salida || null,
      plano_archivo_path, plano_nombre_archivo, req.user.id
    );

    const newRevision = db.prepare('SELECT * FROM revisions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newRevision);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Ya existe una revisión con ese número de pieza' });
    }
    res.status(500).json({ error: 'Error al crear la revisión' });
  }
}

module.exports = { getAll, getById, create };
