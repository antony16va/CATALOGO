<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceStoreRequest;
use App\Http\Requests\ServiceUpdateRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Services\AuditLogger;
use App\Services\ServiceCatalog\ServiceManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador de Servicios del Catálogo
 * 
 * Gestiona las operaciones CRUD para los servicios de TI.
 * Los servicios son los elementos que los usuarios pueden solicitar.
 * 
 * Endpoints disponibles:
 * - GET    /services          → Lista paginada de servicios (admin)
 * - GET    /services/catalog  → Catálogo público (solo publicados)
 * - POST   /services          → Crear nuevo servicio
 * - GET    /services/{id}     → Ver detalle del servicio
 * - PUT    /services/{id}     → Actualizar servicio
 * - DELETE /services/{id}     → Eliminar servicio
 * 
 * Cada servicio pertenece a una categoría, puede tener subcategoría,
 * y tiene un SLA asociado que define los tiempos de atención.
 */
class ServiceController extends Controller
{
    /**
     * Constructor con inyección de dependencias
     * 
     * @param ServiceManager $manager Servicio de lógica de negocio
     * @param AuditLogger $auditLogger Servicio para registro de auditoría
     */
    public function __construct(
        private readonly ServiceManager $manager,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    /**
     * Listar servicios (paginado, para administración)
     * 
     * Devuelve lista paginada de todos los servicios.
     * Soporta filtros: status, priority, category_id, search, per_page.
     * 
     * @param Request $request Parámetros de filtrado y paginación
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        $services = $this->manager->paginate($request->all());

        return ServiceResource::collection($services);
    }

    /**
     * Catálogo público de servicios
     * 
     * Devuelve solo servicios con estado "Publicado".
     * Usado en el portal para usuarios finales.
     * 
     * @param Request $request Parámetros opcionales de filtrado
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function publicCatalog(Request $request)
    {
        $services = $this->manager->listPublicCatalog($request->all());

        return ServiceResource::collection($services);
    }

    /**
     * Crear nuevo servicio
     * 
     * Crea un servicio y registra la acción en auditoría.
     * El usuario creador se guarda automáticamente.
     * 
     * @param ServiceStoreRequest $request Datos validados del servicio
     * @return JsonResponse 201 Created con el servicio creado
     */
    public function store(ServiceStoreRequest $request): JsonResponse
    {
        // Crea el servicio asociando el usuario actual como creador
        $service = $this->manager->store($request->validated(), $request->user());

        // Registra en auditoría
        $this->auditLogger->log('Servicios', 'Crear', $request->user(), $service);

        // Devuelve el servicio con sus relaciones cargadas
        return (new ServiceResource($service->load(['category', 'subcategory', 'sla'])))->response()->setStatusCode(201);
    }

    /**
     * Ver detalle del servicio
     * 
     * Devuelve el servicio con todas sus relaciones:
     * categoría, subcategoría, SLA y plantillas con sus campos.
     * 
     * @param Service $service Servicio (inyectado por route model binding)
     * @return ServiceResource Detalle completo del servicio
     */
    public function show(Service $service): ServiceResource
    {
        return new ServiceResource($service->load(['category', 'subcategory', 'sla', 'templates.fields']));
    }

    /**
     * Actualizar servicio
     * 
     * Actualiza los datos del servicio y registra en auditoría.
     * El usuario modificador se actualiza automáticamente.
     * 
     * @param ServiceUpdateRequest $request Datos validados a actualizar
     * @param Service $service Servicio a actualizar
     * @return ServiceResource El servicio actualizado
     */
    public function update(ServiceUpdateRequest $request, Service $service): ServiceResource
    {
        $service = $this->manager->update($service, $request->validated(), $request->user());

        $this->auditLogger->log('Servicios', 'Actualizar', $request->user(), $service);

        return new ServiceResource($service);
    }

    /**
     * Eliminar servicio
     * 
     * Elimina el servicio y sus plantillas asociadas.
     * Las solicitudes existentes conservan referencia histórica.
     * 
     * @param Request $request Request para obtener el usuario
     * @param Service $service Servicio a eliminar
     * @return JsonResponse 204 No Content si fue exitoso
     */
    public function destroy(Request $request, Service $service): JsonResponse
    {
        $this->manager->delete($service);

        $this->auditLogger->log('Servicios', 'Eliminar', $request->user(), $service);

        return response()->json([], 204);
    }
}
