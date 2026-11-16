#!/usr/bin/env bash
set -Eeuo pipefail
image=${1:?Indicar imagen}
# Las pruebas siempre usan directorios temporales; nunca montan datos reales.
docker run --rm --read-only --tmpfs /tmp --entrypoint node "$image" --test server/tests/release.test.js
name="rbs-test-$$"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
secret=$(openssl rand -hex 48)
docker run -d --name "$name" --read-only --tmpfs /tmp \
  -e "JWT_SECRET=$secret" -e DB_PATH=/tmp/test.db -e UPLOAD_DIR=/tmp/uploads "$image" >/dev/null
for attempt in $(seq 1 30); do
  if docker exec "$name" node scripts/smoke.mjs http://127.0.0.1:3001; then exit 0; fi
  sleep 2
done
docker logs "$name"
exit 1
