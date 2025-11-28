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

# Configurar Apache para usar el puerto correcto
export APACHE_PORT=${PORT:-80}

# Actualizar ports.conf para escuchar en el puerto correcto
sed -i "s/Listen 80/Listen ${APACHE_PORT}/" /etc/apache2/ports.conf

# Actualizar VirtualHost para usar el puerto correcto
sed -i "s/__PORT__/${APACHE_PORT}/g" /etc/apache2/sites-available/000-default.conf

echo "🌐 Apache will listen on port ${APACHE_PORT}"

# Ejecutar el comando CMD del Dockerfile
exec "$@"
