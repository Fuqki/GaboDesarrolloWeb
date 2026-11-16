#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
# Ejecutar desde el paquete de liberación ya extraído, con usuario autorizado para Docker.
root=${1:?Directorio de entorno}
[[ "$root" =~ ^/opt/rbs/(staging|production)$ ]] || exit 1
[[ -f "$root/settings.env" && -f "$root/secrets/jwt" ]] || { echo 'Preparar entorno primero' >&2; exit 1; }
exec 9>"$root/deploy.lock"
flock -n 9 || { echo 'Otro despliegue está activo' >&2; exit 1; }
sha=$(cat revision)
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || exit 1
sha256sum --check SHA256SUMS
docker load < image.tar.gz
image="rbs-quality:$sha"
[[ "$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image")" == "$sha" ]] || exit 1
# Antes de detener el servicio, comprobar que el paquete ejecuta sus pruebas.
bash scripts/test-release.sh "$image"
project="rbs-$(basename "$root")"
compose() { docker compose --project-name "$project" --env-file "$root/settings.env" --env-file "$root/release.env" -f "$root/compose.yml" "$@"; }
stamp=$(date -u +%Y%m%dT%H%M%SZ)
old=''
if [[ -f "$root/release.env" ]]; then
  old=$(cat "$root/release.env")
  compose stop app
fi
# Con todos los escritores detenidos, la copia conjunta incluye BD, WAL y planos.
# Si el backup falla, reanudar el servicio anterior sin tocar código ni datos.
resume_old() { if [[ -n "$old" ]]; then compose start app || true; fi; }
trap resume_old ERR
tar -czf "$root/backups/$stamp-$sha-data.tar.gz" -C "$root" data
sha256sum "$root/backups/$stamp-$sha-data.tar.gz" > "$root/backups/$stamp-$sha-data.tar.gz.sha256"
trap - ERR
failed() {
  compose stop app || true
  echo "Liberación fallida. Servicio detenido; respaldo: $root/backups/$stamp-$sha-data.tar.gz" >&2
  echo 'No se restaura la BD automáticamente. Verificar compatibilidad de esquema antes de revertir.' >&2
  exit 1
}
trap failed ERR
printf '%s\n' "$old" > "$root/previous.env"
if [[ -f "$root/compose.yml" ]]; then cp "$root/compose.yml" "$root/previous-compose.yml"; fi
cp deploy/compose.yml "$root/compose.yml"
printf 'RELEASE_IMAGE=%s\n' "$image" > "$root/release.env"
cp "$root/release.env" "$root/releases/$stamp-$sha.env"
compose up -d --wait --wait-timeout 90 app
compose exec -T app node scripts/smoke.mjs http://127.0.0.1:3001
printf '%s %s\n' "$stamp" "$sha" >> "$root/deployments.log"
echo "Despliegue correcto: $sha. Conservar respaldo externo y observar 15 minutos."
