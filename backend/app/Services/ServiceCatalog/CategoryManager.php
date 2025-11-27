<?php

namespace App\Services\ServiceCatalog;

use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Servicio de Gestión de Categorías
 * 
 * Encapsula toda la lógica de negocio relacionada con categorías
 * y subcategorías del catálogo de servicios.
 * 
 * Este servicio se inyecta en el controlador para mantener
 * los controladores delgados y la lógica de negocio testeable.
 * 
 * Responsabilidades:
 * - Listar categorías con filtros y paginación
 * - Crear, actualizar y eliminar categorías
 * - Gestionar subcategorías dentro de categorías
 */
class CategoryManager
{
    /**
     * Listar categorías con filtros y paginación
     * 
     * Soporta los siguientes filtros:
     * - active: bool - Filtra por estado activo/inactivo
     * - search: string - Busca por nombre (LIKE)
     * - per_page: int - Elementos por página (default: 15)
     * 
     * Siempre incluye el conteo de servicios por categoría.
     * 
     * @param array $filters Filtros opcionales
     * @return LengthAwarePaginator Categorías paginadas
     */
    public function listCategories(array $filters = []): LengthAwarePaginator
    {
        return Category::query()
            // Filtro por estado activo (si se proporciona)
            ->when(isset($filters['active']), fn ($query) => $query->where('active', $filters['active']))
            // Filtro de búsqueda por nombre
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            // Incluye conteo de servicios en cada categoría
            ->withCount('services')
            // Ordena alfabéticamente
            ->orderBy('name')
            // Pagina resultados
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Crear nueva categoría
     * 
     * @param array $data Datos validados de la categoría
     * @return Category La categoría creada
     */
    public function createCategory(array $data): Category
    {
        return Category::create($data);
    }

    /**
     * Actualizar categoría existente
     * 
     * @param Category $category Categoría a actualizar
     * @param array $data Datos validados a actualizar
     * @return Category La categoría actualizada
     */
    public function updateCategory(Category $category, array $data): Category
    {
        $category->update($data);

        return $category;
    }

    /**
     * Eliminar categoría
     * 
     * ADVERTENCIA: Esto elimina la categoría y sus subcategorías.
     * Los servicios asociados quedarán con category_id = null.
     * 
     * @param Category $category Categoría a eliminar
     */
    public function deleteCategory(Category $category): void
    {
        $category->delete();
    }

    /**
     * Listar subcategorías de una categoría
     * 
     * @param Category $category Categoría padre
     * @return Collection Subcategorías ordenadas por nombre
     */
    public function listSubcategories(Category $category): Collection
    {
        return $category->subcategories()->orderBy('name')->get();
    }

    /**
     * Crear o actualizar subcategoría
     * 
     * Método "upsert" que sirve para crear o actualizar.
     * Si se pasa una subcategoría existente, la actualiza.
     * Si no, crea una nueva.
     * 
     * @param Category $category Categoría padre
     * @param array $data Datos validados de la subcategoría
     * @param Subcategory|null $subcategory Subcategoría existente (para actualizar)
     * @return Subcategory La subcategoría creada o actualizada
     */
    public function upsertSubcategory(Category $category, array $data, ?Subcategory $subcategory = null): Subcategory
    {
        // Asegura que la subcategoría pertenezca a la categoría
        $payload = array_merge($data, ['category_id' => $category->id]);

        // Si existe, actualiza; si no, crea
        if ($subcategory) {
            $subcategory->update($payload);
            return $subcategory;
        }

        return Subcategory::create($payload);
    }

    /**
     * Eliminar subcategoría
     * 
     * Los servicios asociados quedarán con subcategory_id = null.
     * 
     * @param Subcategory $subcategory Subcategoría a eliminar
     */
    public function deleteSubcategory(Subcategory $subcategory): void
    {
        $subcategory->delete();
    }
}
