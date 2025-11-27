# 🔧 Helix Service Desk Suite - Backend API

Backend desarrollado en Laravel 12 para el sistema de gestión de servicios Helix Service Desk Suite.

## 📋 Requisitos Previos

- PHP >= 8.2
- Composer
- MySQL >= 8.0 / MariaDB >= 10.3
- Extensiones PHP requeridas:
  - PDO MySQL
  - OpenSSL
  - Mbstring
  - Tokenizer
  - XML
  - JSON
  - Ctype
  - BCMath

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
composer install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Editar `.env` y configurar la base de datos:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=helix_service_desk
DB_USERNAME=root
DB_PASSWORD=tu_contraseña_aqui
```

### 3. Generar Clave de Aplicación

```bash
php artisan key:generate
```

### 4. Crear Base de Datos

Desde la consola de MySQL:

```sql
CREATE DATABASE helix_service_desk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

O usando el CLI:

```bash
mysql -u root -p -e "CREATE DATABASE helix_service_desk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 5. Ejecutar Migraciones

```bash
# Ejecutar todas las migraciones
php artisan migrate
```

### 6. Cargar Datos de Demostración

```bash
# Cargar el catálogo completo con datos demo
php artisan db:seed --class=CatalogoDemoSeeder
```

O ejecutar todo en un solo comando (recrea las tablas):

```bash
php artisan migrate:fresh --seed --seeder=CatalogoDemoSeeder
```

### 7. Iniciar Servidor de Desarrollo

```bash
php artisan serve
```

La API estará disponible en: `http://localhost:8000`

## 📊 Estructura de Base de Datos

El sistema incluye las siguientes tablas:

- **users** - Usuarios del sistema
- **categories** - Categorías de servicios
- **subcategories** - Subcategorías de servicios
- **services** - Catálogo de servicios
- **service_templates** - Plantillas de formularios
- **template_fields** - Campos de las plantillas
- **sla_levels** - Niveles de SLA
- **service_requests** - Solicitudes de servicio
- **audit_logs** - Registro de auditoría

## 👥 Usuarios Demo

El seeder crea los siguientes usuarios:

| Email | Usuario | Contraseña | Rol |
|-------|---------|------------|-----|
| admin@helix.local | admin | Secret#123 | Administrador |
| analista@helix.local | analista | Secret#123 | Administrador |
| usuario.demo@helix.local | usuario.demo | Secret#123 | Usuario |

## 🔌 Endpoints API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/user` - Usuario autenticado

### Servicios
- `GET /api/services` - Listar servicios
- `POST /api/services` - Crear servicio
- `GET /api/services/{id}` - Obtener servicio
- `PUT /api/services/{id}` - Actualizar servicio
- `DELETE /api/services/{id}` - Eliminar servicio

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `GET /api/categories/{id}` - Obtener categoría
- `PUT /api/categories/{id}` - Actualizar categoría
- `DELETE /api/categories/{id}` - Eliminar categoría

### Plantillas
- `GET /api/templates` - Listar plantillas
- `POST /api/templates` - Crear plantilla
- `GET /api/templates/{id}` - Obtener plantilla
- `PUT /api/templates/{id}` - Actualizar plantilla
- `DELETE /api/templates/{id}` - Eliminar plantilla

### Solicitudes
- `GET /api/requests` - Listar solicitudes
- `POST /api/requests` - Crear solicitud
- `GET /api/requests/{id}` - Obtener solicitud
- `PUT /api/requests/{id}` - Actualizar solicitud

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/{id}` - Obtener usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

## 🧪 Testing

```bash
# Ejecutar tests
php artisan test

# Ejecutar tests con cobertura
php artisan test --coverage
```

## 🔧 Comandos Útiles

```bash
# Limpiar caché
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ver rutas disponibles
php artisan route:list

# Ver lista de comandos
php artisan list

# Acceder a tinker (consola interactiva)
php artisan tinker
```

## 📦 Deployment en Producción

### 1. Configurar .env para producción

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com

DB_CONNECTION=mysql
DB_HOST=tu-servidor-db
DB_PORT=3306
DB_DATABASE=helix_service_desk
DB_USERNAME=usuario_produccion
DB_PASSWORD=contraseña_segura
```

### 2. Optimizar aplicación

```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan db:seed --class=CatalogoDemoSeeder --force
```

### 3. Configurar permisos

```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## 🔒 Seguridad

- Las contraseñas se encriptan con bcrypt
- Tokens de API con Sanctum
- Protección CSRF
- Validación de datos en todas las requests
- Rate limiting en endpoints sensibles

## 📚 Documentación Adicional

- [Laravel Documentation](https://laravel.com/docs)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/schema.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**CiaphasC**
- GitHub: [@CiaphasC](https://github.com/CiaphasC)

---

⚡ Desarrollado con Laravel 12
