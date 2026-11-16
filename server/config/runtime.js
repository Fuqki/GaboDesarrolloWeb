const fs = require('fs');
const path = require('path');

const databasePath = path.resolve(process.env.DB_PATH || path.join(__dirname, '..', 'database.db'));
const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'));
const jwtSecret = process.env.JWT_SECRET_FILE
  ? fs.readFileSync(process.env.JWT_SECRET_FILE, 'utf8').trim()
  : process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error('Producción requiere JWT_SECRET o JWT_SECRET_FILE de al menos 32 caracteres');
}
module.exports = { databasePath, uploadDir, jwtSecret };
