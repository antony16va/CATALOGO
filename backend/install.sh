#!/bin/bash
# Script de instalación automatizada para Helix Service Desk Suite Backend

echo "🚀 Instalando Helix Service Desk Suite - Backend..."
echo ""

# Verificar si Composer está instalado
if ! command -v composer &> /dev/null; then
    echo "❌ ERROR: Composer no está instalado."
    echo "Por favor instala Composer desde: https://getcomposer.org/"
    exit 1
fi

# Verificar si PHP está instalado
if ! command -v php &> /dev/null; then
    echo "❌ ERROR: PHP no está instalado."
    exit 1
fi

# Verificar versión de PHP
PHP_VERSION=$(php -r "echo PHP_VERSION;")
echo "✓ PHP versión: $PHP_VERSION"

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias de Composer..."
composer install

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Falló la instalación de dependencias"
    exit 1
fi

# Verificar si existe .env
if [ ! -f .env ]; then
    echo ""
    echo "📄 Creando archivo .env..."
    cp .env.example .env
    echo "✓ Archivo .env creado"
else
    echo ""
    echo "⚠️  El archivo .env ya existe, no se sobrescribirá"
fi

# Generar clave de aplicación
echo ""
echo "🔑 Generando clave de aplicación..."
php artisan key:generate

# Solicitar configuración de base de datos
echo ""
echo "🗄️  Configuración de Base de Datos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "Nombre de la base de datos [helix_service_desk]: " DB_NAME
DB_NAME=${DB_NAME:-helix_service_desk}

read -p "Host de MySQL [127.0.0.1]: " DB_HOST
DB_HOST=${DB_HOST:-127.0.0.1}

read -p "Puerto de MySQL [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "Usuario de MySQL [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Contraseña de MySQL: " DB_PASS
echo ""

# Actualizar .env con las credenciales de base de datos
sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" .env
sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env
sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env

echo "✓ Configuración de base de datos actualizada"

# Crear base de datos si no existe
echo ""
echo "🗄️  Creando base de datos..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Base de datos '$DB_NAME' creada/verificada"
else
    echo "⚠️  No se pudo crear la base de datos automáticamente"
    echo "Por favor créala manualmente con:"
    echo "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
fi

# Ejecutar migraciones
echo ""
read -p "¿Deseas ejecutar las migraciones y cargar datos demo? [S/n]: " RUN_MIGRATIONS
RUN_MIGRATIONS=${RUN_MIGRATIONS:-S}

if [[ $RUN_MIGRATIONS =~ ^[Ss]$ ]]; then
    echo ""
    echo "🔧 Ejecutando migraciones..."
    php artisan migrate:fresh --seed --seeder=CatalogoDemoSeeder
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ ¡Instalación completada exitosamente!"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📊 Usuarios Demo Creados:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "👤 admin@helix.local / Secret#123 (Administrador)"
        echo "👤 analista@helix.local / Secret#123 (Administrador)"
        echo "👤 usuario.demo@helix.local / Secret#123 (Usuario)"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "🚀 Para iniciar el servidor ejecuta:"
        echo "   php artisan serve"
        echo ""
        echo "🌐 La API estará disponible en:"
        echo "   http://localhost:8000"
        echo ""
    else
        echo "❌ ERROR: Falló la ejecución de migraciones"
        echo "Verifica tu configuración de base de datos"
        exit 1
    fi
else
    echo ""
    echo "⏭️  Instalación completada (sin migraciones)"
    echo "Ejecuta manualmente:"
    echo "  php artisan migrate:fresh --seed --seeder=CatalogoDemoSeeder"
fi

echo "✨ ¡Listo para usar!"
