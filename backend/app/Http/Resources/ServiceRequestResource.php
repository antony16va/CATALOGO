<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceRequestResource extends JsonResource
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
            'service_id' => $this->service_id,
            'service' => ServiceResource::make($this->whenLoaded('service')),
            'requester' => UserResource::make($this->whenLoaded('requester')),
            'template_id' => $this->template_id,
            'form_payload' => $this->form_payload,
            'status' => $this->status,
            'submitted_at' => $this->submitted_at,
            'redirected_at' => $this->redirected_at,
            'sla_snapshot' => $this->sla_snapshot,
            'service_snapshot' => $this->service_snapshot,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
