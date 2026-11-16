const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { randomBytes } = require('crypto');
// Nunca usar las rutas ni los secretos del entorno de operación.
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbs-test-'));
process.env.NODE_ENV = 'production';
process.env.DB_PATH = path.join(temp, 'database.db');
process.env.UPLOAD_DIR = path.join(temp, 'uploads');
delete process.env.JWT_SECRET_FILE;
process.env.JWT_SECRET = randomBytes(48).toString('hex');
const app = require('../server');
const { getDatabase, closeDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');
let server, base, token, adminToken, clientId;
async function request(route, { auth = token, method = 'GET', body } = {}) {
  const headers = { ...(auth ? { Authorization: `Bearer ${auth}` } : {}) };
  if (body) headers['Content-Type'] = 'application/json';
  return fetch(base + route, { method, headers, body: body && JSON.stringify(body) });
}
before(async () => {
  const db = getDatabase();
  assert.equal(db.prepare('SELECT count(*) AS n FROM users').get().n, 0);
  for (const [id, role] of [['100','admin'],['101','calidad']]) {
    db.prepare('INSERT INTO users(employee_number,name,password_hash,role) VALUES(?,?,?,?)')
      .run(id, 'Test', bcrypt.hashSync('Test-only-password', 4), role);
  }
  clientId = Number(db.prepare("INSERT INTO clients(slug,name) VALUES('test','Test')").run().lastInsertRowid);
  server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  base = `http://127.0.0.1:${server.address().port}`;
  for (const id of ['100','101']) {
    const res = await request('/api/auth/login', { auth: null, method:'POST', body:{employee_number:id,password:'Test-only-password'} });
    assert.equal(res.status,200);
    const data=await res.json();
    if(id==='100') adminToken=data.token; else token=data.token;
  }
});
after(async () => {
  if(server) await new Promise(resolve => server.close(resolve));
  closeDatabase();
  fs.rmSync(temp, { recursive:true, force:true });
});
test('salud, autenticación y autorización administrativa', async () => {
  assert.equal((await request('/api/health',{auth:null})).status,200);
  assert.equal((await request('/api/revisions',{auth:null})).status,401);
  assert.equal((await request('/api/revisions',{auth:'invalid'})).status,401);
  assert.equal((await request('/api/users')).status,403);
  assert.equal((await request('/api/users',{auth:adminToken})).status,200);
  assert.equal((await request('/api/auth/login',{auth:null,method:'POST',body:{employee_number:'100',password:'wrong'}})).status,401);
});
test('revisión e inspección persisten y rechazan duplicados', async () => {
  const body={numero_pieza:'TEST-1',plano:'P1',client_id:clientId,num_operaciones:1,piezas_totales:10,fecha_revision:'2026-11-15'};
  const res=await request('/api/revisions',{method:'POST',body}); assert.equal(res.status,201);
  const revision=await res.json();
  assert.equal((await request('/api/revisions',{method:'POST',body})).status,409);
  const inspection={operations:[{num_operacion:1,medida_nominal:'1',tolerancia:'0.1',medida_real:'1',aprobada:true}]};
  const result=await request(`/api/inspections/revision/${revision.id}`,{method:'POST',body:inspection});
  assert.equal(result.status,201); assert.equal((await result.json()).estado,'aprobada');
  assert.equal((await request(`/api/inspections/revision/${revision.id}`,{method:'POST',body:inspection})).status,409);
  assert.equal((await (await request(`/api/revisions/${revision.id}`)).json()).inspection.operations.length,1);
});
test('transacción de inspección fallida no deja datos parciales',async()=>{
  const db=getDatabase();
  const id=Number(db.prepare("INSERT INTO revisions(numero_pieza,plano,client_id,num_operaciones,fecha_revision) VALUES('TX','P',?,2,'2026-11-15')").run(clientId).lastInsertRowid);
  const op={num_operacion:1,medida_nominal:'1',tolerancia:'1',medida_real:'1',aprobada:true};
  assert.equal((await request(`/api/inspections/revision/${id}`,{method:'POST',body:{operations:[op,op]}})).status,500);
  assert.equal(db.prepare('SELECT id FROM quality_inspections WHERE revision_id=?').get(id),undefined);
});
test('planos requieren token y los errores API son JSON',async()=>{
  fs.writeFileSync(path.join(process.env.UPLOAD_DIR,'blueprints','test.pdf'),'%PDF-1.4 test');
  assert.equal((await request('/uploads/blueprints/test.pdf',{auth:null})).status,401);
  assert.equal((await request('/uploads/blueprints/test.pdf')).status,200);
  const res=await request('/api/does-not-exist'); assert.equal(res.status,404);
  assert.match(res.headers.get('content-type'),/json/);
});
test('producción rechaza un secreto ausente o corto',()=>{
  const { spawnSync }=require('child_process');
  const env={...process.env,JWT_SECRET:'short'};
  delete env.JWT_SECRET_FILE;
  const result=spawnSync(process.execPath,['-e',"require('./config/runtime')"],{cwd:path.join(__dirname,'..'),env,encoding:'utf8'});
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/Producción requiere/);
});
test('el paquete sirve la aplicación y las rutas del navegador',async()=>{
  // En CI Docker siempre incluye build; localmente generar primero npm run build.
  assert.ok(fs.existsSync(path.join(__dirname,'..','..','build','index.html')),'Falta npm run build');
  for(const route of ['/','/cliente/test']) {
    const response=await request(route,{auth:null});
    assert.equal(response.status,200); assert.match(response.headers.get('content-type'),/html/);
  }
});
