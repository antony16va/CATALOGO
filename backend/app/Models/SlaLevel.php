<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo de Nivel de SLA (Service Level Agreement)
 * 
 * Define los acuerdos de nivel de servicio que establecen
 * los tiempos máximos de respuesta y resolución para las solicitudes.
 * 
 * @property int $id Identificador único del nivel SLA
 * @property string $name Nombre del nivel (ej: "Crítico", "Alto", "Normal")
 * @property string|null $description Descripción del nivel de servicio
 * @property int $first_response_minutes Tiempo máximo para primera respuesta en minutos
 * @property int $resolution_minutes Tiempo máximo para resolución en minutos
 * @property string|null $pause_conditions Condiciones bajo las cuales se pausa el SLA
 * @property bool $active Indica si el nivel SLA está activo
 * @property \Carbon\Carbon $created_at Fecha de creación
 * @property \Carbon\Carbon $updated_at Fecha de última actualización
 * 
 * @property-read \Illuminate\Database\Eloquent\Collection<Service> $services
 */
class SlaLevel extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'catalogo_servicios_sla_niveles';

    /**
     * Campos que se pueden asignar masivamente
     */
    protected $fillable = [
        'name',
        'description',
        'first_response_minutes',
        'resolution_minutes',
        'pause_conditions',
        'active',
    ];

    /**
     * Conversiones de tipos para atributos
     * Los tiempos se manejan como enteros (minutos)
     */
    protected $casts = [
        'first_response_minutes' => 'integer',
        'resolution_minutes' => 'integer',
        'active' => 'boolean',
    ];

    /**
     * Relación: Un nivel SLA se aplica a muchos servicios
     * 
     * @return HasMany Colección de servicios con este SLA
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'sla_id');
    }
}
