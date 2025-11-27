<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

/**
 * Modelo de Usuario del Sistema
 * 
 * Representa a los usuarios que interactúan con el Service Desk.
 * Utiliza Laravel Sanctum para autenticación vía API tokens.
 * 
 * Roles disponibles:
 * - Administrador: Acceso total al sistema
 * - Analista: Gestiona solicitudes y catálogo
 * - Usuario: Solo puede crear solicitudes
 * 
 * @property int $id Identificador único del usuario
 * @property string $username Nombre de usuario único para login
 * @property string $email Correo electrónico único
 * @property string $password Contraseña hasheada automáticamente
 * @property string $full_name Nombre completo del usuario
 * @property UserRole $role Rol del usuario (Enum PHP)
 * @property bool $active Indica si la cuenta está activa
 * @property \Carbon\Carbon|null $last_accessed_at Último acceso al sistema
 * @property \Carbon\Carbon $created_at Fecha de registro
 * @property \Carbon\Carbon $updated_at Fecha de última actualización
 * 
 * @property-read \Illuminate\Database\Eloquent\Collection<Service> $createdServices
 * @property-read \Illuminate\Database\Eloquent\Collection<Service> $updatedServices
 * @property-read \Illuminate\Database\Eloquent\Collection<ServiceRequest> $requests
 * @property-read \Illuminate\Database\Eloquent\Collection<AuditLog> $auditLogs
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'catalogo_servicios_usuarios';

    /**
     * Campos que se pueden asignar masivamente
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'full_name',
        'role',
        'active',
        'last_accessed_at',
    ];

    /**
     * Campos ocultos en serialización JSON
     * Por seguridad, nunca exponemos la contraseña ni el token
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Conversiones de tipos para atributos
     * - role usa Enum PHP para type-safety
     * - password se hashea automáticamente al asignar
     */
    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'active' => 'boolean',
            'last_accessed_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relación: Servicios creados por este usuario
     * 
     * @return HasMany Servicios donde es el creador original
     */
    public function createdServices(): HasMany
    {
        return $this->hasMany(Service::class, 'created_by_id');
    }

    /**
     * Relación: Servicios actualizados por este usuario
     * 
     * @return HasMany Servicios donde es el último editor
     */
    public function updatedServices(): HasMany
    {
        return $this->hasMany(Service::class, 'updated_by_id');
    }

    /**
     * Relación: Solicitudes realizadas por este usuario
     * 
     * @return HasMany Solicitudes de servicio del usuario
     */
    public function requests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class, 'user_id');
    }

    /**
     * Relación: Registros de auditoría del usuario
     * 
     * @return HasMany Acciones registradas en el log de auditoría
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'user_id');
    }
}
