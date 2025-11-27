<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::find(1);
echo "User ID: " . $user->id . PHP_EOL;
echo "User Role: " . $user->role . PHP_EOL;

$manager = new App\Services\ServiceCatalog\RequestManager();

// 1. Simular consulta de Admin (sin filtros de usuario)
echo "\n--- Consulta Admin (sin filtros) ---\n";
try {
    $requests = $manager->paginate(['per_page' => 100]);
    echo "Total Requests: " . $requests->total() . PHP_EOL;
    foreach ($requests->items() as $req) {
        echo " - Request ID: {$req->id}, User ID: {$req->user_id}, Status: {$req->status}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}

// 2. Simular consulta con filtro requester_id (lo que pasaría si no fuera admin)
echo "\n--- Consulta Filtrada (requester_id = 1) ---\n";
try {
    $requestsFiltered = $manager->paginate(['requester_id' => 1, 'per_page' => 100]);
    echo "Total Requests: " . $requestsFiltered->total() . PHP_EOL;
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
