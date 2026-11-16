const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { uploadDir } = require('./config/runtime');
const { authenticateToken } = require('./middleware/auth');
const { getDatabase, closeDatabase } = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const clientsRoutes = require('./routes/clients.routes');
const revisionsRoutes = require('./routes/revisions.routes');
const inspectionsRoutes = require('./routes/inspections.routes');
const usersRoutes = require('./routes/users.routes');
const accessHelpRoutes = require('./routes/access-help.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', authenticateToken, express.static(uploadDir));
app.use('/uploads', (_req, res) => res.status(404).json({ error: 'Archivo no encontrado' }));

getDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/revisions', revisionsRoutes);
app.use('/api/inspections', inspectionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/access-help', accessHelpRoutes);

app.get('/api/health', (_req, res) => {
  getDatabase().prepare('SELECT 1').get();
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const buildPath = path.join(__dirname, '..', 'build');
if (fs.existsSync(path.join(buildPath, 'index.html'))) {
  app.use(express.static(buildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Rutas /api inexistentes → JSON (evita HTML de Express que rompe res.json() en el cliente)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' });
  }
  next();
});

app.use((err, req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.error('[API]', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  next(err);
});

if (require.main === module) {
  const server = app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
  const shutdown = () => {
    server.close(() => { closeDatabase(); process.exit(0); });
    setTimeout(() => process.exit(1), 25000).unref();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}
module.exports = app;
