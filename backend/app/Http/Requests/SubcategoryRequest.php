<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubcategoryRequest extends FormRequest
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
        $subcategoryId = $this->route('subcategory')?->id;
        $categoryId = $this->input('category_id') ?? $this->route('category')?->id ?? $this->route('subcategory')?->category_id;

        return [
            'category_id' => [
                $this->isMethod('post') ? 'required' : 'sometimes',
                'exists:catalogo_servicios_categorias,id',
            ],
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('catalogo_servicios_subcategorias', 'name')
                    ->where(fn ($query) => $query->where('category_id', $categoryId ?? 0))
                    ->ignore($subcategoryId),
            ],
            'description' => ['nullable', 'string'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
