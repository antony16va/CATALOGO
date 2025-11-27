<?php

namespace App\Enums;

enum ServicePriority: string
{
    case Low = 'Baja';
    case Medium = 'Media';
    case High = 'Alta';
    case Critical = 'Crítica';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
