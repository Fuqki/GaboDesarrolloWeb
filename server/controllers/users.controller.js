const bcrypt = require('bcryptjs');
const { getDatabase } = require('../config/database');

function listUsers(_req, res) {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT id, employee_number, name, role, photo_url, created_at, updated_at
       FROM users ORDER BY employee_number`
    )
    .all();
  res.json(rows);
}

function createUser(req, res) {
  const { employee_number, name, password, role = 'calidad' } = req.body;

  if (!employee_number || !String(employee_number).trim()) {
    return res.status(400).json({ error: 'El número de empleado es requerido' });
  }
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const normalizedRole = role === 'admin' ? 'admin' : 'calidad';

  const db = getDatabase();
  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const result = db
      .prepare(
        `INSERT INTO users (employee_number, name, password_hash, role)
         VALUES (?, ?, ?, ?)`
      )
      .run(String(employee_number).trim(), String(name).trim(), passwordHash, normalizedRole);

    const user = db
      .prepare(
        `SELECT id, employee_number, name, role, photo_url, created_at, updated_at
         FROM users WHERE id = ?`
      )
      .get(result.lastInsertRowid);

    res.status(201).json(user);
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese número de empleado' });
    }
    res.status(500).json({ error: 'No se pudo crear el usuario' });
  }
}

function resetPassword(req, res) {
  const id = Number(req.params.id);
  const { new_password: newPassword } = req.body;

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  const db = getDatabase();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const passwordHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    passwordHash,
    id
  );

  res.json({ success: true, message: 'Contraseña actualizada' });
}

module.exports = { listUsers, createUser, resetPassword };
