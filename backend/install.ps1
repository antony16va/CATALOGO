# Script de instalación automatizada para Helix Service Desk Suite Backend
# PowerShell Script

Write-Host "🚀 Instalando Helix Service Desk Suite - Backend..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Composer está instalado
if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERROR: Composer no está instalado." -ForegroundColor Red
    Write-Host "Por favor instala Composer desde: https://getcomposer.org/"
    exit 1
}

# Verificar si PHP está instalado
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERROR: PHP no está instalado." -ForegroundColor Red
    exit 1
}

# Verificar versión de PHP
$phpVersion = php -r "echo PHP_VERSION;"
Write-Host "✓ PHP versión: $phpVersion" -ForegroundColor Green

# Instalar dependencias
Write-Host ""
Write-Host "📦 Instalando dependencias de Composer..." -ForegroundColor Yellow
composer install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Falló la instalación de dependencias" -ForegroundColor Red
    exit 1
}

# Verificar si existe .env
if (-not (Test-Path .env)) {
    Write-Host ""
    Write-Host "📄 Creando archivo .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  El archivo .env ya existe, no se sobrescribirá" -ForegroundColor Yellow
}

# Generar clave de aplicación
Write-Host ""
Write-Host "🔑 Generando clave de aplicación..." -ForegroundColor Yellow
php artisan key:generate

# Solicitar configuración de base de datos
Write-Host ""
Write-Host "🗄️  Configuración de Base de Datos" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$dbName = Read-Host "Nombre de la base de datos [helix_service_desk]"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "helix_service_desk" }

$dbHost = Read-Host "Host de MySQL [127.0.0.1]"
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "127.0.0.1" }

$dbPort = Read-Host "Puerto de MySQL [3306]"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "3306" }

$dbUser = Read-Host "Usuario de MySQL [root]"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "root" }

$dbPass = Read-Host "Contraseña de MySQL" -AsSecureString
$dbPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPass))

# Actualizar .env con las credenciales de base de datos
$envContent = Get-Content .env
$envContent = $envContent -replace "DB_DATABASE=.*", "DB_DATABASE=$dbName"
$envContent = $envContent -replace "DB_HOST=.*", "DB_HOST=$dbHost"
$envContent = $envContent -replace "DB_PORT=.*", "DB_PORT=$dbPort"
$envContent = $envContent -replace "DB_USERNAME=.*", "DB_USERNAME=$dbUser"
$envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$dbPassPlain"
$envContent | Set-Content .env

Write-Host "✓ Configuración de base de datos actualizada" -ForegroundColor Green

# Crear base de datos si no existe
Write-Host ""
Write-Host "🗄️  Creando base de datos..." -ForegroundColor Yellow

$createDbQuery = "CREATE DATABASE IF NOT EXISTS ``$dbName`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

try {
    if ([string]::IsNullOrWhiteSpace($dbPassPlain)) {
        mysql -h $dbHost -P $dbPort -u $dbUser -e $createDbQuery 2>$null
    } else {
        mysql -h $dbHost -P $dbPort -u $dbUser -p"$dbPassPlain" -e $createDbQuery 2>$null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Base de datos '$dbName' creada/verificada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No se pudo crear la base de datos automáticamente" -ForegroundColor Yellow
        Write-Host "Por favor créala manualmente con:"
        Write-Host "CREATE DATABASE $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️  MySQL CLI no disponible o credenciales incorrectas" -ForegroundColor Yellow
    Write-Host "Por favor crea la base de datos manualmente"
}

# Ejecutar migraciones
Write-Host ""
$runMigrations = Read-Host "¿Deseas ejecutar las migraciones y cargar datos demo? [S/n]"
if ([string]::IsNullOrWhiteSpace($runMigrations)) { $runMigrations = "S" }

if ($runMigrations -match "^[Ss]$") {
    Write-Host ""
    Write-Host "🔧 Ejecutando migraciones..." -ForegroundColor Yellow
    php artisan migrate:fresh --seed --seeder=CatalogoDemoSeeder
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ¡Instalación completada exitosamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "📊 Usuarios Demo Creados:" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "👤 admin@helix.local / Secret#123 (Administrador)" -ForegroundColor White
        Write-Host "👤 analista@helix.local / Secret#123 (Administrador)" -ForegroundColor White
        Write-Host "👤 usuario.demo@helix.local / Secret#123 (Usuario)" -ForegroundColor White
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🚀 Para iniciar el servidor ejecuta:" -ForegroundColor Yellow
        Write-Host "   php artisan serve" -ForegroundColor White
        Write-Host ""
        Write-Host "🌐 La API estará disponible en:" -ForegroundColor Yellow
        Write-Host "   http://localhost:8000" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "❌ ERROR: Falló la ejecución de migraciones" -ForegroundColor Red
        Write-Host "Verifica tu configuración de base de datos"
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "⏭️  Instalación completada (sin migraciones)" -ForegroundColor Yellow
    Write-Host "Ejecuta manualmente:"
    Write-Host "  php artisan migrate:fresh --seed --seeder=CatalogoDemoSeeder" -ForegroundColor White
}

Write-Host ""
Write-Host "✨ ¡Listo para usar!" -ForegroundColor Green
