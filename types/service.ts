export type ServicePriority = "Baja" | "Media" | "Alta" | "Crítica"
export type ServiceStatus = "Borrador" | "Publicado" | "Inactivo"

export interface Service {
  id: number
  code: string
  name: string
  description: string
  category: string
  categoryId?: number | null
  subcategory?: string | null
  subcategoryId?: number | null
  priority: ServicePriority
  status: ServiceStatus
  sla: string
  slaId?: number | null
  keywords?: string | null
  createdAt: Date
}
