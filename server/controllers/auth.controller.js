const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

function login(req, res) {
  const { employee_number, password } = req.body;

  if (!employee_number || !password) {
    return res.status(400).json({ error: 'Número de empleado y contraseña son requeridos' });
  }

  const db = getDatabase();
  const user = db.prepare('SELECT * FROM users WHERE employee_number = ?').get(employee_number);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const role = user.role || 'calidad';

  const token = jwt.sign(
    { id: user.id, employee_number: user.employee_number, name: user.name, role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      employee_number: user.employee_number,
      name: user.name,
      photo_url: user.photo_url,
      role
    }
  });
}

function getProfile(req, res) {
  const db = getDatabase();
  const user = db.prepare(
    'SELECT id, employee_number, name, photo_url, role, created_at, updated_at FROM users WHERE id = ?'
  ).get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.json({
    ...user,
    role: user.role || 'calidad'
  });
}

module.exports = { login, getProfile };
