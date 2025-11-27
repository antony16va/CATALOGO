<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\SlaLevelRequest;
use App\Http\Resources\SlaResource;
use App\Models\SlaLevel;
use App\Services\AuditLogger;
use App\Services\ServiceCatalog\SlaManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador de Niveles de SLA
 * 
 * Gestiona los Acuerdos de Nivel de Servicio (Service Level Agreements).
 * Los SLA definen los tiempos máximos de respuesta y resolución
 * que se comprometen para cada tipo de solicitud.
 * 
 * Endpoints disponibles:
 * - GET    /slas      → Lista paginada de niveles SLA
 * - POST   /slas      → Crear nuevo nivel SLA
 * - GET    /slas/{id} → Ver detalle del SLA
 * - PUT    /slas/{id} → Actualizar nivel SLA
 * - DELETE /slas/{id} → Eliminar nivel SLA
 * 
 * Los SLA se asignan a los servicios para definir sus tiempos de atención.
 */
class SlaController extends Controller
{
    /**
     * Constructor con inyección de dependencias
     * 
     * @param SlaManager $manager Servicio de lógica de negocio
     * @param AuditLogger $auditLogger Servicio para registro de auditoría
     */
    public function __construct(
        private readonly SlaManager $manager,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    /**
     * Listar niveles SLA (paginado)
     * 
     * Devuelve lista paginada de todos los niveles SLA.
     * Soporta filtros: active, search, per_page.
     * 
     * @param Request $request Parámetros de filtrado y paginación
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        $slas = $this->manager->paginate($request->all());
        return SlaResource::collection($slas);
    }

    /**
     * Crear nuevo nivel SLA
     * 
     * Crea un SLA con sus tiempos de respuesta y resolución.
     * Tiempos se especifican en minutos.
     * 
     * @param SlaLevelRequest $request Datos validados del SLA
     * @return SlaResource El SLA creado
     */
    public function store(SlaLevelRequest $request): SlaResource
    {
        $sla = $this->manager->store($request->validated());

        $this->auditLogger->log('SLA', 'Crear', $request->user(), $sla);

        return new SlaResource($sla);
    }

    /**
     * Ver detalle del nivel SLA
     * 
     * @param SlaLevel $sla Nivel SLA (inyectado por route model binding)
     * @return SlaResource Detalle del SLA
     */
    public function show(SlaLevel $sla): SlaResource
    {
        return new SlaResource($sla);
    }

    /**
     * Actualizar nivel SLA
     * 
     * Los cambios afectan a futuras solicitudes.
     * Solicitudes existentes conservan el SLA original.
     * 
     * @param SlaLevelRequest $request Datos validados a actualizar
     * @param SlaLevel $sla Nivel SLA a actualizar
     * @return SlaResource El SLA actualizado
     */
    public function update(SlaLevelRequest $request, SlaLevel $sla): SlaResource
    {
        $sla = $this->manager->update($sla, $request->validated());

        $this->auditLogger->log('SLA', 'Actualizar', $request->user(), $sla);

        return new SlaResource($sla);
    }

    /**
     * Eliminar nivel SLA
     * 
     * No se puede eliminar si hay servicios usando este SLA.
     * Primero reasignar los servicios a otro SLA.
     * 
     * @param Request $request Request para obtener el usuario
     * @param SlaLevel $sla Nivel SLA a eliminar
     * @return JsonResponse 204 No Content si fue exitoso
     */
    public function destroy(Request $request, SlaLevel $sla): JsonResponse
    {
        $this->manager->delete($sla);

        $this->auditLogger->log('SLA', 'Eliminar', $request->user(), $sla);

        return response()->json([], 204);
    }
}
