<?php

namespace App\Services\ServiceCatalog;

use App\Enums\ServiceStatus;
use App\Models\Service;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

/**
 * Servicio de Gestión de Servicios del Catálogo
 * 
 * Encapsula la lógica de negocio para los servicios de TI.
 * Un servicio es lo que los usuarios pueden solicitar a través del portal.
 * 
 * Responsabilidades:
 * - Listar servicios con filtros avanzados y paginación
 * - Mostrar catálogo público (solo servicios publicados)
 * - Crear servicios con slug autogenerado
 * - Actualizar servicios manteniendo trazabilidad
 * - Eliminar servicios
 * 
 * Cada operación de escritura guarda el usuario responsable.
 */
class ServiceManager
{
    /**
     * Listar servicios con filtros y paginación (para administración)
     * 
     * Soporta los siguientes filtros:
     * - status: string - Estado del servicio (enum ServiceStatus)
     * - priority: string - Prioridad (enum ServicePriority)
     * - category_id: int - ID de la categoría
     * - search: string - Busca en nombre, código y keywords
     * - per_page: int - Elementos por página (default: 15)
     * 
     * Incluye relaciones: category, subcategory, sla.
     * 
     * @param array $filters Filtros opcionales
     * @return LengthAwarePaginator Servicios paginados
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return Service::query()
            // Carga relaciones para evitar N+1 queries
            ->with(['category', 'subcategory', 'sla'])
            // Filtros opcionales
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['priority'] ?? null, fn ($query, $priority) => $query->where('priority', $priority))
            ->when($filters['category_id'] ?? null, fn ($query, $category) => $query->where('category_id', $category))
            // Búsqueda en múltiples campos
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('keywords', 'like', "%{$search}%");
                });
            })
            // Ordena por más reciente primero
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Listar catálogo público de servicios
     * 
     * Solo devuelve servicios con estado "Publicado".
     * Usado en el portal público para usuarios finales.
     * 
     * @param array $filters Filtros opcionales (no implementados aún)
     * @return Collection Servicios publicados ordenados por nombre
     */
    public function listPublicCatalog(array $filters = []): Collection
    {
        return Service::query()
            // Solo servicios publicados
            ->where('status', ServiceStatus::Published)
            ->with(['category', 'sla'])
            ->orderBy('name')
            ->get();
    }

    /**
     * Crear nuevo servicio
     * 
     * Genera automáticamente el slug si no se proporciona.
     * Registra el usuario creador para trazabilidad.
     * 
     * @param array $data Datos validados del servicio
     * @param User|null $user Usuario que crea el servicio
     * @return Service El servicio creado
     */
    public function store(array $data, ?User $user = null): Service
    {
        // Genera slug único: nombre-codigo (ej: "instalacion-software-srv001")
        $data['slug'] ??= Str::slug($data['name'] . '-' . $data['code']);
        // Guarda quién creó el servicio
        $data['created_by_id'] = $user?->id;
        $data['updated_by_id'] = $user?->id;
        
        return Service::create($data);
    }

    /**
     * Actualizar servicio existente
     * 
     * Regenera el slug si cambia el nombre o código.
     * Actualiza el usuario modificador para trazabilidad.
     * 
     * @param Service $service Servicio a actualizar
     * @param array $data Datos validados a actualizar
     * @param User|null $user Usuario que modifica
     * @return Service El servicio actualizado con relaciones frescas
     */
    public function update(Service $service, array $data, ?User $user = null): Service
    {
        // Regenera slug si cambian nombre o código
        if (isset($data['name']) || isset($data['code'])) {
            $name = $data['name'] ?? $service->name;
            $code = $data['code'] ?? $service->code;
            $data['slug'] = Str::slug($name . '-' . $code);
        }

        // Guarda quién modificó el servicio
        $data['updated_by_id'] = $user?->id;
        $service->update($data);

        // Devuelve con relaciones frescas para la respuesta
        return $service->fresh(['category', 'subcategory', 'sla']);
    }

    /**
     * Eliminar servicio
     * 
     * Las plantillas asociadas se eliminan en cascada.
     * Las solicitudes existentes conservan referencia histórica.
     * 
     * @param Service $service Servicio a eliminar
     */
    public function delete(Service $service): void
    {
        $service->delete();
    }
}
