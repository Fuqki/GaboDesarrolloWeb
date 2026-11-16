// Ejecutar en el servidor con ADMIN_PASSWORD_FILE temporal, nunca desde un PR.
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { getDatabase, closeDatabase } = require('../config/database');
const employee = process.env.ADMIN_EMPLOYEE;
const name = process.env.ADMIN_NAME;
const password = process.env.ADMIN_PASSWORD_FILE && fs.readFileSync(process.env.ADMIN_PASSWORD_FILE, 'utf8').trim();
if (!employee || !name || !password || password.length < 12) {
  throw new Error('Definir ADMIN_EMPLOYEE, ADMIN_NAME y ADMIN_PASSWORD_FILE (mínimo 12 caracteres)');
}
try {
  const db = getDatabase();
  if (db.prepare("SELECT id FROM users WHERE role='admin'").get()) throw new Error('Ya existe un administrador; no se modifica');
  db.prepare("INSERT INTO users(employee_number,name,password_hash,role) VALUES(?,?,?,'admin')")
    .run(employee, name, bcrypt.hashSync(password, 10));
  console.log('Administrador creado');
} finally { closeDatabase(); }
