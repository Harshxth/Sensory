#!/usr/bin/env bash
# Push .env.local entries to Vercel project across all environments.
set -euo pipefail

ENV_FILE="${1:-.env.local}"
ENVS=(production preview development)

while IFS= read -r line; do
  case "$line" in
    ''|\#*) continue ;;
  esac
  key="${line%%=*}"
  value="${line#*=}"
  if [ -z "$key" ] || [ -z "$value" ]; then
    continue
  fi
  for env in "${ENVS[@]}"; do
    vercel env add "$key" "$env" --value "$value" --yes --force >/dev/null 2>&1 \
      && echo "  ok   $key -> $env" \
      || echo "  fail $key -> $env"
  done
done < "$ENV_FILE"
