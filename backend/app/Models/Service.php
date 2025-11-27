<?php

namespace App\Models;

use App\Enums\ServicePriority;
use App\Enums\ServiceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Modelo de Servicio del Catálogo de Servicios de TI
 * 
 * Representa un servicio individual que los usuarios pueden solicitar.
 * Cada servicio pertenece a una categoría, puede tener subcategoría,
 * y tiene un nivel de SLA asociado.
 * 
 * @property int $id Identificador único del servicio
 * @property string $code Código único del servicio (ej: "SRV-001")
 * @property string $name Nombre descriptivo del servicio
 * @property string $slug URL amigable generada automáticamente
 * @property string|null $description Descripción detallada del servicio
 * @property int $category_id FK a la categoría padre
 * @property int|null $subcategory_id FK a la subcategoría (opcional)
 * @property int|null $sla_id FK al nivel de SLA aplicable
 * @property ServicePriority $priority Prioridad por defecto (baja, media, alta, crítica)
 * @property ServiceStatus $status Estado del servicio (borrador, publicado, archivado)
 * @property string|null $keywords Palabras clave para búsqueda (separadas por coma)
 * @property array|null $metadata Datos adicionales en formato JSON
 * @property \Carbon\Carbon|null $published_at Fecha de publicación
 * @property int|null $created_by_id Usuario que creó el servicio
 * @property int|null $updated_by_id Usuario que actualizó el servicio
 * 
 * @property-read Category $category Categoría del servicio
 * @property-read Subcategory|null $subcategory Subcategoría del servicio
 * @property-read SlaLevel|null $sla Nivel de SLA asociado
 * @property-read \Illuminate\Database\Eloquent\Collection<ServiceTemplate> $templates
 * @property-read \Illuminate\Database\Eloquent\Collection<ServiceRequest> $requests
 */
class Service extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'catalogo_servicios_servicios';

    /**
     * Campos que se pueden asignar masivamente
     */
    protected $fillable = [
        'code',
        'name',
        'slug',
        'description',
        'category_id',
        'subcategory_id',
        'sla_id',
        'priority',
        'status',
        'keywords',
        'metadata',
        'published_at',
        'created_by_id',
        'updated_by_id',
    ];

    /**
     * Conversiones de tipos para atributos
     * - priority y status usan Enums de PHP 8.1+
     * - metadata se convierte automáticamente a/desde JSON
     */
    protected $casts = [
        'priority' => ServicePriority::class,
        'status' => ServiceStatus::class,
        'metadata' => 'array',
        'published_at' => 'datetime',
    ];

    /**
     * Eventos del modelo
     * 
     * Al crear un servicio, genera automáticamente el slug
     * si no se proporciona uno.
     */
    protected static function booted(): void
    {
        static::creating(function (Service $service): void {
            // Genera slug único: nombre-servicio-abc123
            $service->slug ??= Str::slug($service->name . '-' . Str::random(6));
        });
    }

    /**
     * Relación: El servicio pertenece a una categoría
     * 
     * @return BelongsTo La categoría padre del servicio
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Relación: El servicio puede pertenecer a una subcategoría
     * 
     * @return BelongsTo La subcategoría del servicio (opcional)
     */
    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class, 'subcategory_id');
    }

    /**
     * Relación: El servicio tiene un nivel de SLA
     * 
     * @return BelongsTo El SLA que define tiempos de respuesta/resolución
     */
    public function sla(): BelongsTo
    {
        return $this->belongsTo(SlaLevel::class, 'sla_id');
    }

    /**
     * Relación: El servicio puede tener múltiples plantillas de formulario
     * 
     * @return HasMany Las plantillas de solicitud para este servicio
     */
    public function templates(): HasMany
    {
        return $this->hasMany(ServiceTemplate::class, 'service_id');
    }

    /**
     * Relación: El servicio tiene muchas solicitudes
     * 
     * @return HasMany Las solicitudes realizadas para este servicio
     */
    public function requests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class, 'service_id');
    }

    /**
     * Relación: Usuario que creó el servicio
     * 
     * @return BelongsTo El usuario creador
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /**
     * Relación: Usuario que actualizó el servicio por última vez
     * 
     * @return BelongsTo El usuario que hizo la última modificación
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_id');
    }
}
