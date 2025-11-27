<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo de Categoría del Catálogo de Servicios
 * 
 * Representa las categorías principales que agrupan los servicios de TI.
 * Ejemplos: "Hardware", "Software", "Redes", "Soporte", etc.
 * 
 * @property int $id Identificador único de la categoría
 * @property string $name Nombre de la categoría
 * @property string|null $description Descripción detallada de la categoría
 * @property bool $active Indica si la categoría está activa y visible
 * @property string|null $icon Icono de Lucide React para mostrar en la UI
 * @property string|null $color Color en formato hexadecimal para la UI
 * @property \Carbon\Carbon $created_at Fecha de creación
 * @property \Carbon\Carbon $updated_at Fecha de última actualización
 * 
 * @property-read \Illuminate\Database\Eloquent\Collection<Subcategory> $subcategories
 * @property-read \Illuminate\Database\Eloquent\Collection<Service> $services
 */
class Category extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos
     * Sigue la convención del módulo: catalogo_servicios_*
     */
    protected $table = 'catalogo_servicios_categorias';

    /**
     * Campos que se pueden asignar masivamente
     * Protege contra asignación masiva no autorizada
     */
    protected $fillable = [
        'name',
        'description',
        'active',
        'icon',
        'color',
    ];

    /**
     * Conversiones de tipos para atributos
     * Asegura que 'active' siempre sea booleano en PHP
     */
    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Relación: Una categoría tiene muchas subcategorías
     * 
     * @return HasMany Colección de subcategorías de esta categoría
     */
    public function subcategories(): HasMany
    {
        return $this->hasMany(Subcategory::class, 'category_id');
    }

    /**
     * Relación: Una categoría tiene muchos servicios
     * 
     * @return HasMany Colección de servicios directos de esta categoría
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'category_id');
    }
}
