const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDatabase, closeDatabase } = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const clientsRoutes = require('./routes/clients.routes');
const revisionsRoutes = require('./routes/revisions.routes');
const inspectionsRoutes = require('./routes/inspections.routes');
const usersRoutes = require('./routes/users.routes');
const accessHelpRoutes = require('./routes/access-help.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

getDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/revisions', revisionsRoutes);
app.use('/api/inspections', inspectionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/access-help', accessHelpRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});
