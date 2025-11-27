"use client"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Edit2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Service } from "@/types/service"
import { cn } from "@/lib/utils"

interface ServiceCardsProps {
  services: Service[]
  onEdit: (service: Service) => void
  onDelete: (id: number) => void
  /** Si es false, oculta los botones de editar/eliminar (para usuarios no admin) */
  showActions?: boolean
}

export function ServiceCards({ services, onEdit, onDelete, showActions = true }: ServiceCardsProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-4 sm:p-6 hover:border-primary/40 transition-all hover:shadow-lg group cursor-pointer h-full flex flex-col">
            <div className="flex-1 mb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 line-clamp-2 group-hover:text-primary transition">
                    {service.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">{service.category}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4">{service.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    service.priority === "Alta" && "border-destructive/50 bg-destructive/10 text-destructive",
                    service.priority === "Media" && "border-orange-500/50 bg-orange-500/10 text-orange-500",
                    service.priority === "Baja" && "border-green-500/50 bg-green-500/10 text-green-500",
                    service.priority === "Crítica" && "border-red-600/50 bg-red-600/10 text-red-500",
                  )}
                >
                  {service.priority}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    service.status === "Publicado" && "border-green-500/50 bg-green-500/10 text-green-500",
                    service.status === "Borrador" && "border-orange-500/50 bg-orange-500/10 text-orange-500",
                    service.status === "Inactivo" && "border-muted-foreground/50 bg-secondary/50 text-muted-foreground",
                  )}
                >
                  {service.status}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground bg-secondary/30 rounded px-2 py-1 inline-block">
                {service.sla}
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(service)}
                  className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary transition flex-1 flex items-center justify-center"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(service.id)}
                  className="p-1.5 sm:p-2 text-muted-foreground hover:text-destructive transition flex-1 flex items-center justify-center"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
