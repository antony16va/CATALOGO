export type AuditLogStatus = "success" | "warning" | "error"

export interface AuditLogEntry {
  id: number
  action: string
  entity: string
  entityName: string
  user: string
  timestamp: Date
  status: AuditLogStatus
  description: string
}
