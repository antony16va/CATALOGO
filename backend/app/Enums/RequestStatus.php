<?php

namespace App\Enums;

enum RequestStatus: string
{
    case Pending = 'Pendiente';
    case InProgress = 'En Proceso';
    case Resolved = 'Resuelta';
    case Cancelled = 'Cancelada';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
