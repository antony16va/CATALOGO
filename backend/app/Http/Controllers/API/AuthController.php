<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Controlador de Autenticación
 * 
 * Maneja todas las operaciones de autenticación del sistema:
 * - Registro de nuevos usuarios
 * - Inicio de sesión (login)
 * - Obtener usuario actual
 * - Cierre de sesión (logout)
 * 
 * Utiliza Laravel Sanctum para tokens de API.
 * Todas las acciones se registran en el log de auditoría.
 */
class AuthController extends Controller
{
    /**
     * Constructor con inyección de dependencias
     * 
     * @param AuditLogger $auditLogger Servicio para registro de auditoría
     */
    public function __construct(private readonly AuditLogger $auditLogger)
    {
    }

    /**
     * Registrar un nuevo usuario
     * 
     * Crea una cuenta nueva pero INACTIVA.
     * El usuario debe esperar a que un administrador active su cuenta.
     * No genera token de acceso.
     * 
     * @param RegisterRequest $request Datos validados del nuevo usuario
     * @return JsonResponse Mensaje de confirmación
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Obtiene los datos validados del request
        $payload = $request->payload();
        // Asigna rol por defecto si no se especifica
        $payload['role'] = $payload['role'] ?? 'Usuario';
        // Usuario se crea INACTIVO, debe ser activado por un administrador
        $payload['active'] = false;

        // Crea el usuario (la contraseña se hashea automáticamente por el cast)
        $user = User::create($payload);

        // Registra la acción en auditoría
        $this->auditLogger->log(
            module: 'Autenticación',
            action: 'Registro',
            user: $user,
            description: 'Registro de usuario desde el frontend (pendiente de activación)'
        );

        return response()->json([
            'message' => 'Registro exitoso. Tu cuenta está pendiente de activación por un administrador.',
            'pending_activation' => true,
        ], 201);
    }

    /**
     * Iniciar sesión
     * 
     * Autentica al usuario por email o username.
     * Genera un token con duración según "recordarme".
     * 
     * @param LoginRequest $request Credenciales del usuario
     * @return JsonResponse Token de acceso y datos del usuario
     * @throws ValidationException Si las credenciales son inválidas o la cuenta está desactivada
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->credentials();
        
        // Detecta si el login es email o username
        $loginField = filter_var($credentials['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        /** @var User|null $user */
        $user = User::where($loginField, $credentials['login'])->first();

        // Verifica que el usuario exista y la contraseña sea correcta
        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'login' => __('auth.failed'),
            ]);
        }

        // Verifica que la cuenta esté activa
        if (! $user->active) {
            throw ValidationException::withMessages([
                'login' => 'Tu cuenta está pendiente de activación por un administrador.',
            ]);
        }

        // Actualiza la fecha de último acceso
        $user->forceFill(['last_accessed_at' => now()])->save();

        // Crea token con expiración según "recordarme"
        // - Con recordarme: 1 mes
        // - Sin recordarme: 1 día
        $token = $user->createToken(
            name: 'frontend',
            abilities: ['*'],
            expiresAt: $credentials['remember'] ? now()->addMonth() : now()->addDay()
        );

        // Registra el login en auditoría
        $this->auditLogger->log(
            module: 'Autenticación',
            action: 'Login',
            user: $user,
            description: 'Inicio de sesión vía API'
        );

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Obtener usuario autenticado actual
     * 
     * Devuelve los datos del usuario logueado.
     * Requiere token válido en el header Authorization.
     * 
     * @return UserResource Datos del usuario actual
     */
    public function me(): UserResource
    {
        return new UserResource(Auth::user());
    }

    /**
     * Actualizar username del usuario autenticado
     * 
     * Permite al usuario cambiar su nombre de usuario.
     * El username debe ser único en el sistema.
     * 
     * @param \Illuminate\Http\Request $request
     * @return UserResource Datos actualizados del usuario
     */
    public function updateUsername(\Illuminate\Http\Request $request): UserResource
    {
        $request->validate([
            'username' => ['required', 'string', 'min:3', 'max:50', 'unique:catalogo_servicios_usuarios,username,' . Auth::id()],
        ], [
            'username.required' => 'El nombre de usuario es requerido.',
            'username.min' => 'El nombre de usuario debe tener al menos 3 caracteres.',
            'username.max' => 'El nombre de usuario no puede tener más de 50 caracteres.',
            'username.unique' => 'Este nombre de usuario ya está en uso.',
        ]);

        /** @var User $user */
        $user = Auth::user();
        $oldUsername = $user->username;
        $user->username = $request->username;
        $user->save();

        // Registra el cambio en auditoría
        $this->auditLogger->log(
            module: 'Perfil',
            action: 'Actualizar Username',
            user: $user,
            description: "Username cambiado de '{$oldUsername}' a '{$request->username}'"
        );

        return new UserResource($user);
    }

    /**
     * Cerrar sesión
     * 
     * Revoca el token actual del usuario.
     * Los demás tokens (otras sesiones) permanecen válidos.
     * 
     * @return JsonResponse Mensaje de confirmación
     */
    public function logout(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        // Elimina solo el token actual
        $accessToken = $user?->currentAccessToken();
        
        // Verifica que sea un token personal (y no una sesión de cookie) antes de borrar
        if ($accessToken instanceof \Laravel\Sanctum\PersonalAccessToken) {
            $accessToken->delete();
        }

        // Registra el logout en auditoría
        $this->auditLogger->log(
            module: 'Autenticación',
            action: 'Logout',
            user: $user,
            description: 'Cierre de sesión desde el frontend'
        );

        return response()->json(['message' => 'Sesión finalizada.']);
    }
}
