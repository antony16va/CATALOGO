<?php

namespace App\Http\Requests;

use App\Enums\TemplateFieldType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TemplateFieldRequest extends FormRequest
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
            'template_id' => ['sometimes', 'integer', 'exists:catalogo_servicios_plantillas_solicitud,id'],
            'field_name' => ['required', 'string', 'max:100'],
            'label' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(TemplateFieldType::values())],
            'options' => ['nullable', 'array'],
            'help_text' => ['nullable', 'string'],
            'required' => ['sometimes', 'boolean'],
            'validation_pattern' => ['nullable', 'string'],
            'error_message' => ['nullable', 'string', 'max:255'],
            'placeholder' => ['nullable', 'string', 'max:150'],
            'order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
