<?php

namespace App\Models;

use App\Enums\RequestStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $table = 'catalogo_servicios_solicitudes';

    protected $fillable = [
        'service_id',
        'user_id',
        'template_id',
        'code',
        'form_payload',
        'status',
        'submitted_at',
        'redirected_at',
        'sla_snapshot',
        'service_snapshot',
    ];

    protected $casts = [
        'status' => RequestStatus::class,
        'form_payload' => 'array',
        'sla_snapshot' => 'array',
        'service_snapshot' => 'array',
        'submitted_at' => 'datetime',
        'redirected_at' => 'datetime',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ServiceTemplate::class, 'template_id');
    }
}
