const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.db');

let db;

function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeTables();
  }
  return db;
}

function migrateUsersRole() {
  const columns = db.prepare('PRAGMA table_info(users)').all();
  const hasRole = columns.some((c) => c.name === 'role');
  if (!hasRole) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'calidad'");
  }
}

/**
 * Garantiza al menos un administrador.
 * Si el empleado 9999 ya existía cuando se añadió la columna `role`, quedó en "calidad"
 * y el INSERT falla por UNIQUE: hay que promoverlo a admin.
 */
function ensureAdminUser() {
  const total = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (total === 0) return;

  const adminCount = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'").get().c;
  if (adminCount > 0) return;

  const existing9999 = db.prepare('SELECT id FROM users WHERE employee_number = ?').get('9999');
  if (existing9999) {
    db.prepare(
      `UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(existing9999.id);
    console.log('[DB] Usuario 9999 promovido a administrador (rol corregido en base de datos).');
    return;
  }

  const hash = bcrypt.hashSync('AdminCalidad2026', 10);
  try {
    db.prepare(
      `INSERT INTO users (employee_number, name, password_hash, role) VALUES (?, ?, ?, 'admin')`
    ).run('9999', 'Administrador del Sistema', hash);
    console.log('[DB] Creado usuario administrador: empleado 9999 (contraseña inicial: AdminCalidad2026)');
  } catch (err) {
    console.warn('[DB] ensureAdminUser:', err.message);
  }
}

function initializeTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_number VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      photo_url VARCHAR(255),
      role TEXT NOT NULL DEFAULT 'calidad',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_pieza VARCHAR(30) UNIQUE NOT NULL,
      plano VARCHAR(50) NOT NULL,
      client_id INTEGER NOT NULL,
      num_operaciones INTEGER NOT NULL CHECK(num_operaciones > 0),
      operadores VARCHAR(255),
      fecha_revision DATE NOT NULL,
      fecha_salida DATE,
      plano_archivo_path VARCHAR(500),
      plano_nombre_archivo VARCHAR(255),
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS quality_inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      revision_id INTEGER UNIQUE NOT NULL,
      inspector_id INTEGER NOT NULL,
      aprobado_por VARCHAR(100),
      fecha_inspeccion DATE NOT NULL,
      observaciones TEXT,
      estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'aprobada', 'rechazada')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (revision_id) REFERENCES revisions(id),
      FOREIGN KEY (inspector_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS inspection_operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inspection_id INTEGER NOT NULL,
      num_operacion INTEGER NOT NULL,
      medida_nominal VARCHAR(50) NOT NULL,
      tolerancia VARCHAR(50) NOT NULL,
      medida_real VARCHAR(50) NOT NULL,
      aprobada INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (inspection_id) REFERENCES quality_inspections(id),
      UNIQUE(inspection_id, num_operacion)
    );

    CREATE INDEX IF NOT EXISTS idx_revisions_client ON revisions(client_id);
    CREATE INDEX IF NOT EXISTS idx_operations_inspection ON inspection_operations(inspection_id);

    CREATE TABLE IF NOT EXISTS access_help_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      employee_number VARCHAR(20) NOT NULL,
      user_name VARCHAR(100),
      message TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK(status IN ('pendiente', 'atendida')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMP,
      resolved_by INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (resolved_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_access_help_status ON access_help_requests(status);
  `);

  migrateUsersRole();
  ensureAdminUser();
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDatabase, closeDatabase };
