# 🚀 Guía de Inicio Rápido (Quickstart)

Esta guía te ayudará a poner en marcha el proyecto **Helix Service Desk Suite** en tu entorno local.

## 📋 Requisitos Previos

Asegúrate de tener instalado lo siguiente:

1.  **Node.js** (v18 o superior) y `npm`.
2.  **PHP** (v8.2 o superior) y `Composer`.
3.  **MariaDB** (o MySQL).


## 🛠️ Paso 1: Base de Datos (MariaDB)

El backend necesita una base de datos para funcionar.

1.  **Iniciar el servicio de base de datos**:
    *   Si usas **XAMPP**: Abre el panel de control y dale "Start" a **MySQL**.
    *   Si usas **Laragon**: Dale "Iniciar Todo".
    *   Si lo instalaste manualmente (Windows): Abre `services.msc`, busca "MariaDB" o "MySQL" e inícialo.
    *   Desde terminal (si está en el PATH): `mysqld` o `net start mariadb`.

2.  **Crear la base de datos**:
    Abre tu cliente de base de datos favorito (HeidiSQL, phpMyAdmin, DBeaver o terminal) y ejecuta:

    ```sql
    CREATE DATABASE helix_service_desk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```

---

## 🔙 Paso 2: Backend (Laravel)

El backend es el cerebro de la aplicación. Debe estar corriendo para que el frontend funcione.

1.  Abre una terminal y ve a la carpeta `backend`:
    ```bash
    cd backend
    ```

2.  **Instalar dependencias de Laravel** (solo la primera vez):
    Abre una terminal, navega a la carpeta backend y ejecuta:
    ```bash
    cd backend
    composer install
    ```

3.  **Configurar entorno**:
    *   Copia el archivo de ejemplo: `cp .env.example .env` (o cópialo manualmente).
    *   Abre el archivo `.env` y configura tus credenciales de base de datos:
        ```ini
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3307          # Puerto común en MariaDB (o 3306)
        DB_DATABASE=helix_service_desk
        DB_USERNAME=root
        DB_PASSWORD=mariadb2025 # Contraseña vista en tus capturas
        ```
        *Nota: Laravel usa el driver `mysql` para conectar tanto a MySQL como a MariaDB.*

4.  **Preparar la aplicación** (solo la primera vez):
    ```bash
    php artisan key:generate
    php artisan migrate --seed --seeder=CatalogoDemoSeeder
    ```
    *(Esto crea las tablas y carga usuarios de prueba)*.

5.  **Ejecutar el servidor**:
    ```bash
    php artisan serve
    ```
    ✅ El backend estará corriendo en: `http://127.0.0.1:8000`


## 🎨 Paso 3: Frontend (Next.js)

El frontend es la interfaz visual que verás en el navegador.

1.  Abre **otra terminal nueva** (no cierres la del backend) y ve a la raíz del proyecto:
    ```bash
    cd "c:\trabajos\service desk"
    ```

2.  **Instalar dependencias de Next.js** (solo la primera vez):
    Abre otra terminal, navega a la raíz del proyecto y ejecuta:
    ```bash
    cd "c:\trabajos\service desk"
    npm install
    ```

3.  **Ejecutar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    ✅ El frontend estará corriendo en: `http://localhost:3000`


## 🌐 Paso 4: ¡Usar la App!

1.  Abre tu navegador y ve a: **[http://localhost:3000](http://localhost:3000)**
2.  Inicia sesión con las credenciales de prueba:

    | Rol | Email | Contraseña |
    | :--- | :--- | :--- |
    | **Administrador** | `admin@helix.local` | `Secret#123` |
    | **Usuario** | `usuario.demo@helix.local` | `Secret#123` |


## 🆘 Solución de Problemas Comunes

*   **Error "Connection Refused"**: Asegúrate de que el backend (`php artisan serve`) esté corriendo en una terminal separada.
*   **Error de Base de Datos**: Verifica que el servicio de MariaDB esté iniciado y que las credenciales en `backend/.env` sean correctas.
*   **Pantalla en blanco**: Revisa la consola del navegador (F12) y la terminal del frontend para ver errores.
