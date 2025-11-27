"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * Valores del formulario de solicitud
 */
export interface RequestFormValues {
  serviceId: number
  description: string
  priority?: string
}

/**
 * Opción genérica para selects
 */
interface Option {
  id: number
  name: string
  priority?: string
}

/**
 * Props del diálogo de solicitud
 */
interface RequestDialogProps {
  /** Lista de servicios disponibles */
  services: Option[]
  /** Función para cerrar el diálogo */
  onClose: () => void
  /** Función para guardar la solicitud */
  onSave: (values: RequestFormValues) => Promise<void>
}

/**
 * Diálogo modal para crear una nueva solicitud de servicio.
 * Permite seleccionar un servicio y agregar una descripción.
 */
export function RequestDialog({ services, onClose, onSave }: RequestDialogProps) {
  const [formData, setFormData] = useState({
    serviceId: services[0]?.id ? String(services[0].id) : "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Resetear formulario cuando cambian los servicios
  useEffect(() => {
    setFormData({
      serviceId: services[0]?.id ? String(services[0].id) : "",
      description: "",
    })
    setErrors({})
    setSubmitError(null)
  }, [services])

  /**
   * Obtiene la prioridad del servicio seleccionado
   */
  const selectedService = services.find((s) => String(s.id) === formData.serviceId)

  /**
   * Valida el formulario antes de enviar
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.serviceId) {
      newErrors.serviceId = "Selecciona un servicio"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida"
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "La descripción debe tener al menos 10 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSave({
        serviceId: Number(formData.serviceId),
        description: formData.description.trim(),
        priority: selectedService?.priority,
      })
      onClose()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo crear la solicitud.")
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Actualiza un campo del formulario
   */
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card border border-primary/20 rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Nueva solicitud</p>
            <h2 className="text-xl font-bold text-foreground">Crear Solicitud</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Servicio */}
          <div className="space-y-2">
            <label htmlFor="serviceId" className="text-sm font-medium text-foreground">
              Servicio <span className="text-destructive">*</span>
            </label>
            <select
              id="serviceId"
              value={formData.serviceId}
              onChange={(e) => handleChange("serviceId", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-primary/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Selecciona un servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            {errors.serviceId && <p className="text-xs text-destructive">{errors.serviceId}</p>}
          </div>

          {/* Prioridad (solo lectura, basada en el servicio) */}
          {selectedService?.priority && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Prioridad</label>
              <Input
                value={selectedService.priority}
                disabled
                className="bg-secondary/30 border-primary/20 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">La prioridad se hereda del servicio seleccionado</p>
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Descripción <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe detalladamente tu solicitud..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-primary/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Solicitud"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
