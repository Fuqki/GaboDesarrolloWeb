const Database = require('better-sqlite3');
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

function initializeTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_number VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      photo_url VARCHAR(255),
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
  `);
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDatabase, closeDatabase };
