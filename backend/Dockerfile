FROM php:8.2-apache

# Instala extensiones necesarias para Laravel y bases de datos comunes (MySQL/MariaDB y Postgres)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    default-mysql-client \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql \
    && a2enmod rewrite

# Instala Composer desde la imagen oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copia el contenido del backend (el contexto de build debe ser la carpeta backend)
COPY . /var/www/html/

# Instala dependencias y prepara la app
RUN composer install --no-dev --optimize-autoloader && \
    if [ ! -f .env ]; then cp .env.example .env; fi && \
    php artisan key:generate && \
    php artisan config:clear

# Configuración básica de Apache para Laravel
RUN echo '<VirtualHost *:80>\n\
    ServerName _\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

EXPOSE 80

# Arranca Apache en primer plano
CMD ["apache2-foreground"]
