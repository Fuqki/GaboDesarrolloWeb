import assert from 'node:assert/strict';
const base = (process.argv[2] || 'http://127.0.0.1:3001').replace(/\/$/, '');
for (const [route, status, type] of [['/api/health',200,'json'],['/api/revisions',401,'json'],['/api/not-found',404,'json'],['/',200,'html']]) {
  const res=await fetch(base+route,{signal:AbortSignal.timeout(5000)});
  assert.equal(res.status,status,`${route}: estado HTTP`);
  assert.ok(res.headers.get('content-type')?.includes(type),`${route}: tipo de contenido`);
  if(route==='/api/health') assert.equal((await res.json()).status,'ok');
}
console.log('Smoke OK: frontend, base de datos, autenticación y errores API');
