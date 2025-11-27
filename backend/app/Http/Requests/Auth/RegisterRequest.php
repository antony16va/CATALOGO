<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            'full_name' => ['required', 'string', 'max:150'],
            'username' => ['required', 'string', 'max:50', 'unique:catalogo_servicios_usuarios,username'],
            'email' => ['required', 'string', 'email', 'max:150', 'unique:catalogo_servicios_usuarios,email'],
            'password' => ['required', 'confirmed', 'string', 'min:8'],
            'role' => ['sometimes', 'in:Administrador,Usuario'],
        ];
    }

    public function payload(): array
    {
        return $this->only(['full_name', 'username', 'email', 'password', 'role']);
    }
}
