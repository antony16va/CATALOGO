"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Trash2, Clock, User, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ServiceRequestSummary, RequestStatus } from "@/types/request"
import { cn } from "@/lib/utils"

interface RequestCardsProps {
  /** Lista de solicitudes a mostrar */
  requests: ServiceRequestSummary[]
  /** Si es admin, puede cambiar estado y eliminar */
  isAdmin: boolean
  /** ID de la solicitud que está siendo actualizada */
  updatingId: number | null
  /** Callback para cambiar el estado de una solicitud */
  onStatusChange: (requestId: number, newStatus: RequestStatus) => void
  /** Callback para eliminar una solicitud */
  onDelete: (requestId: number) => void
}

const STATUS_OPTIONS: RequestStatus[] = ["Pendiente", "En Proceso", "Resuelta", "Cancelada"]

/**
 * Componente de tarjetas para mostrar solicitudes en vista compacta/móvil.
 */
export function RequestCards({
  requests,
  isAdmin,
  updatingId,
  onStatusChange,
  onDelete,
}: RequestCardsProps) {
  if (requests.length === 0) {
    return (
      <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-12">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">No hay solicitudes</p>
          <p className="text-sm text-muted-foreground">Las solicitudes aparecerán aquí</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {requests.map((request, index) => (
        <motion.div
          key={request.id ?? `request-${index}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
        >
          <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-4 sm:p-5 hover:border-primary/40 transition-all hover:shadow-lg h-full flex flex-col">
            {/* Header con código y estado */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-foreground">{request.code}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {request.submittedAt.toLocaleDateString("es-PE")}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>

            {/* Servicio */}
            <div className="mb-3">
              <p className="text-sm font-medium text-foreground line-clamp-1">{request.serviceName}</p>
              {request.priority && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs mt-1",
                    request.priority === "Alta" && "border-destructive/50 bg-destructive/10 text-destructive",
                    request.priority === "Media" && "border-orange-500/50 bg-orange-500/10 text-orange-500",
                    request.priority === "Baja" && "border-green-500/50 bg-green-500/10 text-green-500",
                    request.priority === "Crítica" && "border-red-600/50 bg-red-600/10 text-red-500",
                  )}
                >
                  {request.priority}
                </Badge>
              )}
            </div>

            {/* Descripción */}
            {request.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                {request.description}
              </p>
            )}

            {/* Solicitante (solo admin) */}
            {isAdmin && (
              <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">{request.requesterName}</span>
              </div>
            )}

            {/* SLA */}
            {request.slaName && (
              <div className="text-xs text-muted-foreground bg-secondary/30 rounded px-2 py-1 mb-3">
                <span className="font-medium">{request.slaName}</span>
                {request.slaResponseMinutes && request.slaResolutionMinutes && (
                  <span className="ml-1 opacity-75">
                    ({request.slaResponseMinutes}m / {request.slaResolutionMinutes}m)
                  </span>
                )}
              </div>
            )}

            {/* Acciones de admin */}
            {isAdmin && (
              <div className="pt-3 border-t border-border/50 space-y-2">
                <select
                  value={request.status}
                  onChange={(e) => onStatusChange(request.id, e.target.value as RequestStatus)}
                  disabled={updatingId === request.id}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-primary/20 bg-secondary/30 text-foreground"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDelete(request.id)}
                  className="w-full p-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Eliminar
                </motion.button>
              </div>
            )}

            {/* Badge de estado para usuarios (no admin) */}
            {!isAdmin && (
              <div className="pt-3 border-t border-border/50 mt-auto">
                <StatusBadge status={request.status} fullWidth />
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Badge de estado con colores según el estado de la solicitud.
 */
function StatusBadge({ status, fullWidth }: { status: RequestStatus; fullWidth?: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        fullWidth && "w-full justify-center",
        status === "Pendiente" && "border-yellow-500/50 bg-yellow-500/10 text-yellow-500",
        status === "En Proceso" && "border-blue-500/50 bg-blue-500/10 text-blue-500",
        status === "Resuelta" && "border-green-500/50 bg-green-500/10 text-green-500",
        status === "Cancelada" && "border-red-500/50 bg-red-500/10 text-red-500",
      )}
    >
      {status}
    </Badge>
  )
}
