<?php

namespace App\Http\Controllers\API;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Requests\SubcategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\SubcategoryResource;
use App\Models\Category;
use App\Models\Subcategory;
use App\Services\AuditLogger;
use App\Services\ServiceCatalog\CategoryManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador de Categorías del Catálogo de Servicios
 * 
 * Gestiona las operaciones CRUD para categorías y sus subcategorías.
 * Las categorías son el primer nivel de organización del catálogo de servicios.
 * 
 * Endpoints disponibles:
 * - GET    /categories          → Lista paginada de categorías
 * - GET    /categories/public   → Lista pública (solo activas, para usuarios)
 * - POST   /categories          → Crear nueva categoría
 * - GET    /categories/{id}     → Ver detalle de categoría
 * - PUT    /categories/{id}     → Actualizar categoría
 * - DELETE /categories/{id}     → Eliminar categoría
 * 
 * Subcategorías:
 * - GET    /categories/{id}/subcategories      → Listar subcategorías
 * - POST   /categories/{id}/subcategories      → Crear subcategoría
 * - PUT    /categories/{id}/subcategories/{id} → Actualizar subcategoría
 * - DELETE /subcategories/{id}                 → Eliminar subcategoría
 */
class CategoryController extends Controller
{
    /**
     * Constructor con inyección de dependencias
     * 
     * @param CategoryManager $manager Servicio de lógica de negocio para categorías
     * @param AuditLogger $auditLogger Servicio para registro de auditoría
     */
    public function __construct(
        private readonly CategoryManager $manager,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    /**
     * Listar categorías (paginado)
     * 
     * Devuelve lista paginada de categorías con conteo de servicios.
     * Soporta filtros: active, search, per_page.
     * 
     * @param Request $request Parámetros de filtrado y paginación
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        $categories = $this->manager->listCategories($request->all());

        return CategoryResource::collection($categories);
    }

    /**
     * Listar categorías públicas
     * 
     * Devuelve solo categorías activas ordenadas por nombre.
     * Usado en el portal público para usuarios finales.
     * 
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function publicIndex()
    {
        $categories = Category::query()
            ->where('active', true)
            ->withCount('services')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * Crear nueva categoría
     * 
     * Crea una categoría y registra la acción en auditoría.
     * Solo administradores pueden crear categorías.
     * 
     * @param CategoryRequest $request Datos validados de la categoría
     * @return CategoryResource La categoría creada
     */
    public function store(CategoryRequest $request): CategoryResource
    {
        // SEGURIDAD: Solo administradores pueden crear categorías
        if ($request->user() && $request->user()->role !== UserRole::Administrator) {
            abort(403, 'Solo los administradores pueden crear categorías.');
        }

        // Delega la creación al manager
        $category = $this->manager->createCategory($request->validated());

        // Registra en auditoría
        $this->auditLogger->log(
            module: 'Categorías',
            action: 'Crear',
            user: $request->user(),
            model: $category,
        );

        return new CategoryResource($category);
    }

    /**
     * Ver detalle de categoría
     * 
     * Devuelve la categoría con sus subcategorías cargadas.
     * 
     * @param Category $category Categoría (inyectada por route model binding)
     * @return CategoryResource Detalle de la categoría
     */
    public function show(Category $category): CategoryResource
    {
        return new CategoryResource($category->load('subcategories'));
    }

    /**
     * Actualizar categoría
     * 
     * Actualiza los datos de la categoría y registra en auditoría.
     * Solo administradores pueden actualizar categorías.
     * 
     * @param CategoryRequest $request Datos validados a actualizar
     * @param Category $category Categoría a actualizar
     * @return CategoryResource La categoría actualizada
     */
    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        // SEGURIDAD: Solo administradores pueden actualizar categorías
        if ($request->user() && $request->user()->role !== UserRole::Administrator) {
            abort(403, 'Solo los administradores pueden actualizar categorías.');
        }

        $category = $this->manager->updateCategory($category, $request->validated());

        $this->auditLogger->log(
            module: 'Categorías',
            action: 'Actualizar',
            user: $request->user(),
            model: $category,
        );

        return new CategoryResource($category);
    }

    /**
     * Eliminar categoría
     * 
     * Elimina la categoría y todas sus subcategorías en cascada.
     * Los servicios asociados quedarán sin categoría.
     * Solo administradores pueden eliminar categorías.
     * 
     * @param Request $request Request para obtener el usuario
     * @param Category $category Categoría a eliminar
     * @return JsonResponse 204 No Content si fue exitoso
     */
    public function destroy(Request $request, Category $category): JsonResponse
    {
        // SEGURIDAD: Solo administradores pueden eliminar categorías
        if ($request->user() && $request->user()->role !== 'Administrador') {
            abort(403, 'Solo los administradores pueden eliminar categorías.');
        }

        $this->manager->deleteCategory($category);

        $this->auditLogger->log(
            module: 'Categorías',
            action: 'Eliminar',
            user: $request->user(),
            model: $category,
        );

        return response()->json([], 204);
    }

    /**
     * Listar subcategorías de una categoría
     * 
     * @param Category $category Categoría padre
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function subcategories(Category $category)
    {
        return SubcategoryResource::collection($category->subcategories()->get());
    }

    /**
     * Crear subcategoría dentro de una categoría
     * 
     * @param SubcategoryRequest $request Datos validados de la subcategoría
     * @param Category $category Categoría padre
     * @return SubcategoryResource La subcategoría creada
     */
    public function storeSubcategory(SubcategoryRequest $request, Category $category): SubcategoryResource
    {
        // Asegura que la subcategoría pertenezca a esta categoría
        $request->merge(['category_id' => $category->id]);
        $subcategory = $this->manager->upsertSubcategory($category, $request->validated());

        $this->auditLogger->log(
            module: 'Subcategorías',
            action: 'Crear',
            user: $request->user(),
            model: $subcategory,
        );

        return new SubcategoryResource($subcategory);
    }

    /**
     * Actualizar subcategoría
     * 
     * Verifica que la subcategoría pertenezca a la categoría antes de actualizar.
     * 
     * @param SubcategoryRequest $request Datos validados a actualizar
     * @param Category $category Categoría padre
     * @param Subcategory $subcategory Subcategoría a actualizar
     * @return SubcategoryResource La subcategoría actualizada
     */
    public function updateSubcategory(SubcategoryRequest $request, Category $category, Subcategory $subcategory): SubcategoryResource
    {
        // Valida que la subcategoría pertenezca a la categoría
        $this->ensureRelationship($category, $subcategory);
        $request->merge(['category_id' => $category->id]);
        $subcategory = $this->manager->upsertSubcategory($category, $request->validated(), $subcategory);

        $this->auditLogger->log(
            module: 'Subcategorías',
            action: 'Actualizar',
            user: $request->user(),
            model: $subcategory,
        );

        return new SubcategoryResource($subcategory);
    }

    /**
     * Eliminar subcategoría
     * 
     * @param Request $request Request para obtener el usuario
     * @param Subcategory $subcategory Subcategoría a eliminar
     * @return JsonResponse 204 No Content si fue exitoso
     */
    public function destroySubcategory(Request $request, Subcategory $subcategory): JsonResponse
    {
        $this->manager->deleteSubcategory($subcategory);

        $this->auditLogger->log(
            module: 'Subcategorías',
            action: 'Eliminar',
            user: $request->user(),
            model: $subcategory,
        );

        return response()->json([], 204);
    }

    /**
     * Verifica que la subcategoría pertenezca a la categoría
     * 
     * Si no pertenece, aborta con 404.
     * 
     * @param Category $category Categoría esperada
     * @param Subcategory $subcategory Subcategoría a verificar
     */
    private function ensureRelationship(Category $category, Subcategory $subcategory): void
    {
        abort_if($subcategory->category_id !== $category->id, 404);
    }
}
