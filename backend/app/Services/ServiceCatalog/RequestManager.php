<?php

namespace App\Services\ServiceCatalog;

use App\Enums\RequestStatus;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class RequestManager
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return ServiceRequest::query()
            ->with(['service', 'requester'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['service_id'] ?? null, fn ($query, $serviceId) => $query->where('service_id', $serviceId))
            // Filtro por solicitante (usuarios solo ven sus propias solicitudes)
            ->when($filters['requester_id'] ?? null, fn ($query, $requesterId) => $query->where('user_id', $requesterId))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%");
            })
            ->latest('submitted_at')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function store(array $data, ?User $user = null): ServiceRequest
    {
        $data['code'] ??= strtoupper(Str::random(6));
        $data['user_id'] = $user?->id;

        return ServiceRequest::create($data)->fresh(['service', 'requester']);
    }

    public function updateStatus(ServiceRequest $request, string $status): ServiceRequest
    {
        $request->update(['status' => RequestStatus::from($status)]);
        return $request->fresh(['service', 'requester']);
    }
}
