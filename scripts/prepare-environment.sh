#!/usr/bin/env bash
set -Eeuo pipefail
# Ejecutar una vez con sudo. Docker Engine, Compose v2 y proxy TLS son prerrequisitos.
[[ $EUID -eq 0 ]] || { echo 'Ejecutar con sudo' >&2; exit 1; }
environment=${1:?staging o production}
origin=${2:?Origen HTTPS}
owner=${3:-${SUDO_USER:-}}
[[ "$environment" =~ ^(staging|production)$ ]] || exit 1
[[ "$origin" =~ ^https://[a-zA-Z0-9.-]+(:[0-9]+)?$ ]] || { echo 'Origen HTTPS inválido' >&2; exit 1; }
[[ -n "$owner" && "$owner" != root ]] || { echo 'Indicar usuario de despliegue no root' >&2; exit 1; }
id "$owner" >/dev/null
docker compose version
root="/opt/rbs/$environment"
install -d -m 750 -o "$owner" "$root" "$root/backups" "$root/releases"
install -d -m 755 -o 1000 -g 1000 "$root/data" "$root/data/uploads" "$root/data/uploads/blueprints"
install -d -m 755 -o "$owner" "$root/secrets"
if [[ ! -e "$root/secrets/jwt" ]]; then
  openssl rand -hex 48 > "$root/secrets/jwt"
  chown 1000:1000 "$root/secrets/jwt"
  chmod 400 "$root/secrets/jwt"
fi
if [[ ! -e "$root/settings.env" ]]; then
  port=3001; [[ "$environment" == staging ]] && port=3002
  printf 'APP_PORT=%s\nCORS_ORIGIN=%s\n' "$port" "$origin" > "$root/settings.env"
  chown "$owner" "$root/settings.env"; chmod 600 "$root/settings.env"
fi
echo "Entorno preparado en $root. Configurar proxy HTTPS; no se iniciaron servicios ni se reemplazaron secretos."
