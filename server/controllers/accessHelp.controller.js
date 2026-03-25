const { getDatabase } = require('../config/database');

/**
 * Público: empleado sin sesión pide que un admin le restablezca el acceso.
 * Solo registra si el número de empleado existe en el sistema.
 */
function createRequest(req, res) {
  const { employee_number, message } = req.body;

  if (!employee_number || !String(employee_number).trim()) {
    return res.status(400).json({ error: 'Indica tu número de empleado' });
  }
  const emp = String(employee_number).trim();
  if (!/^\d+$/.test(emp)) {
    return res.status(400).json({ error: 'El número de empleado debe ser numérico' });
  }

  const db = getDatabase();
  const user = db
    .prepare('SELECT id, name, employee_number, role FROM users WHERE employee_number = ?')
    .get(emp);

  if (!user) {
    return res.json({
      success: true,
      message:
        'Si tus datos son correctos, un administrador revisará tu caso. Verifica el número de empleado.',
    });
  }

  const msg = message != null ? String(message).trim().slice(0, 500) : '';

  db.prepare(
    `INSERT INTO access_help_requests (user_id, employee_number, user_name, message, status)
     VALUES (?, ?, ?, ?, 'pendiente')`
  ).run(user.id, user.employee_number, user.name, msg || null);

  res.status(201).json({
    success: true,
    message:
      'Tu solicitud fue enviada. Un administrador será notificado para restablecer tu acceso.',
  });
}

function listRequests(_req, res) {
  try {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT r.id, r.user_id, r.employee_number, r.user_name, r.message, r.status,
              r.created_at, r.resolved_at, r.resolved_by,
              u.name AS resolved_by_name
       FROM access_help_requests r
       LEFT JOIN users u ON u.id = r.resolved_by
       ORDER BY
         CASE r.status WHEN 'pendiente' THEN 0 ELSE 1 END,
         r.created_at DESC`
      )
      .all();
    res.json(rows);
  } catch (err) {
    console.error('[access-help] listRequests:', err);
    res.status(500).json({ error: 'No se pudieron cargar las solicitudes (revisa la base de datos)' });
  }
}

function resolveRequest(req, res) {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const db = getDatabase();
  const row = db.prepare('SELECT id, status FROM access_help_requests WHERE id = ?').get(id);
  if (!row) {
    return res.status(404).json({ error: 'Solicitud no encontrada' });
  }

  db.prepare(
    `UPDATE access_help_requests
     SET status = 'atendida', resolved_at = CURRENT_TIMESTAMP, resolved_by = ?
     WHERE id = ?`
  ).run(req.user.id, id);

  res.json({ success: true, message: 'Solicitud marcada como atendida' });
}

module.exports = { createRequest, listRequests, resolveRequest };
