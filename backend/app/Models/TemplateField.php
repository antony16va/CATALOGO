<?php

namespace App\Models;

use App\Enums\TemplateFieldType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplateField extends Model
{
    use HasFactory;

    protected $table = 'catalogo_servicios_campos_plantilla';

    protected $fillable = [
        'template_id',
        'field_name',
        'label',
        'type',
        'options',
        'help_text',
        'required',
        'validation_pattern',
        'error_message',
        'placeholder',
        'order',
    ];

    protected $casts = [
        'type' => TemplateFieldType::class,
        'options' => 'array',
        'required' => 'boolean',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(ServiceTemplate::class, 'template_id');
    }
}
