FROM php:8.2-apache

# Instala extensiones necesarias para Laravel y bases de datos comunes (MySQL/MariaDB y Postgres)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    default-mysql-client \
    postgresql-client \
    unzip \
    git \
    zip \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql bcmath gd zip \
    && a2enmod rewrite

# Instala Composer desde la imagen oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copia el contenido del backend
COPY . /var/www/html/

# Crea directorios y ajusta permisos
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Instala dependencias y prepara la app
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Configuración de Apache (el puerto se configurará en runtime)
RUN echo '<VirtualHost *:__PORT__>\n\
    ServerName _\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        Options -Indexes +FollowSymLinks\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Script de inicio para ejecutar migraciones
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE ${PORT:-80}

# Arranca con el script de entrada
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
