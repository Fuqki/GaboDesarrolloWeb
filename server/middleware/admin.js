const { getDatabase } = require('../config/database');

function getUserRole(userId) {
  const db = getDatabase();
  const row = db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
  return row?.role || 'calidad';
}

/** Siempre leer rol en BD: el JWT puede quedar desactualizado si se corrigió el rol sin cerrar sesión */
function requireAdmin(req, res, next) {
  const role = getUserRole(req.user.id);

  if (role !== 'admin') {
    return res.status(403).json({ error: 'Se requieren permisos de administrador' });
  }

  next();
}

module.exports = { requireAdmin, getUserRole };
