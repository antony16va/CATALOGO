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

# Limpiar caches
echo "🧹 Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Ejecutar migraciones
echo "📊 Running migrations..."
php artisan migrate --force --no-interaction

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
