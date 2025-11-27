<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ServiceRequestStoreRequest extends FormRequest
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
            'service_id' => ['required', 'integer', 'exists:catalogo_servicios_servicios,id'],
            'template_id' => ['nullable', 'integer', 'exists:catalogo_servicios_plantillas_solicitud,id'],
            'form_payload' => ['required', 'array'],
            'redirected_at' => ['nullable', 'date'],
        ];
    }
}
