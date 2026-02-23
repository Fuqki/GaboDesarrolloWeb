const { getDatabase } = require('../config/database');

function getAll(_req, res) {
  const db = getDatabase();
  const clients = db.prepare('SELECT * FROM clients WHERE active = 1 ORDER BY name').all();
  res.json(clients);
}

function getBySlug(req, res) {
  const db = getDatabase();
  const client = db.prepare('SELECT * FROM clients WHERE slug = ? AND active = 1').get(req.params.slug);

  if (!client) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  const revisions = db.prepare(`
    SELECT r.*, 
           CASE WHEN qi.id IS NOT NULL THEN 1 ELSE 0 END as tiene_inspeccion,
           qi.estado as estado_inspeccion
    FROM revisions r
    LEFT JOIN quality_inspections qi ON qi.revision_id = r.id
    WHERE r.client_id = ?
    ORDER BY r.fecha_revision DESC
  `).all(client.id);

  res.json({ ...client, revisions });
}

module.exports = { getAll, getBySlug };
