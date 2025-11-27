<?php

namespace App\Services\ServiceCatalog;

use App\Models\Service;
use App\Models\ServiceTemplate;
use App\Models\TemplateField;
use Illuminate\Support\Collection;

class TemplateManager
{
    public function listByService(Service $service): Collection
    {
        return $service->templates()->with('fields')->get();
    }

    public function store(Service $service, array $data): ServiceTemplate
    {
        unset($data['service_id']);

        return $service->templates()->create($data);
    }

    public function update(ServiceTemplate $template, array $data): ServiceTemplate
    {
        unset($data['service_id']);
        $template->update($data);
        return $template->fresh('fields');
    }

    public function delete(ServiceTemplate $template): void
    {
        $template->delete();
    }

    public function syncFields(ServiceTemplate $template, array $fields): Collection
    {
        $template->fields()->delete();
        $collection = collect();

        foreach ($fields as $order => $field) {
            $collection->push(
                $template->fields()->create(array_merge($field, [
                    'order' => $field['order'] ?? $order,
                ]))
            );
        }

        return $collection;
    }

    public function addField(ServiceTemplate $template, array $data): TemplateField
    {
        return $template->fields()->create($data);
    }

    public function updateField(TemplateField $field, array $data): TemplateField
    {
        $field->update($data);
        return $field;
    }

    public function deleteField(TemplateField $field): void
    {
        $field->delete();
    }
}
