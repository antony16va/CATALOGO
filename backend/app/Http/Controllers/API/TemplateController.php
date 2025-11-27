<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceTemplateRequest;
use App\Http\Requests\TemplateFieldRequest;
use App\Http\Resources\ServiceTemplateResource;
use App\Http\Resources\TemplateFieldResource;
use App\Models\Service;
use App\Models\ServiceTemplate;
use App\Models\TemplateField;
use App\Services\AuditLogger;
use App\Services\ServiceCatalog\TemplateManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    public function __construct(
        private readonly TemplateManager $manager,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'service_id' => ['required', 'integer', 'exists:catalogo_servicios_servicios,id'],
        ]);

        $service = Service::findOrFail($validated['service_id']);

        $templates = $this->manager->listByService($service);

        return ServiceTemplateResource::collection($templates);
    }

    public function store(ServiceTemplateRequest $request): JsonResponse
    {
        $service = Service::findOrFail($request->input('service_id'));
        $template = $this->manager->store($service, $request->validated());

        $this->auditLogger->log('Plantillas', 'Crear', $request->user(), $template);

        return (new ServiceTemplateResource($template))->response()->setStatusCode(201);
    }

    public function show(ServiceTemplate $template): ServiceTemplateResource
    {
        return new ServiceTemplateResource($template->load('fields'));
    }

    public function update(ServiceTemplateRequest $request, ServiceTemplate $template): ServiceTemplateResource
    {
        $template = $this->manager->update($template, $request->validated());

        $this->auditLogger->log('Plantillas', 'Actualizar', $request->user(), $template);

        return new ServiceTemplateResource($template);
    }

    public function destroy(Request $request, ServiceTemplate $template): JsonResponse
    {
        $this->manager->delete($template);

        $this->auditLogger->log('Plantillas', 'Eliminar', $request->user(), $template);

        return response()->json([], 204);
    }

    public function addField(TemplateFieldRequest $request, ServiceTemplate $template): TemplateFieldResource
    {
        $data = $request->validated();
        $data['template_id'] = $template->id;

        $field = $this->manager->addField($template, $data);

        $this->auditLogger->log('CamposPlantilla', 'Crear', $request->user(), $field);

        return new TemplateFieldResource($field);
    }

    public function updateField(TemplateFieldRequest $request, TemplateField $field): TemplateFieldResource
    {
        $data = $request->validated();
        $data['template_id'] = $field->template_id;

        $field = $this->manager->updateField($field, $data);

        $this->auditLogger->log('CamposPlantilla', 'Actualizar', $request->user(), $field);

        return new TemplateFieldResource($field);
    }

    public function destroyField(Request $request, TemplateField $field): JsonResponse
    {
        $this->manager->deleteField($field);

        $this->auditLogger->log('CamposPlantilla', 'Eliminar', $request->user(), $field);

        return response()->json([], 204);
    }
}
