#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
sha=${1:-$(git rev-parse HEAD)}
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || { echo 'Se requiere SHA completo' >&2; exit 1; }
image="rbs-quality:$sha"
docker build --build-arg "REVISION=$sha" --tag "$image" .
bash scripts/test-release.sh "$image"
mkdir -p dist
docker save "$image" | gzip > dist/image.tar.gz
printf '%s\n' "$sha" > dist/revision
(cd dist && sha256sum image.tar.gz > SHA256SUMS)
tar -czf dist/release.tar.gz -C dist image.tar.gz SHA256SUMS revision -C .. deploy scripts
echo "Liberación validada: dist/release.tar.gz ($sha)"
