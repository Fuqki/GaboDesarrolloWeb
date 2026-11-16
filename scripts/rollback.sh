#!/usr/bin/env bash
set -Eeuo pipefail
root=${1:?Directorio de entorno}
[[ "$root" =~ ^/opt/rbs/(staging|production)$ ]] || exit 1
[[ ${2:-} == --schema-compatible ]] || { echo 'Validar esquema y pasar --schema-compatible; nunca restaura datos automáticamente' >&2; exit 1; }
exec 9>"$root/deploy.lock"; flock -n 9
grep -Eq '^RELEASE_IMAGE=rbs-quality:[0-9a-f]{40}$' "$root/previous.env"
compose() { docker compose -p "rbs-$(basename "$root")" --env-file "$root/settings.env" --env-file "$root/release.env" -f "$root/compose.yml" "$@"; }
compose stop app
cp "$root/previous.env" "$root/release.env"
if [[ -f "$root/previous-compose.yml" ]]; then cp "$root/previous-compose.yml" "$root/compose.yml"; fi
compose up -d --wait --wait-timeout 90 app
compose exec -T app node scripts/smoke.mjs http://127.0.0.1:3001
echo 'Código revertido; datos conservados. Registrar incidente y versión.'
