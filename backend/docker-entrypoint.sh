#!/bin/sh
set -e

# ─── Esperar a que MySQL esté disponible ────────────────────────────────────
# En Railway/Docker, MySQL puede tardar más de 10 segundos en estar listo.
# Este bucle reintenta hasta 30 veces (60 segundos máximo) antes de rendirse.

echo "⏳ Esperando a que MySQL esté disponible..."

MAX_RETRIES=30
RETRY_INTERVAL=2
retries=0

until echo "SELECT 1;" | npx prisma db execute --stdin > /dev/null 2>&1; do
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

# ─── Seed Automático (Solo si la base de datos está vacía) ────────────────
echo "🔍 Verificando si es necesario inicializar datos (seed)..."
USER_COUNT=$(echo "SELECT COUNT(*) FROM \`users\`;" | npx prisma db execute --stdin | grep -o '[0-9]*' | tail -1 || echo "0")
if [ "$USER_COUNT" -eq "0" ]; then
  echo "🌱 Base de datos vacía. Ejecutando seed inicial..."
  npx prisma db seed
  echo "✅ Seed completado."
else
  echo "ℹ️ Base de datos ya contiene datos ($USER_COUNT usuarios). Saltando seed."
fi

# ─── Arrancar el backend ────────────────────────────────────────────────────
echo "🚀 Iniciando el backend..."
exec "$@"
