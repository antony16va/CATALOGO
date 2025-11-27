<?php

namespace App\Enums;

enum UserRole: string
{
    case Administrator = 'Administrador';
    case User = 'Usuario';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
