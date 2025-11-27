<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplateFieldResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'template_id' => $this->template_id,
            'field_name' => $this->field_name,
            'label' => $this->label,
            'type' => $this->type,
            'options' => $this->options,
            'help_text' => $this->help_text,
            'required' => $this->required,
            'validation_pattern' => $this->validation_pattern,
            'error_message' => $this->error_message,
            'placeholder' => $this->placeholder,
            'order' => $this->order,
        ];
    }
}
