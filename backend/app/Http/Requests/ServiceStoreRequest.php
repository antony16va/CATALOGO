<?php

namespace App\Http\Requests;

use App\Enums\ServicePriority;
use App\Enums\ServiceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceStoreRequest extends FormRequest
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
        return [
            'code' => ['required', 'string', 'max:50', 'unique:catalogo_servicios_servicios,code'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string'],
            'category_id' => ['required', 'integer', 'exists:catalogo_servicios_categorias,id'],
            'subcategory_id' => ['nullable', 'integer', 'exists:catalogo_servicios_subcategorias,id'],
            'sla_id' => ['nullable', 'integer', 'exists:catalogo_servicios_sla_niveles,id'],
            'priority' => ['required', Rule::in(ServicePriority::values())],
            'status' => ['required', Rule::in(ServiceStatus::values())],
            'keywords' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
