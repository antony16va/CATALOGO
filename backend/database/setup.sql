-- ============================================
-- Script de creación de base de datos
-- Helix Service Desk Suite
-- ============================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS helix_service_desk 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE helix_service_desk;

-- Crear usuario para la aplicación (opcional, para producción)
-- CREATE USER IF NOT EXISTS 'helix_user'@'localhost' IDENTIFIED BY 'SecurePassword#2024';
-- GRANT ALL PRIVILEGES ON helix_service_desk.* TO 'helix_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Verificar la creación
SELECT 
    SCHEMA_NAME,
    DEFAULT_CHARACTER_SET_NAME,
    DEFAULT_COLLATION_NAME
FROM 
    information_schema.SCHEMATA
WHERE 
    SCHEMA_NAME = 'helix_service_desk';
