#!/bin/sh
set -e

# ─── Esperar a que MySQL esté disponible ────────────────────────────────────
# En Railway/Docker, MySQL puede tardar más de 10 segundos en estar listo.
# Este bucle reintenta hasta 30 veces (60 segundos máximo) antes de rendirse.

echo "⏳ Esperando a que MySQL esté disponible..."

MAX_RETRIES=30
RETRY_INTERVAL=2
retries=0

until npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; do
  retries=$((retries + 1))
  if [ "$retries" -ge "$MAX_RETRIES" ]; then
    echo "❌ MySQL no respondió después de $((MAX_RETRIES * RETRY_INTERVAL)) segundos. Abortando."
    exit 1
  fi
  echo "   MySQL no disponible aún — reintento $retries/$MAX_RETRIES en ${RETRY_INTERVAL}s..."
  sleep "$RETRY_INTERVAL"
done

echo "✅ MySQL disponible."

# ─── Sincronizar esquema de base de datos ───────────────────────────────────
echo "🔄 Sincronizando esquema de base de datos con Prisma..."
npx prisma db push --skip-generate --accept-data-loss

echo "✅ Esquema sincronizado."

# ─── Arrancar el backend ────────────────────────────────────────────────────
echo "🚀 Iniciando el backend..."
exec "$@"
