"use client"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Edit2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Service } from "@/types/service"
import { cn } from "@/lib/utils"

interface ServiceTableProps {
  services: Service[]
  onEdit: (service: Service) => void
  onDelete: (id: number) => void
  /** Si es false, oculta la columna de acciones (para usuarios no admin) */
  showActions?: boolean
}

export function ServiceTable({ services, onEdit, onDelete, showActions = true }: ServiceTableProps) {
  if (services.length === 0) {
    return (
      <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-12">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <p className="text-muted-foreground mb-2">No hay servicios registrados</p>
          <p className="text-sm text-muted-foreground">Crea uno nuevo para comenzar</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/20">
              <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-muted-foreground">
                Servicio
              </th>
              <th className="hidden sm:table-cell px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-muted-foreground">
                Categoría
              </th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-muted-foreground">
                Prioridad
              </th>
              <th className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-muted-foreground">
                Estado
              </th>
              <th className="hidden lg:table-cell px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-muted-foreground">
                SLA
              </th>
              {showActions && (
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-muted-foreground">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <motion.tr
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
              >
                <td className="px-3 md:px-6 py-3 md:py-4">
                  <div>
                    <p className="font-medium text-foreground text-xs md:text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{service.description}</p>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-muted-foreground">
                  {service.category}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      service.priority === "Alta" && "border-destructive/50 bg-destructive/10 text-destructive",
                      service.priority === "Media" && "border-orange-500/50 bg-orange-500/10 text-orange-500",
                      service.priority === "Baja" && "border-green-500/50 bg-green-500/10 text-green-500",
                      service.priority === "Crítica" && "border-red-600/60 bg-red-600/10 text-red-500",
                    )}
                  >
                    {service.priority}
                  </Badge>
                </td>
                <td className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      service.status === "Publicado" && "border-green-500/50 bg-green-500/10 text-green-500",
                      service.status === "Borrador" && "border-orange-400/50 bg-orange-400/10 text-orange-500",
                      service.status === "Inactivo" &&
                        "border-muted-foreground/50 bg-secondary/50 text-muted-foreground",
                    )}
                  >
                    {service.status}
                  </Badge>
                </td>
                <td className="hidden lg:table-cell px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-muted-foreground">
                  {service.sla}
                </td>
                {showActions && (
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit(service)}
                        className="p-1.5 md:p-2 text-muted-foreground hover:text-primary transition"
                        title="Editar"
                      >
                        <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(service.id)}
                        className="p-1.5 md:p-2 text-muted-foreground hover:text-destructive transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      </motion.button>
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
