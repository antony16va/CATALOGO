<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
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
            'code' => $this->code,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'subcategory' => SubcategoryResource::make($this->whenLoaded('subcategory')),
            'sla' => SlaResource::make($this->whenLoaded('sla')),
            'priority' => $this->priority,
            'status' => $this->status,
            'keywords' => $this->keywords,
            'metadata' => $this->metadata,
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
