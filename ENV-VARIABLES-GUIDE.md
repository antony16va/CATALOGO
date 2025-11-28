# 🔐 Guía Completa de Variables de Entorno

Esta guía documenta **todas** las variables de entorno necesarias para el proyecto Helix Service Desk.

---

## 📋 Índice

1. [Frontend (Next.js - Vercel)](#frontend-nextjs---vercel)
2. [Backend (Laravel - Render)](#backend-laravel---render)
3. [Base de Datos (Neon/PostgreSQL)](#base-de-datos-neonpostgresql)
4. [Checklist de Configuración](#checklist-de-configuración)

---

## 🌐 Frontend (Next.js - Vercel)

### Variables Requeridas

| Variable | Descripción | Ejemplo Desarrollo | Ejemplo Producción |
|----------|-------------|-------------------|-------------------|
| `NEXT_PUBLIC_API_URL` | URL del backend API | `http://localhost:8000/api` | `https://helix-api.onrender.com/api` |

### Variables Opcionales

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `NEXT_PUBLIC_APP_NAME` | Nombre de la aplicación | `"Helix Service Desk"` |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | ID de Analytics de Vercel | - |

### Archivo: `.env.local` (Desarrollo)

```bash
# API URL - Backend local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### En Vercel Dashboard (Producción)

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega:

```
Name: NEXT_PUBLIC_API_URL
Value: https://tu-backend.onrender.com/api
Environments: Production, Preview, Development
```

**⚠️ Importante**:
- La URL debe terminar con `/api`
- NO incluir `/` al final después de `api`
- Debe ser la URL pública de tu backend en Render

---

## 🔧 Backend (Laravel - Render)

### Variables de Aplicación

| Variable | Requerida | Descripción | Valor Desarrollo | Valor Producción |
|----------|-----------|-------------|------------------|------------------|
| `APP_NAME` | ✅ | Nombre de la app | `"Helix Service Desk"` | `"Helix Service Desk"` |
| `APP_ENV` | ✅ | Entorno | `local` | `production` |
| `APP_KEY` | ✅ | Clave de encriptación | Generar con `php artisan key:generate` | `base64:...` |
| `APP_DEBUG` | ✅ | Modo debug | `true` | `false` |
| `APP_URL` | ✅ | URL del backend | `http://localhost:8000` | `https://tu-backend.onrender.com` |
| `FRONTEND_URL` | ✅ | URL del frontend para CORS | `http://localhost:3000` | `https://tu-frontend.vercel.app` |

### Variables de Base de Datos

| Variable | Requerida | Descripción | Valor Desarrollo | Valor Producción |
|----------|-----------|-------------|------------------|------------------|
| `DB_CONNECTION` | ✅ | Tipo de BD | `mysql` | `pgsql` |
| `DB_HOST` | ✅ | Host de BD | `127.0.0.1` | `ep-xxx.neon.tech` |
| `DB_PORT` | ✅ | Puerto | `3306` (MySQL) | `5432` (PostgreSQL) |
| `DB_DATABASE` | ✅ | Nombre de BD | `helix_service_desk` | `helix_service_desk` |
| `DB_USERNAME` | ✅ | Usuario de BD | `root` | `tu_usuario_neon` |
| `DB_PASSWORD` | ✅ | Contraseña | (vacío en dev) | `tu_password_neon` |
| `DB_SSLMODE` | Solo PostgreSQL | Modo SSL | - | `require` |

### Variables de Sesión y Caché

| Variable | Requerida | Descripción | Valor Recomendado |
|----------|-----------|-------------|-------------------|
| `SESSION_DRIVER` | ✅ | Driver de sesión | `database` |
| `CACHE_STORE` | ✅ | Driver de caché | `database` |
| `QUEUE_CONNECTION` | ✅ | Driver de colas | `database` |

### Variables de Logs

| Variable | Requerida | Descripción | Valor Desarrollo | Valor Producción |
|----------|-----------|-------------|------------------|------------------|
| `LOG_CHANNEL` | ✅ | Canal de logs | `stack` | `stack` |
| `LOG_LEVEL` | ✅ | Nivel de logs | `debug` | `error` |

### Archivo: `backend/.env` (Desarrollo)

```bash
APP_NAME="Helix Service Desk"
APP_ENV=local
APP_KEY=base64:TU_CLAVE_GENERADA_AQUI
APP_DEBUG=true
APP_URL=http://localhost:8000

FRONTEND_URL=http://localhost:3000

APP_LOCALE=en
APP_FALLBACK_LOCALE=en

LOG_CHANNEL=stack
LOG_LEVEL=debug

# MySQL para desarrollo
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=helix_service_desk
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

### En Render Dashboard (Producción)

1. Ve a tu servicio Web en Render
2. **Environment** → **Add Environment Variable**
3. Agrega cada una de estas:

```bash
# Aplicación
APP_NAME=Helix Service Desk
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:GENERA_UNA_NUEVA_CLAVE
APP_URL=https://tu-servicio.onrender.com
FRONTEND_URL=https://tu-frontend.vercel.app

# Logs
LOG_CHANNEL=stack
LOG_LEVEL=error

# Base de Datos PostgreSQL (Neon)
DB_CONNECTION=pgsql
DB_HOST=ep-xxx-xxx-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_DATABASE=helix_service_desk
DB_USERNAME=tu_usuario_neon
DB_PASSWORD=tu_password_neon
DB_SSLMODE=require

# Sesión y Caché
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

**⚠️ Importante sobre APP_KEY**:

Para generar la clave, ejecuta localmente:
```bash
cd backend
php artisan key:generate --show
```

Copia el resultado completo (ej: `base64:abc123...`) y úsalo en Render.

---

## 🗄️ Base de Datos (Neon/PostgreSQL)

### Desde Neon Dashboard

Cuando creas un proyecto en Neon, te dan una cadena de conexión como:

```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

Descomponla así:

```bash
DB_HOST=ep-xxx-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_DATABASE=dbname
DB_USERNAME=username
DB_PASSWORD=password
DB_SSLMODE=require
```

### Alternativa: PostgreSQL de Render

Si usas PostgreSQL interno de Render (en lugar de Neon), en `render.yaml`:

```yaml
databases:
  - name: helix-service-desk-db
    databaseName: helix_service_desk
    user: helix_user
```

Render auto-configura estas variables:
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`

Solo necesitas configurar manualmente:
```bash
DB_CONNECTION=pgsql
DB_SSLMODE=require
```

---

## ✅ Checklist de Configuración

### Antes de Desplegar

- [ ] Has generado `APP_KEY` para producción
- [ ] Has creado la base de datos en Neon
- [ ] Tienes las credenciales de Neon (host, user, password)
- [ ] Has configurado `.env.local` en tu máquina
- [ ] El proyecto funciona localmente con estas variables

### En Vercel

- [ ] Proyecto importado desde GitHub
- [ ] Variable `NEXT_PUBLIC_API_URL` configurada
- [ ] Build completado exitosamente
- [ ] Deployment en estado "Ready"

### En Render

- [ ] Servicio Web creado con Docker
- [ ] Todas las variables de `APP_*` configuradas
- [ ] Todas las variables de `DB_*` configuradas
- [ ] `FRONTEND_URL` apunta a Vercel
- [ ] Build completado exitosamente
- [ ] Servicio en estado "Live"

### Después del Despliegue

- [ ] Backend responde en `/api/health` o `/api/catalog/services`
- [ ] Frontend carga correctamente
- [ ] No hay errores de CORS en consola del navegador
- [ ] Puedes hacer login con usuario demo
- [ ] Las tablas existen en la base de datos de Neon

---

## 🔍 Verificación de Variables

### Verificar Frontend (Vercel)

En la consola del navegador:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Debe mostrar: https://tu-backend.onrender.com/api
```

### Verificar Backend (Render)

En el Shell de Render:
```bash
php artisan config:show app

# Verifica:
# - APP_ENV: production
# - APP_DEBUG: false
# - APP_URL: tu URL de Render
```

### Verificar Conexión a Base de Datos (Render)

```bash
php artisan tinker
>>> DB::connection()->getPdo();
# Si no hay error, la conexión funciona ✅
```

---

## 🐛 Errores Comunes

### "APP_KEY is not set"

**Solución**: Genera la clave y agrégala en Render:
```bash
php artisan key:generate --show
```

### "CORS policy blocked"

**Solución**: Verifica que `FRONTEND_URL` en Render coincida EXACTAMENTE con la URL de Vercel:
- ✅ Correcto: `https://tu-app.vercel.app`
- ❌ Incorrecto: `https://tu-app.vercel.app/`
- ❌ Incorrecto: `http://tu-app.vercel.app` (debe ser https)

### "Connection refused" o "Database error"

**Solución**: Verifica las credenciales de Neon:
1. Ve a Neon Console
2. Copia la cadena de conexión actualizada
3. Actualiza las variables `DB_*` en Render
4. Asegúrate de incluir `DB_SSLMODE=require`

### "Failed to fetch" en el frontend

**Solución**: Verifica `NEXT_PUBLIC_API_URL`:
- ✅ Debe terminar con `/api`
- ✅ Debe ser la URL pública de Render
- ✅ Debe usar `https://`

---

## 📝 Plantilla Rápida

### Para copiar en Render:

```
APP_NAME=Helix Service Desk
APP_ENV=production
APP_DEBUG=false
APP_KEY=GENERAR_CON_php_artisan_key:generate
APP_URL=REEMPLAZAR_CON_TU_URL_DE_RENDER
FRONTEND_URL=REEMPLAZAR_CON_TU_URL_DE_VERCEL
LOG_CHANNEL=stack
LOG_LEVEL=error
DB_CONNECTION=pgsql
DB_HOST=REEMPLAZAR_CON_NEON_HOST
DB_PORT=5432
DB_DATABASE=helix_service_desk
DB_USERNAME=REEMPLAZAR_CON_NEON_USERNAME
DB_PASSWORD=REEMPLAZAR_CON_NEON_PASSWORD
DB_SSLMODE=require
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

### Para copiar en Vercel:

```
NEXT_PUBLIC_API_URL=REEMPLAZAR_CON_TU_URL_DE_RENDER/api
```

---

## 🎉 ¡Todo Configurado!

Si has seguido esta guía y configurado todas las variables correctamente, tu aplicación debería funcionar en producción sin problemas.

**Última verificación**:
1. ✅ Frontend carga → Las variables de Vercel están bien
2. ✅ Backend responde → Las variables de Render están bien
3. ✅ Puedes hacer login → La base de datos está conectada
4. ✅ No hay errores CORS → FRONTEND_URL está correcto
