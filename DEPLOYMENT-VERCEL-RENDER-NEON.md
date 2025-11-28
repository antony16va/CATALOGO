# 🚀 Guía de Despliegue: Vercel + Render + Neon

Esta guía te ayudará a desplegar **Helix Service Desk** usando:
- **Vercel** para el frontend (Next.js)
- **Render** para el backend (Laravel con Docker)
- **Neon** para la base de datos PostgreSQL

---

## 📋 Pre-requisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Cuenta en [Render](https://render.com)
3. Cuenta en [Neon](https://neon.tech) o usar PostgreSQL de Render
4. Repositorio en GitHub con tu código
5. Git instalado localmente

---

## 🗄️ Paso 1: Configurar Base de Datos en Neon

### 1.1 Crear Proyecto en Neon

1. Ve a [https://console.neon.tech](https://console.neon.tech)
2. Click en **"Create Project"**
3. Configuración:
   - **Name**: `helix-service-desk`
   - **Region**: Selecciona la más cercana (ej: US East Ohio)
   - **PostgreSQL Version**: 16 (recomendado)
4. Click en **"Create Project"**

### 1.2 Obtener Credenciales de Conexión

Una vez creado el proyecto, Neon te mostrará la cadena de conexión:

```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Guarda estos datos:**
- `DB_HOST`: ep-xxx-xxx.us-east-2.aws.neon.tech
- `DB_PORT`: 5432
- `DB_DATABASE`: neondb (o el nombre que elegiste)
- `DB_USERNAME`: tu usuario
- `DB_PASSWORD`: tu contraseña
- `DB_SSLMODE`: require

---

## 🐳 Paso 2: Desplegar Backend en Render

### 2.1 Preparar Repositorio

Asegúrate de que estos archivos estén en tu repositorio:
- ✅ `backend/Dockerfile`
- ✅ `backend/docker-entrypoint.sh`
- ✅ `backend/render.yaml`
- ✅ `backend/.dockerignore`

### 2.2 Crear Servicio en Render

1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name**: `helix-service-desk-api`
   - **Region**: Oregon (o la más cercana a Neon)
   - **Branch**: `master` o `main`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `./`

### 2.3 Configurar Variables de Entorno

En la sección **Environment**, agrega estas variables:

```bash
# Aplicación
APP_NAME=Helix Service Desk
APP_ENV=production
APP_DEBUG=false
APP_KEY=          # Lo generarás después
LOG_LEVEL=error

# URLs (actualizar después de obtener las URLs reales)
APP_URL=https://helix-service-desk-api.onrender.com
FRONTEND_URL=https://tu-frontend.vercel.app

# Base de Datos (usar credenciales de Neon del Paso 1)
DB_CONNECTION=pgsql
DB_HOST=ep-xxx-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=tu-usuario-neon
DB_PASSWORD=tu-password-neon
DB_SSLMODE=require

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

### 2.4 Generar APP_KEY

Necesitas generar una clave para Laravel. Hay dos opciones:

**Opción A: Localmente**
```bash
cd backend
php artisan key:generate --show
```

**Opción B: Usar un generador online**
```
base64:RANDOM_STRING_DE_32_CARACTERES_AQUI=
```

Copia el resultado y agrégalo a la variable `APP_KEY` en Render.

### 2.5 Desplegar

1. Click en **"Create Web Service"**
2. Render comenzará a construir y desplegar tu aplicación
3. Espera a que el estado sea **"Live"** (puede tomar 5-10 minutos)
4. Anota la URL generada: `https://helix-service-desk-api.onrender.com`

### 2.6 Verificar Despliegue

Abre en tu navegador:
```
https://helix-service-desk-api.onrender.com/api/catalog/services
```

Deberías ver una respuesta JSON (aunque esté vacía si no hay datos).

---

## 🌐 Paso 3: Desplegar Frontend en Vercel

### 3.1 Preparar Repositorio

Asegúrate de que estos archivos estén en tu repositorio:
- ✅ `vercel.json`
- ✅ `.vercelignore`
- ✅ `.env.example`

### 3.2 Crear Proyecto en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Click en **"Add New"** → **"Project"**
3. Importa tu repositorio de GitHub
4. Configuración:
   - **Framework Preset**: Next.js (auto-detectado)
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.3 Configurar Variables de Entorno

En **Environment Variables**, agrega:

```bash
NEXT_PUBLIC_API_URL=https://helix-service-desk-api.onrender.com/api
```

**Importante**: Usa la URL real de Render del Paso 2.5

### 3.4 Desplegar

1. Click en **"Deploy"**
2. Vercel construirá y desplegará automáticamente
3. Espera a que termine (2-5 minutos)
4. Anota la URL generada: `https://tu-proyecto.vercel.app`

### 3.5 Actualizar CORS en Backend

Ahora que tienes la URL de Vercel, actualiza la variable de entorno en Render:

1. Ve a tu servicio en Render
2. En **Environment**, actualiza:
   ```
   FRONTEND_URL=https://tu-proyecto.vercel.app
   ```
3. Guarda y espera a que Render redespliege (automático)

---

## ✅ Paso 4: Verificación Final

### 4.1 Verificar Backend

Abre: `https://helix-service-desk-api.onrender.com/api/catalog/services`
- ✅ Debería responder con JSON
- ✅ No debería mostrar errores 500

### 4.2 Verificar Frontend

1. Abre: `https://tu-proyecto.vercel.app`
2. Intenta hacer login con las credenciales demo:
   - Email: `admin@helix.local`
   - Password: `Secret#123`
3. Verifica que:
   - ✅ La página carga correctamente
   - ✅ Puedes hacer login
   - ✅ El panel de administración funciona
   - ✅ No hay errores de CORS en la consola del navegador

### 4.3 Verificar Base de Datos

1. Ve a tu proyecto en Neon
2. Usa el **SQL Editor** para verificar que las tablas existen:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```
3. Deberías ver tablas como:
   - `catalogo_servicios_usuarios`
   - `catalogo_servicios_servicios`
   - `catalogo_servicios_categorias`
   - etc.

---

## 🔧 Configuración Adicional

### Dominios Personalizados

#### En Vercel:
1. Ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones de Vercel

#### En Render:
1. Ve a **Settings** → **Custom Domain**
2. Agrega tu dominio
3. Configura los registros DNS

No olvides actualizar las variables de entorno `APP_URL` y `FRONTEND_URL` con tus dominios personalizados.

### Cargar Datos Iniciales

Si necesitas cargar datos demo en producción:

1. Ve a Render → tu servicio → **Shell**
2. Ejecuta:
   ```bash
   php artisan db:seed --class=CatalogoDemoSeeder --force
   ```

---

## 🐛 Solución de Problemas Comunes

### Error: "SQLSTATE[08006] Connection refused"

**Causa**: No se puede conectar a la base de datos.

**Solución**:
1. Verifica las credenciales de Neon
2. Asegúrate de que `DB_SSLMODE=require` esté configurado
3. Verifica que `DB_CONNECTION=pgsql`

### Error: "CORS policy blocked"

**Causa**: El frontend no está permitido en CORS.

**Solución**:
1. Verifica que `FRONTEND_URL` en Render apunte a la URL correcta de Vercel
2. Asegúrate de que NO termine con `/` (slash final)
3. Espera a que Render redespliege después de cambiar la variable

### Error: "APP_KEY is not set"

**Causa**: Falta la clave de Laravel.

**Solución**:
1. Genera una nueva clave: `php artisan key:generate --show`
2. Agrégala en Render como `APP_KEY=base64:tu-clave-aqui`
3. Redespliega

### Error 500 en el Backend

**Causa**: Error de aplicación.

**Solución**:
1. Ve a Render → **Logs**
2. Revisa los logs de error
3. Usualmente son problemas de:
   - Migraciones no ejecutadas
   - Permisos de storage
   - Variables de entorno incorrectas

### Frontend muestra "Failed to fetch"

**Causa**: El frontend no puede conectarse al backend.

**Solución**:
1. Verifica que `NEXT_PUBLIC_API_URL` en Vercel sea correcto
2. Debe incluir `/api` al final
3. Ejemplo: `https://helix-service-desk-api.onrender.com/api`
4. Redespliega en Vercel después de cambiar

---

## 📊 Monitoreo

### Logs del Backend (Render)

```bash
# Ver logs en tiempo real
https://dashboard.render.com → Tu servicio → Logs
```

### Logs del Frontend (Vercel)

```bash
# Ver deployment logs
https://vercel.com → Tu proyecto → Deployments → [Last Deployment] → Logs
```

### Base de Datos (Neon)

```bash
# Ver queries y métricas
https://console.neon.tech → Tu proyecto → Monitoring
```

---

## 🔄 Actualizaciones

### Actualizar Backend

Los cambios en `master`/`main` se despliegan automáticamente en Render.

Para forzar un redespliegue:
1. Ve a Render → Tu servicio
2. Click en **"Manual Deploy"** → **"Deploy latest commit"**

### Actualizar Frontend

Los cambios en `master`/`main` se despliegan automáticamente en Vercel.

Para forzar un redespliegue:
1. Ve a Vercel → Tu proyecto
2. Click en **"Deployments"** → **"Redeploy"**

---

## 💰 Costos

| Servicio | Plan Gratuito | Límites |
|----------|---------------|---------|
| **Neon** | ✅ Free Tier | 3 proyectos, 0.5GB storage, 1 GB transfer |
| **Render** | ✅ Free Tier | 750 horas/mes, duerme después de 15 min inactividad |
| **Vercel** | ✅ Hobby | Ilimitado para uso personal, 100GB bandwidth |

**Nota**: En el plan gratuito de Render, el backend "duerme" después de 15 minutos de inactividad y tarda ~30 segundos en despertar en la primera petición.

---

## 🎉 ¡Listo!

Tu aplicación ahora está desplegada en producción:
- ✅ Frontend en Vercel
- ✅ Backend en Render
- ✅ Base de datos en Neon
- ✅ CORS configurado
- ✅ HTTPS habilitado automáticamente

**URLs finales:**
- Frontend: `https://tu-proyecto.vercel.app`
- Backend API: `https://helix-service-desk-api.onrender.com/api`

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en Render y Vercel
2. Verifica las variables de entorno
3. Consulta la documentación oficial:
   - [Vercel Docs](https://vercel.com/docs)
   - [Render Docs](https://render.com/docs)
   - [Neon Docs](https://neon.tech/docs)
