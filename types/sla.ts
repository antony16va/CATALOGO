export interface SLA {
  id: number
  name: string
  description: string
  responseTime: number
  resolutionTime: number
  pauseConditions?: string | null
  active: boolean
  createdAt: Date
}
