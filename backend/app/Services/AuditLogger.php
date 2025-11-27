<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * Servicio de Registro de Auditoría
 * 
 * Proporciona una interfaz simple para registrar todas las acciones
 * importantes del sistema en el log de auditoría.
 * 
 * Uso recomendado:
 * Inyectar este servicio en los controladores y llamar al método log()
 * después de cada operación CRUD exitosa.
 * 
 * Información registrada:
 * - Módulo: Área del sistema (Autenticación, Categorías, Servicios, etc.)
 * - Acción: Operación realizada (Crear, Actualizar, Eliminar, Login, etc.)
 * - Usuario: Quién realizó la acción
 * - Modelo afectado: Tabla e ID del registro modificado
 * - Cambios: Datos antes/después (opcional)
 * - Contexto: IP y User-Agent del cliente
 * 
 * @example
 * // En un controlador
 * $this->auditLogger->log(
 *     module: 'Categorías',
 *     action: 'Crear',
 *     user: $request->user(),
 *     model: $category,
 * );
 */
class AuditLogger
{
    /**
     * Registrar una acción en el log de auditoría
     * 
     * @param string $module Módulo del sistema (ej: "Categorías", "Servicios", "SLA")
     * @param string $action Acción realizada (ej: "Crear", "Actualizar", "Eliminar")
     * @param User|null $user Usuario que realizó la acción (null si es sistema)
     * @param Model|null $model Modelo Eloquent afectado (para extraer tabla e ID)
     * @param array|null $changes Cambios realizados en formato ['antes' => ..., 'después' => ...]
     * @param Request|null $request Request HTTP para extraer IP y User-Agent
     * @param string|null $description Descripción adicional de la acción
     */
    public function log(
        string $module,
        string $action,
        ?User $user = null,
        ?Model $model = null,
        ?array $changes = null,
        ?Request $request = null,
        ?string $description = null,
    ): void {
        AuditLog::create([
            // Información de la acción
            'module' => $module,
            'action' => $action,
            'description' => $description,
            
            // Usuario responsable
            'user_id' => $user?->getKey(),
            
            // Modelo afectado (extrae tabla e ID automáticamente)
            'affected_table' => $model?->getTable(),
            'affected_id' => $model?->getKey(),
            
            // Cambios realizados (JSON)
            'changes' => $changes,
            
            // Contexto de la petición
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
