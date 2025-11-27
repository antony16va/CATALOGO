<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Controlador de Gestión de Usuarios
 * 
 * Gestiona las operaciones CRUD para usuarios del sistema.
 * Solo accesible por usuarios con rol Administrador.
 * 
 * Endpoints disponibles:
 * - GET    /users      → Lista paginada de usuarios
 * - POST   /users      → Crear nuevo usuario
 * - GET    /users/{id} → Ver detalle del usuario
 * - PUT    /users/{id} → Actualizar usuario
 * - DELETE /users/{id} → Eliminar usuario
 * 
 * Todas las acciones se registran en el log de auditoría.
 */
class UserController extends Controller
{
    /**
     * Constructor con inyección de dependencias
     * 
     * @param AuditLogger $auditLogger Servicio para registro de auditoría
     */
    public function __construct(
        private readonly AuditLogger $auditLogger,
    ) {
    }

    /**
     * Listar usuarios (paginado)
     * 
     * Devuelve lista paginada de usuarios.
     * Soporta filtros: role, active, search, per_page.
     * 
     * @param Request $request Parámetros de filtrado y paginación
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        $users = User::query()
            // Filtro por rol
            ->when($request->role, fn ($query, $role) => $query->where('role', $role))
            // Filtro por estado activo
            ->when($request->has('active'), fn ($query) => 
                $query->where('active', filter_var($request->active, FILTER_VALIDATE_BOOL))
            )
            // Búsqueda por nombre, email o username
            ->when($request->search, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('full_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            // Ordena por más reciente primero
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return UserResource::collection($users);
    }

    /**
     * Crear nuevo usuario
     * 
     * Crea un usuario con la contraseña hasheada automáticamente.
     * 
     * @param UserStoreRequest $request Datos validados del usuario
     * @return JsonResponse 201 Created con el usuario creado
     */
    public function store(UserStoreRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Crea el usuario (la contraseña se hashea por el cast del modelo)
        $user = User::create($data);

        // Registra en auditoría
        $this->auditLogger->log(
            module: 'Usuarios',
            action: 'Crear',
            user: $request->user(),
            model: $user,
            description: "Usuario {$user->full_name} creado",
        );

        return (new UserResource($user))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Ver detalle del usuario
     * 
     * @param User $user Usuario (inyectado por route model binding)
     * @return UserResource Detalle del usuario
     */
    public function show(User $user): UserResource
    {
        return new UserResource($user);
    }

    /**
     * Actualizar usuario
     * 
     * Actualiza los datos del usuario.
     * Si se proporciona contraseña, se hashea automáticamente.
     * 
     * @param UserUpdateRequest $request Datos validados a actualizar
     * @param User $user Usuario a actualizar
     * @return UserResource El usuario actualizado
     */
    public function update(UserUpdateRequest $request, User $user): UserResource
    {
        $data = $request->validated();
        
        // Si no se envía contraseña, no la actualiza
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        // Registra en auditoría
        $this->auditLogger->log(
            module: 'Usuarios',
            action: 'Actualizar',
            user: $request->user(),
            model: $user,
            description: "Usuario {$user->full_name} actualizado",
        );

        return new UserResource($user->fresh());
    }

    /**
     * Eliminar usuario
     * 
     * No permite eliminar al usuario que está ejecutando la acción.
     * 
     * @param Request $request Request para obtener el usuario actual
     * @param User $user Usuario a eliminar
     * @return JsonResponse 204 No Content o 403 si intenta auto-eliminarse
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        // Previene auto-eliminación
        if ($request->user()?->id === $user->id) {
            return response()->json([
                'message' => 'No puedes eliminar tu propia cuenta.',
            ], 403);
        }

        // Registra en auditoría antes de eliminar
        $this->auditLogger->log(
            module: 'Usuarios',
            action: 'Eliminar',
            user: $request->user(),
            model: $user,
            description: "Usuario {$user->full_name} eliminado",
        );

        $user->delete();

        return response()->json([], 204);
    }

    /**
     * Activar/Desactivar usuario
     * 
     * Cambia el estado activo del usuario.
     * 
     * @param Request $request Request para obtener el usuario actual
     * @param User $user Usuario a modificar
     * @return UserResource El usuario con estado actualizado
     */
    public function toggleActive(Request $request, User $user): UserResource
    {
        // Previene auto-desactivación
        if ($request->user()?->id === $user->id) {
            abort(403, 'No puedes desactivar tu propia cuenta.');
        }

        $user->update(['active' => !$user->active]);

        $this->auditLogger->log(
            module: 'Usuarios',
            action: $user->active ? 'Activar' : 'Desactivar',
            user: $request->user(),
            model: $user,
            description: "Usuario {$user->full_name} " . ($user->active ? 'activado' : 'desactivado'),
        );

        return new UserResource($user);
    }
}
