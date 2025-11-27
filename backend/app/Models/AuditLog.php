<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo de Log de Auditoría
 * 
 * Registra todas las acciones importantes realizadas en el sistema.
 * Permite rastrear quién hizo qué, cuándo y desde dónde.
 * 
 * Módulos auditados:
 * - Autenticación: Login, Logout, Registro
 * - Categorías: Crear, Actualizar, Eliminar
 * - Servicios: Crear, Actualizar, Eliminar, Publicar
 * - SLA: Crear, Actualizar, Eliminar
 * - Usuarios: Crear, Actualizar, Desactivar
 * 
 * @property int $id Identificador único del registro
 * @property int|null $user_id FK al usuario que realizó la acción
 * @property string $module Módulo del sistema (ej: "Categorías", "Servicios")
 * @property string $action Acción realizada (ej: "Crear", "Actualizar")
 * @property string|null $description Descripción adicional de la acción
 * @property string|null $affected_table Tabla afectada por la acción
 * @property int|null $affected_id ID del registro afectado
 * @property array|null $changes Cambios realizados (antes/después) en JSON
 * @property string|null $ip_address Dirección IP del cliente
 * @property string|null $user_agent Navegador/cliente usado
 * @property \Carbon\Carbon $created_at Fecha y hora de la acción
 * @property \Carbon\Carbon $updated_at Fecha de última actualización
 * 
 * @property-read User|null $user Usuario que realizó la acción
 */
class AuditLog extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'catalogo_servicios_auditoria';

    /**
     * Campos que se pueden asignar masivamente
     */
    protected $fillable = [
        'user_id',
        'module',
        'action',
        'description',
        'affected_table',
        'affected_id',
        'changes',
        'ip_address',
        'user_agent',
    ];

    /**
     * Conversiones de tipos para atributos
     * - changes se almacena como JSON y se convierte a array PHP
     */
    protected $casts = [
        'changes' => 'array',
    ];

    /**
     * Relación: El registro de auditoría pertenece a un usuario
     * 
     * @return BelongsTo El usuario que ejecutó la acción (puede ser null si fue el sistema)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
