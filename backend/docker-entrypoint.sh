#!/bin/bash
set -e

echo "🚀 Starting Laravel application..."

# Esperar a que la base de datos esté lista
echo "⏳ Waiting for database..."
sleep 5

# Generar clave de aplicación si no existe
if [ -z "$APP_KEY" ]; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
fi

# Limpiar solo caches de archivos (no de base de datos aún)
echo "🧹 Clearing file caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Ejecutar migraciones (fresh para limpiar todo primero)
echo "📊 Running migrations..."
php artisan migrate:fresh --force --no-interaction

# Ahora sí limpiar cache de base de datos (ya que las tablas existen)
echo "🧹 Clearing database cache..."
php artisan cache:clear 2>/dev/null || echo "Cache clear skipped (table may not exist yet)"

# Optimizar para producción
if [ "$APP_ENV" = "production" ]; then
    echo "⚡ Optimizing for production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

echo "✅ Application ready!"

# Ejecutar el comando CMD del Dockerfile
exec "$@"
