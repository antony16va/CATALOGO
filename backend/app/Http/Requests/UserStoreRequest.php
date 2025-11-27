<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Request para crear usuarios
 * 
 * Valida todos los campos necesarios para crear un nuevo usuario.
 * Solo usuarios autenticados pueden crear otros usuarios.
 */
class UserStoreRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para esta solicitud
     * 
     * @return bool Siempre true, la autorización se maneja en middleware
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas de validación
     * 
     * @return array<string, mixed> Reglas de validación
     */
    public function rules(): array
    {
        return [
            'username' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'alpha_dash',
                'unique:catalogo_servicios_usuarios,username',
            ],
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:255',
                'unique:catalogo_servicios_usuarios,email',
            ],
            'password' => [
                'required',
                'string',
                Password::min(6)
                    ->mixedCase()
                    ->numbers(),
            ],
            'full_name' => [
                'required',
                'string',
                'min:2',
                'max:255',
            ],
            'role' => [
                'required',
                Rule::enum(UserRole::class),
            ],
            'active' => [
                'boolean',
            ],
        ];
    }

    /**
     * Mensajes de error personalizados en español
     * 
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'username.required' => 'El nombre de usuario es obligatorio.',
            'username.min' => 'El nombre de usuario debe tener al menos 3 caracteres.',
            'username.max' => 'El nombre de usuario no puede exceder 50 caracteres.',
            'username.alpha_dash' => 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos.',
            'username.unique' => 'Este nombre de usuario ya está en uso.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El formato del correo electrónico no es válido.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'full_name.required' => 'El nombre completo es obligatorio.',
            'full_name.min' => 'El nombre debe tener al menos 2 caracteres.',
            'role.required' => 'El rol es obligatorio.',
            'role.enum' => 'El rol seleccionado no es válido.',
        ];
    }

    /**
     * Nombres de atributos para mensajes más legibles
     * 
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'username' => 'nombre de usuario',
            'email' => 'correo electrónico',
            'password' => 'contraseña',
            'full_name' => 'nombre completo',
            'role' => 'rol',
            'active' => 'estado activo',
        ];
    }
}
