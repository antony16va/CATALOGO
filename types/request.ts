export type RequestStatus = 'Pendiente' | 'En Proceso' | 'Resuelta' | 'Cancelada'

export interface ServiceRequestSummary {
  id: number
  code: string
  serviceId: number
  serviceName: string
  requesterName: string
  requesterEmail?: string | null
  status: RequestStatus
  submittedAt: Date
  templateId?: number | null
  priority?: string | null
  slaName?: string | null
  slaResponseMinutes?: number | null
  slaResolutionMinutes?: number | null
  /** Descripción de la solicitud (del form_payload) */
  description?: string | null
}
