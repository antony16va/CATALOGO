<?php

namespace App\Http\Requests;

use App\Enums\ServicePriority;
use App\Enums\ServiceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $serviceId = $this->route('service')?->id;

        return [
            'code' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('catalogo_servicios_servicios', 'code')->ignore($serviceId),
            ],
            'name' => ['sometimes', 'string', 'max:150'],
            'description' => ['sometimes', 'string'],
            'category_id' => ['sometimes', 'integer', 'exists:catalogo_servicios_categorias,id'],
            'subcategory_id' => ['nullable', 'integer', 'exists:catalogo_servicios_subcategorias,id'],
            'sla_id' => ['nullable', 'integer', 'exists:catalogo_servicios_sla_niveles,id'],
            'priority' => ['sometimes', Rule::in(ServicePriority::values())],
            'status' => ['sometimes', Rule::in(ServiceStatus::values())],
            'keywords' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
