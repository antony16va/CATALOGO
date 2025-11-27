<?php

namespace App\Enums;

enum TemplateFieldType: string
{
    case Text = 'texto';
    case TextArea = 'textarea';
    case Email = 'email';
    case Number = 'numero';
    case Date = 'fecha';
    case Select = 'select';
    case Checkbox = 'checkbox';
    case File = 'archivo';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
