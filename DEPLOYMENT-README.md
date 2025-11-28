# 🚀 Guía Rápida de Despliegue

## 📚 Documentación Disponible

Este proyecto incluye documentación completa para el despliegue en producción:

### 📄 Documentos Principales

1. **[DEPLOYMENT-VERCEL-RENDER-NEON.md](./DEPLOYMENT-VERCEL-RENDER-NEON.md)**
   - Guía paso a paso completa
   - Configuración de Vercel + Render + Neon
   - Solución de problemas comunes
   - **👉 COMIENZA AQUÍ**

2. **[ENV-VARIABLES-GUIDE.md](./ENV-VARIABLES-GUIDE.md)**
   - Todas las variables de entorno necesarias
   - Ejemplos para desarrollo y producción
   - Checklist de verificación
   - Plantillas listas para copiar/pegar

3. **[PROBLEMAS-IDIOMAS-MIXTOS.md](./PROBLEMAS-IDIOMAS-MIXTOS.md)**
   - Explicación del problema de español/inglés
   - Impacto en el despliegue
   - Soluciones propuestas
   - Recomendaciones

4. **[DEPLOYMENT.md](./DEPLOYMENT.md)**
   - Guía de despliegue tradicional
   - Configuración de servidores propios
   - Nginx, Apache, PM2

---

## ⚡ Inicio Rápido

### Prerrequisitos

- [ ] Cuenta en Vercel
- [ ] Cuenta en Render
- [ ] Cuenta en Neon
- [ ] Código en GitHub
- [ ] 30 minutos de tiempo

### Pasos Resumidos

1. **Crear base de datos en Neon**
   - Proyecto nuevo → PostgreSQL
   - Guardar credenciales

2. **Desplegar backend en Render**
   - New Web Service → Docker
   - Configurar variables de entorno
   - Esperar despliegue (5-10 min)

3. **Desplegar frontend en Vercel**
   - Import from GitHub
   - Configurar `NEXT_PUBLIC_API_URL`
   - Deploy (2-5 min)

4. **Verificar**
   - Frontend carga ✅
   - Backend responde ✅
   - Login funciona ✅

---

## 📁 Archivos de Configuración

El proyecto ya incluye todos los archivos necesarios:

### Frontend (Raíz del proyecto)
```
✅ vercel.json          - Configuración de Vercel
✅ .vercelignore        - Archivos a ignorar
✅ .env.example         - Variables de ejemplo
✅ .env.local           - Variables de desarrollo (no commitear)
✅ .env.production.example - Template para producción
```

### Backend (Carpeta `backend/`)
```
✅ Dockerfile           - Imagen Docker para Render
✅ docker-entrypoint.sh - Script de inicio
✅ render.yaml          - Configuración de Render
✅ .dockerignore        - Archivos a ignorar en build
✅ .env.example         - Variables de ejemplo
✅ .env.production.example - Template para producción
```

---

## 🎯 Stack de Despliegue

| Componente | Servicio | Plan | Costo |
|------------|----------|------|-------|
| **Frontend** | Vercel | Hobby | Gratis |
| **Backend** | Render | Free Tier | Gratis |
| **Base de Datos** | Neon | Free Tier | Gratis |

**Total**: $0/mes (con limitaciones del plan gratuito)

---

## 🔑 Variables de Entorno Clave

### Vercel (Frontend)
```bash
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com/api
```

### Render (Backend)
```bash
APP_KEY=base64:GENERAR_CON_php_artisan_key:generate
APP_URL=https://tu-backend.onrender.com
FRONTEND_URL=https://tu-frontend.vercel.app

DB_CONNECTION=pgsql
DB_HOST=tu-host.neon.tech
DB_PORT=5432
DB_DATABASE=helix_service_desk
DB_USERNAME=tu-usuario
DB_PASSWORD=tu-password
DB_SSLMODE=require
```

👉 **Ver [ENV-VARIABLES-GUIDE.md](./ENV-VARIABLES-GUIDE.md) para la lista completa**

---

## ⚠️ Problemas Conocidos

### 1. Idiomas Mixtos (Español/Inglés)

El proyecto usa valores en español en los enums:
- `'Borrador'`, `'Publicado'`, `'Administrador'`, etc.

**Impacto**: Funciona correctamente pero no es estándar.

**Solución**:
- Para despliegue inmediato: Mantener como está ✅
- Para largo plazo: Normalizar a inglés (ver [PROBLEMAS-IDIOMAS-MIXTOS.md](./PROBLEMAS-IDIOMAS-MIXTOS.md))

### 2. Render Free Tier se "duerme"

El backend en plan gratuito de Render se suspende después de 15 minutos de inactividad.

**Impacto**: Primera petición tarda ~30 segundos en responder.

**Solución**:
- Usar plan pago de Render ($7/mes)
- O aceptar el delay inicial

### 3. PostgreSQL vs MySQL

Desarrollo usa MySQL, producción usa PostgreSQL.

**Impacto**: Diferencias menores en sintaxis SQL.

**Solución**:
- Las migraciones de Laravel son compatibles ✅
- Probado y funciona correctamente

---

## 🧪 Testing del Despliegue

### Verificar Backend

```bash
# Debe responder con JSON
curl https://tu-backend.onrender.com/api/catalog/services
```

### Verificar Frontend

1. Abre `https://tu-frontend.vercel.app`
2. Login con:
   - Email: `admin@helix.local`
   - Password: `Secret#123`
3. Verifica que no hay errores CORS

### Verificar Base de Datos

En Neon SQL Editor:
```sql
SELECT COUNT(*) FROM catalogo_servicios_usuarios;
```

---

## 📊 URLs Finales

Después del despliegue, tendrás:

```
Frontend:  https://tu-proyecto.vercel.app
Backend:   https://tu-backend.onrender.com
API:       https://tu-backend.onrender.com/api
Database:  [Neon Dashboard]
```

Guarda estas URLs en un lugar seguro.

---

## 🔄 Actualizaciones

### Despliegue Automático

Ambos servicios (Vercel y Render) están configurados para:
- ✅ Desplegar automáticamente cuando haces `git push` a `master`
- ✅ Ejecutar migraciones automáticamente (Render)
- ✅ Limpiar caché automáticamente (Render)

### Despliegue Manual

**Vercel**:
1. Dashboard → Tu proyecto → Deployments
2. Click en "Redeploy"

**Render**:
1. Dashboard → Tu servicio → Manual Deploy
2. Click en "Deploy latest commit"

---

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa los logs**:
   - Render: Dashboard → Tu servicio → Logs
   - Vercel: Dashboard → Tu proyecto → Deployments → [Last] → Logs

2. **Consulta la documentación**:
   - [DEPLOYMENT-VERCEL-RENDER-NEON.md](./DEPLOYMENT-VERCEL-RENDER-NEON.md) - Solución de problemas comunes
   - [ENV-VARIABLES-GUIDE.md](./ENV-VARIABLES-GUIDE.md) - Errores de configuración

3. **Verifica variables de entorno**:
   - Todas configuradas ✅
   - Sin typos ✅
   - URLs correctas ✅

---

## 📝 Checklist Pre-Despliegue

Antes de comenzar, asegúrate de tener:

- [ ] Código commiteado y pusheado a GitHub
- [ ] `backend/.env` funcionando localmente
- [ ] `.env.local` funcionando localmente
- [ ] Migraciones ejecutadas localmente sin errores
- [ ] Login funciona localmente
- [ ] Credenciales de Neon listas
- [ ] 30-45 minutos disponibles

---

## 🎉 ¡Listo para Desplegar!

Sigue la guía completa: **[DEPLOYMENT-VERCEL-RENDER-NEON.md](./DEPLOYMENT-VERCEL-RENDER-NEON.md)**

El proceso completo toma aproximadamente **30-45 minutos** la primera vez.

---

## 🔗 Enlaces Útiles

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Render Dashboard](https://dashboard.render.com/)
- [Neon Console](https://console.neon.tech/)
- [GitHub Repo](https://github.com/tu-usuario/tu-repo)

---

**Última actualización**: 2025-01-27
**Versión**: 1.0
