<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SlaLevelRequest extends FormRequest
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
        $slaId = $this->route('sla')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('catalogo_servicios_sla_niveles', 'name')->ignore($slaId),
            ],
            'description' => ['nullable', 'string'],
            'first_response_minutes' => ['required', 'integer', 'min:1'],
            'resolution_minutes' => ['required', 'integer', 'min:1'],
            'pause_conditions' => ['nullable', 'string'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
