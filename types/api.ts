export interface ApiUser {
  id: number
  username: string
  full_name: string
  email: string
  role: 'Administrador' | 'Usuario'
  active: boolean
  last_accessed_at: string | null
  created_at: string
  updated_at: string
}

export interface ApiCategory {
  id: number
  name: string
  description: string | null
  icon: string | null
  color: string | null
  active: boolean
  services_count?: number
  subcategories?: ApiSubcategory[]
  created_at: string
  updated_at: string
}

export interface ApiSubcategory {
  id: number
  category_id: number
  name: string
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface ApiSla {
  id: number
  name: string
  description: string | null
  first_response_minutes: number
  resolution_minutes: number
  pause_conditions: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface ApiService {
  id: number
  code: string
  name: string
  slug: string
  description: string
  category?: ApiCategory | null
  subcategory?: ApiSubcategory | null
  sla?: ApiSla | null
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica'
  status: 'Borrador' | 'Publicado' | 'Inactivo'
  keywords: string | null
  metadata: Record<string, unknown> | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type ApiTemplateFieldType =
  | 'texto'
  | 'textarea'
  | 'email'
  | 'numero'
  | 'fecha'
  | 'select'
  | 'checkbox'
  | 'archivo'

export interface ApiTemplateField {
  id: number
  template_id: number
  field_name: string
  label: string
  type: ApiTemplateFieldType
  options: string[] | null
  help_text: string | null
  required: boolean
  validation_pattern: string | null
  error_message: string | null
  placeholder: string | null
  order: number
}

export interface ApiTemplate {
  id: number
  service_id: number
  name: string
  description: string | null
  active: boolean
  version: number
  fields?: ApiTemplateField[]
  created_at: string
  updated_at: string
}

export type ApiRequestStatus = 'Pendiente' | 'En Proceso' | 'Resuelta' | 'Cancelada'

export interface ApiRequest {
  id: number
  code: string
  service_id: number
  template_id: number | null
  status: ApiRequestStatus
  form_payload: Record<string, unknown>
  submitted_at: string
  redirected_at: string | null
  sla_snapshot: {
    name: string
    first_response_minutes: number
    resolution_minutes: number
  } | null
  service_snapshot: {
    code: string
    name: string
    priority: string
  } | null
  service?: ApiService | null
  requester?: ApiUser | null
  created_at: string
  updated_at: string
}

export interface ApiAuditLog {
  id: number
  module: string | null
  action: string | null
  description: string | null
  affected_table: string | null
  affected_id: number | null
  changes: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  user?: ApiUser | null
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
  }
}
