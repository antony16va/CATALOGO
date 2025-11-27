<?php

namespace App\Http\Controllers\API;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceRequestStatusRequest;
use App\Http\Requests\ServiceRequestStoreRequest;
use App\Http\Resources\ServiceRequestResource;
use App\Models\ServiceRequest;
use App\Services\AuditLogger;
use App\Services\ServiceCatalog\RequestManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador de Solicitudes de Servicio
 * 
 * Gestiona las solicitudes de servicio con control de acceso por rol:
 * - Administradores: ven todas las solicitudes, pueden editar estado y eliminar
 * - Usuarios: solo ven sus propias solicitudes, no pueden editar ni eliminar
 */
class RequestController extends Controller
{
    public function __construct(
        private readonly RequestManager $manager,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    /**
     * Lista solicitudes con filtrado por rol
     * 
     * Administradores ven todas las solicitudes.
     * Usuarios solo ven las solicitudes que ellos crearon.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $filters = $request->all();
        
        // SEGURIDAD: Si no es administrador, forzar filtro por usuario actual
        // Esto se hace en el backend para evitar manipulación desde el frontend
        if ($user && $user->role !== UserRole::Administrator) {
            $filters['requester_id'] = $user->id;
        }
        
        $requests = $this->manager->paginate($filters);

        return ServiceRequestResource::collection($requests);
    }

    /**
     * Crea una nueva solicitud
     * 
     * Cualquier usuario autenticado puede crear solicitudes.
     */
    public function store(ServiceRequestStoreRequest $request): JsonResponse
    {
        $serviceRequest = $this->manager->store($request->validated(), $request->user());

        $this->auditLogger->log('Solicitudes', 'Crear', $request->user(), $serviceRequest);

        // Cargar relaciones para que el frontend tenga toda la información
        $serviceRequest->load(['service', 'requester']);

        return (new ServiceRequestResource($serviceRequest))->response()->setStatusCode(201);
    }

    /**
     * Ver detalle de una solicitud
     * 
     * Administradores pueden ver cualquier solicitud.
     * Usuarios solo pueden ver sus propias solicitudes.
     */
    public function show(Request $request, ServiceRequest $serviceRequest): ServiceRequestResource
    {
        $user = $request->user();
        
        // SEGURIDAD: Usuarios solo pueden ver sus propias solicitudes
        if ($user && $user->role !== UserRole::Administrator && $serviceRequest->user_id !== $user->id) {
            abort(403, 'No tienes permiso para ver esta solicitud.');
        }
        
        return new ServiceRequestResource($serviceRequest->load(['service', 'requester']));
    }

    /**
     * Actualizar estado de una solicitud
     * 
     * Solo administradores pueden cambiar el estado.
     */
    public function updateStatus(ServiceRequestStatusRequest $request, ServiceRequest $serviceRequest): ServiceRequestResource
    {
        $user = $request->user();
        
        // SEGURIDAD: Solo administradores pueden cambiar estado
        if ($user && $user->role !== UserRole::Administrator) {
            abort(403, 'Solo los administradores pueden cambiar el estado de las solicitudes.');
        }
        
        $serviceRequest = $this->manager->updateStatus($serviceRequest, $request->validated('status'));

        $this->auditLogger->log('Solicitudes', 'Actualizar Estado', $request->user(), $serviceRequest);

        return new ServiceRequestResource($serviceRequest);
    }

    /**
     * Eliminar una solicitud
     * 
     * Solo administradores pueden eliminar solicitudes.
     */
    public function destroy(Request $request, ServiceRequest $serviceRequest): JsonResponse
    {
        $user = $request->user();
        
        // SEGURIDAD: Solo administradores pueden eliminar
        if ($user && $user->role !== UserRole::Administrator) {
            abort(403, 'Solo los administradores pueden eliminar solicitudes.');
        }
        
        $this->auditLogger->log('Solicitudes', 'Eliminar', $request->user(), $serviceRequest);
        
        $serviceRequest->delete();

        return response()->json([], 204);
    }
}
