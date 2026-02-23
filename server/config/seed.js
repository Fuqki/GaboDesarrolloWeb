const bcrypt = require('bcryptjs');
const { getDatabase, closeDatabase } = require('./database');

function seed() {
  const db = getDatabase();

  const existingUser = db.prepare('SELECT id FROM users LIMIT 1').get();
  if (existingUser) {
    console.log('La base de datos ya tiene datos. Seed omitido.');
    console.log('Para reiniciar, elimina el archivo database.db y vuelve a ejecutar el seed.');
    closeDatabase();
    return;
  }

  console.log('Insertando datos iniciales...');

  const insertUser = db.prepare(`
    INSERT INTO users (employee_number, name, password_hash) VALUES (?, ?, ?)
  `);

  const insertClient = db.prepare(`
    INSERT INTO clients (slug, name, description) VALUES (?, ?, ?)
  `);

  const insertRevision = db.prepare(`
    INSERT INTO revisions (numero_pieza, plano, client_id, num_operaciones, operadores, fecha_revision, fecha_salida, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    const passwordHash = bcrypt.hashSync('Contrasena123', 10);

    insertUser.run('0001', 'Usuario de Calidad', passwordHash);
    insertUser.run('0002', 'Inspector García', passwordHash);
    insertUser.run('0003', 'Inspector López', passwordHash);
    console.log('  - 3 usuarios creados (contraseña: Contrasena123)');

    insertClient.run('amphenol', 'Amphenol', 'Fabricante de conectores electrónicos y sensores industriales');
    insertClient.run('magnetics', 'Magnetics', 'Proveedor de componentes magnéticos y transformadores');
    insertClient.run('ichor', 'Ichor', 'Sistemas de entrega de fluidos para semiconductores');
    console.log('  - 3 clientes creados');

    const amphenolId = db.prepare("SELECT id FROM clients WHERE slug = 'amphenol'").get().id;
    const magneticsId = db.prepare("SELECT id FROM clients WHERE slug = 'magnetics'").get().id;
    const ichorId = db.prepare("SELECT id FROM clients WHERE slug = 'ichor'").get().id;
    const userId = db.prepare("SELECT id FROM users WHERE employee_number = '0001'").get().id;

    insertRevision.run('PZ-001234', 'PLN-2024-001', amphenolId, 5, 'Juan Pérez, María García', '2026-02-04', '2026-02-05', userId);
    insertRevision.run('PZ-001235', 'PLN-2024-002', magneticsId, 3, 'Carlos López', '2026-02-06', null, userId);
    insertRevision.run('PZ-001236', 'PLN-2024-003', ichorId, 4, 'Ana Martínez, Roberto Sánchez', '2026-02-08', '2026-02-10', userId);
    insertRevision.run('AMP-001', 'PLN-AMP-001', amphenolId, 6, 'Juan Pérez', '2026-01-15', '2026-01-20', userId);
    insertRevision.run('AMP-002', 'PLN-AMP-002', amphenolId, 4, 'María García', '2026-02-01', null, userId);
    insertRevision.run('MAG-001', 'PLN-MAG-001', magneticsId, 3, 'Carlos López, Ana Martínez', '2026-01-28', '2026-02-02', userId);
    insertRevision.run('ICH-001', 'PLN-ICH-001', ichorId, 5, 'Roberto Sánchez', '2026-02-10', null, userId);
    console.log('  - 7 revisiones creadas');
  });

  try {
    transaction();
    console.log('\nSeed completado exitosamente.');
  } catch (err) {
    console.error('Error durante el seed:', err.message);
  }

  closeDatabase();
}

seed();
