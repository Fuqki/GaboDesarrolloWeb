# Entrega del repositorio configurado

Esta entrega implementa los cuatro grupos de scripts solicitados. El repositorio construye y prueba una imagen Docker, conserva la liberación como artefacto y puede promover la misma imagen a staging y producción mediante SSH. Los despliegues están desactivados hasta configurar los ambientes reales. No se publicaron cambios ni se configuraron secretos remotos desde esta sesión.

## Correspondencia con los requisitos

| Requisito | Archivos entregados |
|---|---|
| Scripts del pipeline | `.github/workflows/pipeline.yml`, `.github/workflows/deploy.yml` |
| Generación del entorno de liberación | `Dockerfile`, `.dockerignore`, `deploy/compose.yml`, `scripts/prepare-environment.sh` |
| Pruebas en el entorno de liberación | `scripts/test-release.sh`, `scripts/smoke.mjs`, `server/tests/release.test.js`, `src/utils/operators.test.js` |
| Generación y ejecución del despliegue | `scripts/build-release.sh`, `scripts/deploy.sh`, `scripts/rollback.sh` |

## Alcance y actualización de las fases documentales

Este anexo registra la implementación posterior a los documentos de primera y segunda fase. En caso de diferencia, esta guía describe los scripts efectivamente entregados. Los objetivos de servicio de la segunda fase siguen sujetos a aprobación; no se consideran resultados medidos.

- Se adopta Docker Engine y Compose v2 para ejecutar Express y el frontend compilado en una sola imagen. Sustituye la propuesta de ejecución nativa con systemd. El host conserva Nginx para HTTPS; hay una plantilla en `deploy/nginx.conf.example`.
- La imagen usa Node 22 sobre Debian Bookworm; el tag base puede recibir actualizaciones. Se guarda la imagen ya construida y su checksum para promover exactamente el mismo paquete. Para reconstrucciones históricas idénticas, fijar también el digest de la imagen base tras validarlo.
- Hay pruebas automatizadas de frontend y de integración HTTP. No se ha implementado toda la matriz CP01–CP12, cobertura mínima, pruebas E2E de navegador, carga, monitoreo Prometheus/Grafana ni pruebas completas de recuperación.
- Se implementaron `DB_PATH`, `UPLOAD_DIR`, `CORS_ORIGIN`, `HOST`, lectura de `JWT_SECRET_FILE`, rechazo de secretos débiles en producción y cierre gradual del servidor. El seed y la creación automática de administradores de demostración quedan deshabilitados en producción.
- El frontend usa `/api` y el mismo origen para planos. El proxy de desarrollo mantiene `npm run dev` en puertos 3000/3001. Los planos requieren token y se descargan como blobs autenticados. Todos los usuarios autenticados pueden leerlos; no hay permisos por cliente.
- El backend actualizado se audita con umbral alto. La última comprobación dejó una vulnerabilidad moderada de `qs`. Multer 1.x continúa obsoleto; su migración y la validación profunda de archivos siguen pendientes. No interpretar esta entrega como aprobación de seguridad productiva.
- Los archivos `node_modules`, `build` y SQLite WAL/SHM ya estaban versionados. `.gitignore` evita nuevas inclusiones, pero no retira los ya seguidos. El contexto Docker los excluye. Su limpieza del historial/índice debe realizarse en un cambio de mantenimiento separado.

## Ejecución local sin Docker

Requisitos: Node 22 LTS y npm. Desde la raíz:

```powershell
npm ci
npm ci --prefix server
$env:CI='true'
npm test -- --watchAll=false --runInBand
npm run build
npm run test:release
```

En Linux, usar `CI=true npm test -- --watchAll=false --runInBand`. La suite del backend requiere `build/index.html`, por eso se compila antes. Crea una base y cargas temporales, ignora los datos y secretos del ambiente y los elimina al terminar. No ejecutar `seed` para esta suite.

Verificación realizada en Windows con Node 24.14.1: 2 pruebas de frontend y 6 pruebas de integración aprobadas; build de producción correcto con `CI=true`; sintaxis Bash y YAML válida. La imagen Node 22/Linux se verifica en el pipeline; no se ejecutó Docker localmente porque no está instalado. No se ha probado un despliegue remoto real.

## Construcción y pruebas del paquete de liberación

En Linux con Docker Engine, Compose v2, Bash, Git, OpenSSL, tar, gzip y sha256sum:

```bash
bash scripts/build-release.sh "$(git rev-parse HEAD)"
```

Ejecutar desde un checkout limpio del commit que se va a liberar: el SHA debe corresponder al contenido. El pipeline cumple esta condición mediante checkout. El script:

1. Construye frontend con `npm ci`, pruebas Jest y build con `CI=true`.
2. Instala dependencias del backend desde su lockfile y bloquea auditorías de nivel alto/crítico. No se incluyen dependencias del frontend en el runtime.
3. Genera `rbs-quality:<SHA>` con dependencias nativas Linux, sin datos operativos.
4. Ejecuta integración HTTP dentro de esa imagen y arranca otra instancia temporal para smoke tests.
5. Exporta la imagen, checksum SHA-256, revisión, Compose y scripts a `dist/release.tar.gz`.

La suite verifica login válido e inválido, 401/403, alta y consulta de revisiones, duplicados, persistencia de inspecciones, rollback transaccional, protección de planos, rechazo de secreto débil, HTML y fallback de rutas. El smoke es no destructivo: salud con consulta a SQLite, HTML, 401 y 404 JSON. No valida una sesión real ni una escritura de negocio en producción; esos pasos siguen dentro de UAT.

Para repetir las pruebas de una imagen ya construida:

```bash
bash scripts/test-release.sh rbs-quality:<SHA_COMPLETO>
```

## Preparar servidores

La preparación está dirigida a Linux x64. Instalar previamente Docker Engine, Compose v2 con `up --wait`, OpenSSL, `flock`, SSH y Nginx; permitir al usuario de despliegue ejecutar Docker. Ese permiso equivale a administración del host y debe limitarse al responsable de operación. El script comprueba Compose, crea carpetas y secretos; no instala paquetes del sistema ni abre puertos.

Con un usuario de despliegue llamado `deploy`, desde el checkout:

```bash
sudo bash scripts/prepare-environment.sh staging https://staging.example.com deploy
sudo bash scripts/prepare-environment.sh production https://calidad.example.com deploy
```

Reemplazar dominios y usuario. Los puertos locales son 3002 para staging y 3001 para producción. Se crean `/opt/rbs/<ambiente>/data`, `backups`, `releases`, `settings.env` y `secrets/jwt`. Los datos y el secreto pertenecen a UID 1000, correspondiente a `node` dentro de la imagen. La preparación no reemplaza secretos ni ajustes existentes. No ejecutarla sobre directorios ajenos al proyecto.

Configurar DNS, certificado válido y proxy usando `deploy/nginx.conf.example`; cambiar dominio, rutas de certificados y puerto para cada ambiente. El contenedor solo publica en loopback. Nginx dirige todas las rutas a Express, que sirve el frontend y la API. No crear un alias público a `data/uploads`, pues eludiría la autenticación.

El primer despliegue crea tablas vacías, sin usuarios ni clientes de demostración. Para una operación real, importar el catálogo de clientes aprobado o migrar la base existente con un respaldo previo. El sistema actual no ofrece un alta administrativa de clientes. No copiar una BD abierta ni omitir sus archivos WAL durante una migración.

## Configuración necesaria en GitHub

1. Subir estos archivos a `Fuqki/GaboDesarrolloWeb` mediante revisión. Crear `develop` si se utilizará ese flujo; `main` también puede ejecutar el pipeline.
2. Crear ambientes **staging** y **production**. En production configurar revisor obligatorio, impedir autoaprobación y permitir despliegues únicamente desde `main`. Verificar que el plan de GitHub admita estas protecciones antes de activar CD. En staging permitir `main` y `develop`.
3. En cada ambiente registrar secretos `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` y `DEPLOY_KNOWN_HOSTS`. El último contiene la clave pública SSH del servidor verificada por un canal confiable; no se desactiva la comprobación de host. El script usa SSH en puerto 22 y una clave sin frase de paso destinada exclusivamente al despliegue.
4. Registrar la variable de ambiente `PUBLIC_URL` con el origen HTTPS correspondiente, sin barra final. Se usa para validar también DNS, TLS y proxy después del despliegue.
5. Proteger `main` y `develop`: revisión de PR y comprobación obligatoria del job **release**, sin push directo ni force push. Los workflows usan acciones fijadas por SHA.
6. Solo tras preparar host, proxy, respaldo externo, datos, UAT y aprobación, definir la variable del repositorio `ENABLE_DEPLOYMENT=true`. Sin ella, CI construye, prueba y publica el artefacto, pero omite los jobs de despliegue.

Un PR ejecuta CI sin secretos de despliegue. Un push a develop construye y despliega a staging. Un push a main construye una vez, despliega esa imagen a staging y espera aprobación del ambiente production antes de promover el mismo artefacto. La concurrencia serializa el ciclo completo de entrega para evitar que se sobrescriba staging durante la aprobación. PRs tienen grupos separados.

## Despliegue manual y recuperación

Descargar el artefacto del run exitoso, descomprimirlo en una carpeta nueva y ejecutar como usuario de despliegue:

```bash
tar -xzf release.tar.gz
bash scripts/deploy.sh /opt/rbs/staging
```

El despliegue verifica checksum y etiqueta SHA, carga la imagen y repite sus pruebas aisladas. Adquiere un bloqueo con `flock`, detiene la aplicación anterior y respalda conjuntamente la carpeta de datos (BD, WAL y planos) con todos sus escritores detenidos. No debe existir otro proceso externo escribiendo sobre la misma base. El respaldo inicial puede estar vacío si aún no hay instalación.

Después copia la configuración, levanta el servicio y espera salud. Registra revisión anterior, actual, fecha y evidencia en el host. Si el respaldo falla, intenta reanudar la versión anterior. Si falla el nuevo servicio, lo detiene y conserva datos y respaldo para diagnóstico; no restaura automáticamente un esquema potencialmente incompatible. Si únicamente falla la comprobación HTTPS externa, el workflow falla, pero el contenedor puede seguir sano: revisar proxy/TLS y decidir la reversión.

Para revertir **solo código**, tras comprobar que el esquema actual es compatible con la versión anterior:

```bash
bash scripts/rollback.sh /opt/rbs/production --schema-compatible
```

No hay rollback previo en una instalación nueva. Si el esquema cambió de forma incompatible, detener todos los escritores y restaurar el conjunto de datos respaldado mediante un procedimiento aprobado, preservando el estado fallido y conciliando escrituras posteriores. Nunca eliminar WAL a mano de una base abierta.

Los backups locales no protegen contra pérdida del host. Antes de producción configurar copia externa cifrada, retención, respaldo periódico y ensayo de restauración según la segunda fase. Estos scripts realizan respaldo previo al despliegue, no un servicio de backup horario. Observar métricas y operación durante los 15 minutos siguientes; esa observación sigue siendo manual.

## Aprovisionar el primer administrador

Existe `server/scripts/create-admin.js`. Requiere `ADMIN_EMPLOYEE`, `ADMIN_NAME` y `ADMIN_PASSWORD_FILE` con contraseña de al menos 12 caracteres. Se niega a modificar una instalación que ya tenga administrador. Ejecutarlo con la imagen desplegada y la misma configuración de datos y secreto, sin exponer la contraseña en argumentos ni logs. Ejemplo en el host, después de preparar un archivo temporal `/run/rbs-admin-password` legible únicamente por UID 1000:

```bash
cd /opt/rbs/production
docker compose -p rbs-production --env-file settings.env --env-file release.env -f compose.yml run --rm \
  -e ADMIN_EMPLOYEE=1000 -e 'ADMIN_NAME=Responsable del sistema' \
  -e ADMIN_PASSWORD_FILE=/run/admin-password \
  -v /run/rbs-admin-password:/run/admin-password:ro \
  app node server/scripts/create-admin.js
```

Retirar el archivo temporal cuando termine. No reutilizar las contraseñas del seed ni almacenarlas en el repositorio. Coordinar esta operación con mantenimiento para evitar cambios concurrentes durante el arranque y las migraciones.

## Referencias

- [Ambientes y controles de despliegue de GitHub Actions](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments).
- [Configuración de variables y secretos en Docker Compose](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/).

La configuración remota y los objetivos de operación requieren valores y responsables reales; ningún secreto ni servidor ficticio se ha presentado como configurado.
