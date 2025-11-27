<?php

namespace App\Enums;

enum ServiceStatus: string
{
    case Draft = 'Borrador';
    case Published = 'Publicado';
    case Inactive = 'Inactivo';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
