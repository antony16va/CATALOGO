# 🚀 Guía de Deployment - Helix Service Desk Suite

## 📋 Checklist Pre-Deployment

### Backend (Laravel)
- [ ] Variables de entorno configuradas para producción
- [ ] Base de datos creada en servidor de producción
- [ ] Migraciones ejecutadas
- [ ] Datos iniciales cargados (seeders)
- [ ] Permisos de archivos configurados
- [ ] Optimizaciones aplicadas (cache)
- [ ] CORS configurado correctamente
- [ ] SSL/TLS configurado

### Frontend (Next.js)
- [ ] Variables de entorno configuradas
- [ ] URL del API backend configurada
- [ ] Aplicación construida para producción
- [ ] Assets optimizados
- [ ] SSL/TLS configurado

## 🔧 Deployment Backend (Laravel)

### 1. Servidor de Producción

#### Requisitos del Servidor
- Ubuntu 22.04 LTS (recomendado) o similar
- PHP 8.2+
- MySQL 8.0+ / MariaDB 10.3+
- Nginx o Apache
- Composer
- Node.js 18+ (para compilar assets si es necesario)

#### Instalar Dependencias

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar PHP y extensiones
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring \
    php8.2-xml php8.2-bcmath php8.2-curl php8.2-zip php8.2-gd

# Instalar Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Instalar MySQL
sudo apt install -y mysql-server

# Instalar Nginx
sudo apt install -y nginx
```

### 2. Configurar Aplicación

```bash
# Clonar repositorio
git clone https://github.com/CiaphasC/Helix-Service-Desk-Suite.git
cd Helix-Service-Desk-Suite/backend

# Instalar dependencias (sin dev)
composer install --no-dev --optimize-autoloader

# Configurar .env
cp .env.example .env
nano .env
```

**Configuración .env para producción:**

```env
APP_NAME="Helix Service Desk"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.tudominio.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=helix_service_desk
DB_USERNAME=helix_user
DB_PASSWORD=ContraseñaSegura123!

SESSION_DRIVER=database
QUEUE_CONNECTION=database

CACHE_STORE=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

```bash
# Generar clave
php artisan key:generate

# Crear base de datos
mysql -u root -p

# En MySQL:
CREATE DATABASE helix_service_desk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'helix_user'@'localhost' IDENTIFIED BY 'ContraseñaSegura123!';
GRANT ALL PRIVILEGES ON helix_service_desk.* TO 'helix_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Ejecutar migraciones
php artisan migrate --force

# Cargar datos iniciales
php artisan db:seed --class=CatalogoDemoSeeder --force

# Optimizar aplicación
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Configurar permisos
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 3. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/helix-api
```

```nginx
server {
    listen 80;
    server_name api.tudominio.com;
    root /var/www/Helix-Service-Desk-Suite/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/helix-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d api.tudominio.com

# Renovación automática ya está configurada
```

## 🌐 Deployment Frontend (Next.js)

### Opción 1: Vercel (Recomendado)

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno:
   ```
   NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
   ```
3. Despliega automáticamente

### Opción 2: Servidor Propio con PM2

```bash
# En el servidor
cd Helix-Service-Desk-Suite

# Instalar dependencias
npm install

# Configurar .env.local
echo "NEXT_PUBLIC_API_URL=https://api.tudominio.com/api" > .env.local

# Construir aplicación
npm run build

# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start npm --name "helix-frontend" -- start

# Guardar configuración PM2
pm2 save
pm2 startup
```

### Configurar Nginx para Frontend

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/helix-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configurar SSL
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

## 🔄 Actualizaciones

### Backend

```bash
cd /var/www/Helix-Service-Desk-Suite/backend
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo systemctl restart php8.2-fpm
```

### Frontend

```bash
cd /var/www/Helix-Service-Desk-Suite
git pull origin main
npm install
npm run build
pm2 restart helix-frontend
```

## 🔒 Seguridad Adicional

### Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Backups Automatizados

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-helix.sh
```

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backup/helix"

# Backup de base de datos
mysqldump -u helix_user -p'ContraseñaSegura123!' helix_service_desk > "$BACKUP_DIR/db_$TIMESTAMP.sql"

# Backup de archivos
tar -czf "$BACKUP_DIR/files_$TIMESTAMP.tar.gz" /var/www/Helix-Service-Desk-Suite

# Limpiar backups antiguos (más de 30 días)
find $BACKUP_DIR -type f -mtime +30 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-helix.sh

# Configurar cron
sudo crontab -e
# Agregar: 0 2 * * * /usr/local/bin/backup-helix.sh
```

## 📊 Monitoreo

### Logs

```bash
# Backend Laravel
tail -f storage/logs/laravel.log

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PHP-FPM
tail -f /var/log/php8.2-fpm.log
```

### Performance

```bash
# Ver procesos de PM2
pm2 monit

# Ver estado de servicios
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mysql
```

## 🆘 Troubleshooting

### Error 500 en API
```bash
# Ver logs
tail -f storage/logs/laravel.log

# Verificar permisos
sudo chown -R www-data:www-data storage bootstrap/cache
```

### Frontend no conecta con Backend
- Verificar CORS en backend
- Verificar variable `NEXT_PUBLIC_API_URL`
- Verificar firewall y SSL

### Base de datos lenta
```bash
# Optimizar tablas
php artisan db:seed --class=OptimizeDatabaseSeeder
```

---

✅ **Deployment completado con éxito!**
