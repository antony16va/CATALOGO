<?php

use App\Http\Controllers\API\AuditLogController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\RequestController;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\SlaController;
use App\Http\Controllers\API\TemplateController;
use App\Http\Controllers\API\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de la API de Helix Service Desk
|--------------------------------------------------------------------------
|
| Aquí se registran todas las rutas de la API REST del sistema.
| Todas las rutas excepto las públicas requieren autenticación via Sanctum.
|
*/

// ============================================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================================
Route::prefix('auth')->group(function () {
    // Rutas públicas (sin autenticación)
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    // Rutas protegidas
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::patch('me/username', [AuthController::class, 'updateUsername']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// ============================================================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================================================
Route::middleware('auth:sanctum')->group(function () {
    
    // ------------------------------------------------------------------------
    // USUARIOS
    // ------------------------------------------------------------------------
    Route::apiResource('users', UserController::class);
    Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive']);

    // ------------------------------------------------------------------------
    // CATEGORÍAS Y SUBCATEGORÍAS
    // ------------------------------------------------------------------------
    Route::apiResource('categories', CategoryController::class);
    Route::get('categories/{category}/subcategories', [CategoryController::class, 'subcategories']);
    Route::post('categories/{category}/subcategories', [CategoryController::class, 'storeSubcategory']);
    Route::match(['put', 'patch'], 'categories/{category}/subcategories/{subcategory}', [CategoryController::class, 'updateSubcategory']);
    Route::delete('subcategories/{subcategory}', [CategoryController::class, 'destroySubcategory']);

    // ------------------------------------------------------------------------
    // NIVELES DE SLA
    // ------------------------------------------------------------------------
    Route::apiResource('slas', SlaController::class)->parameters(['slas' => 'sla']);

    // ------------------------------------------------------------------------
    // SERVICIOS DEL CATÁLOGO
    // ------------------------------------------------------------------------
    Route::apiResource('services', ServiceController::class);

    // ------------------------------------------------------------------------
    // PLANTILLAS DE FORMULARIO
    // ------------------------------------------------------------------------
    Route::get('templates', [TemplateController::class, 'index']);
    Route::post('templates', [TemplateController::class, 'store']);
    Route::get('templates/{template}', [TemplateController::class, 'show']);
    Route::put('templates/{template}', [TemplateController::class, 'update']);
    Route::delete('templates/{template}', [TemplateController::class, 'destroy']);

    // Campos de plantilla
    Route::post('templates/{template}/fields', [TemplateController::class, 'addField']);
    Route::put('template-fields/{field}', [TemplateController::class, 'updateField']);
    Route::delete('template-fields/{field}', [TemplateController::class, 'destroyField']);

    // ------------------------------------------------------------------------
    // SOLICITUDES DE SERVICIO
    // ------------------------------------------------------------------------
    Route::apiResource('requests', RequestController::class)
        ->parameters(['requests' => 'serviceRequest'])
        ->except(['update']);
    Route::put('requests/{serviceRequest}/status', [RequestController::class, 'updateStatus']);

    // ------------------------------------------------------------------------
    // AUDITORÍA
    // ------------------------------------------------------------------------
    Route::get('audit-logs', [AuditLogController::class, 'index']);
});

// ============================================================================
// RUTAS PÚBLICAS DEL CATÁLOGO
// ============================================================================
Route::prefix('catalog')->group(function () {
    Route::get('categories', [CategoryController::class, 'publicIndex']);
    Route::get('services', [ServiceController::class, 'publicCatalog']);
});
