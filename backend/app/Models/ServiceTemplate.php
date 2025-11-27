<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceTemplate extends Model
{
    use HasFactory;

    protected $table = 'catalogo_servicios_plantillas_solicitud';

    protected $fillable = [
        'service_id',
        'name',
        'description',
        'active',
        'version',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(TemplateField::class, 'template_id')->orderBy('order');
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
