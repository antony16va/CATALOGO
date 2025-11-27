import { apiFetch } from './client'
import type {
  ApiAuditLog,
  ApiCategory,
  ApiRequest,
  ApiRequestStatus,
  ApiService,
  ApiSla,
  ApiSubcategory,
  ApiTemplate,
  ApiTemplateField,
  ApiUser,
  PaginatedResponse,
} from '@/types/api'

// ============================================================================
// USUARIOS
// ============================================================================

/**
 * Obtiene lista paginada de usuarios
 * @param params - Filtros: role, active, search, per_page
 */
export async function fetchUsers(params: Record<string, string | number | boolean> = {}) {
  return apiFetch<PaginatedResponse<ApiUser>>('users', { searchParams: params })
}

/**
 * Payload para crear/actualizar usuarios
 */
export interface UserPayload {
  username: string
  email: string
  password?: string
  full_name: string
  role: 'Administrador' | 'Usuario'
  active?: boolean
}

/**
 * Crea un nuevo usuario
 * @param payload - Datos del usuario
 */
export async function createUser(payload: UserPayload) {
  return apiFetch<ApiUser>('users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Actualiza un usuario existente
 * @param id - ID del usuario
 * @param payload - Datos a actualizar (password es opcional)
 */
export async function updateUser(id: number, payload: Partial<UserPayload>) {
  return apiFetch<ApiUser>(`users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/**
 * Elimina un usuario
 * @param id - ID del usuario
 */
export async function deleteUser(id: number) {
  await apiFetch<void>(`users/${id}`, { method: 'DELETE' })
}

/**
 * Activa/desactiva un usuario
 * @param id - ID del usuario
 */
export async function toggleUserActive(id: number) {
  return apiFetch<ApiUser>(`users/${id}/toggle-active`, {
    method: 'PATCH',
  })
}

// ============================================================================
// CATEGORÍAS
// ============================================================================

export async function fetchCategories(params: Record<string, string | number | boolean> = {}) {
  return apiFetch<PaginatedResponse<ApiCategory>>('categories', {
    searchParams: params,
  })
}

export async function createCategory(payload: Partial<ApiCategory>) {
  return apiFetch<ApiCategory>('categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateCategory(id: number, payload: Partial<ApiCategory>) {
  return apiFetch<ApiCategory>(`categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteCategory(id: number) {
  await apiFetch<void>(`categories/${id}`, { method: 'DELETE' })
}

export async function fetchPublicCategories() {
  return apiFetch<ApiCategory[]>('catalog/categories')
}

export async function fetchSubcategories(categoryId: number) {
  return apiFetch<ApiSubcategory[]>(`categories/${categoryId}/subcategories`)
}

export async function fetchSlas(params: Record<string, string | number | boolean> = {}) {
  return apiFetch<PaginatedResponse<ApiSla>>('slas', {
    searchParams: params,
  })
}

export async function fetchServices(params: Record<string, string | number | boolean> = {}) {
  return apiFetch<PaginatedResponse<ApiService>>('services', { searchParams: params })
}

export async function fetchPublicServices() {
  return apiFetch<ApiService[]>('catalog/services')
}

export interface ServiceRecordPayload {
  code: string
  name: string
  description: string
  category_id: number
  subcategory_id?: number | null
  sla_id?: number | null
  priority: string
  status: string
  keywords?: string | null
  metadata?: Record<string, unknown> | null
}

export async function createServiceRecord(payload: ServiceRecordPayload) {
  return apiFetch<ApiService>('services', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateServiceRecord(id: number, payload: Partial<ServiceRecordPayload>) {
  return apiFetch<ApiService>(`services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteServiceRecord(id: number) {
  await apiFetch<void>(`services/${id}`, { method: 'DELETE' })
}

export interface SlaRequestPayload {
  name: string
  description?: string | null
  responseTime: number
  resolutionTime: number
  pauseConditions?: string | null
  active?: boolean
}

const mapSlaPayload = (payload: SlaRequestPayload) => ({
  name: payload.name,
  description: payload.description,
  first_response_minutes: payload.responseTime,
  resolution_minutes: payload.resolutionTime,
  pause_conditions: payload.pauseConditions,
  active: payload.active ?? true,
})

export async function createSlaRecord(payload: SlaRequestPayload) {
  return apiFetch<ApiSla>('slas', {
    method: 'POST',
    body: JSON.stringify(mapSlaPayload(payload)),
  })
}

export async function updateSlaRecord(id: number, payload: SlaRequestPayload) {
  return apiFetch<ApiSla>(`slas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapSlaPayload(payload)),
  })
}

export async function deleteSlaRecord(id: number) {
  await apiFetch<void>(`slas/${id}`, { method: 'DELETE' })
}

export interface TemplatePayload {
  service_id: number
  name: string
  description?: string | null
  active: boolean
  version?: number
}

export async function fetchTemplatesByService(serviceId: number) {
  return apiFetch<ApiTemplate[]>('templates', {
    searchParams: { service_id: serviceId },
  })
}

export async function fetchTemplate(id: number) {
  return apiFetch<ApiTemplate>(`templates/${id}`)
}

export async function createTemplate(payload: TemplatePayload) {
  return apiFetch<ApiTemplate>('templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTemplate(id: number, payload: Partial<TemplatePayload>) {
  return apiFetch<ApiTemplate>(`templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteTemplate(id: number) {
  await apiFetch<void>(`templates/${id}`, { method: 'DELETE' })
}

export interface TemplateFieldPayload {
  field_name: string
  label: string
  type: ApiTemplateField['type']
  options?: string[]
  help_text?: string | null
  required?: boolean
  validation_pattern?: string | null
  error_message?: string | null
  placeholder?: string | null
  order?: number
}

export async function createTemplateField(templateId: number, payload: TemplateFieldPayload) {
  return apiFetch<ApiTemplateField>(`templates/${templateId}/fields`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTemplateField(fieldId: number, payload: TemplateFieldPayload) {
  return apiFetch<ApiTemplateField>(`template-fields/${fieldId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteTemplateField(fieldId: number) {
  await apiFetch<void>(`template-fields/${fieldId}`, { method: 'DELETE' })
}

export interface ServiceRequestPayload {
  service_id: number
  template_id?: number | null
  form_payload: Record<string, unknown>
}

export async function fetchRequests(params: Record<string, string | number | boolean> = {}) {
  return apiFetch<PaginatedResponse<ApiRequest>>('requests', { searchParams: params })
}

export async function createServiceRequest(payload: ServiceRequestPayload) {
  return apiFetch<ApiRequest>('requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateRequestStatus(id: number, status: ApiRequestStatus) {
  return apiFetch<ApiRequest>(`requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

export async function deleteRequest(id: number) {
  await apiFetch<void>(`requests/${id}`, { method: 'DELETE' })
}

export async function fetchAuditLogs(params: Record<string, string | number | boolean> = {}) {
  return apiFetch<PaginatedResponse<ApiAuditLog>>('audit-logs', {
    searchParams: params,
  })
}
