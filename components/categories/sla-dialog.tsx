"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { SLA } from "@/types/sla"

export interface SlaFormValues {
  name: string
  description: string
  responseTime: number
  resolutionTime: number
  pauseConditions: string
}

interface SLADialogProps {
  sla: SLA | null
  onClose: () => void
  onSave: (data: SlaFormValues) => Promise<void>
}

export function SLADialog({ sla, onClose, onSave }: SLADialogProps) {
  const [formData, setFormData] = useState<SlaFormValues>({
    name: "",
    description: "",
    responseTime: 60,
    resolutionTime: 240,
    pauseConditions: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (sla) {
      setFormData({
        name: sla.name,
        description: sla.description ?? "",
        responseTime: sla.responseTime,
        resolutionTime: sla.resolutionTime,
        pauseConditions: sla.pauseConditions ?? "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
        responseTime: 60,
        resolutionTime: 240,
        pauseConditions: "",
      })
    }
    setErrors({})
    setSubmitError(null)
  }, [sla])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (formData.responseTime <= 0) {
      newErrors.responseTime = "El tiempo de respuesta debe ser mayor a 0"
    }

    if (formData.resolutionTime <= 0) {
      newErrors.resolutionTime = "El tiempo de resolución debe ser mayor a 0"
    }

    if (formData.resolutionTime < formData.responseTime) {
      newErrors.resolutionTime = "La resolución debe ser mayor o igual al tiempo de respuesta"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        responseTime: formData.responseTime,
        resolutionTime: formData.resolutionTime,
        pauseConditions: formData.pauseConditions.trim(),
      })
      onClose()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo guardar el SLA.")
    } finally {
      setIsSubmitting(false)
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
          <h2 className="text-xl font-bold text-foreground">{sla ? "Editar SLA" : "Nuevo SLA"}</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {(Object.keys(errors).length > 0 || submitError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {submitError ?? "Por favor corrige los errores en el formulario"}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre del SLA <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Soporte Premium"
              className={`bg-secondary/50 border-primary/20 ${errors.name ? "border-destructive" : ""}`}
              required
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe los términos de servicio..."
              className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tiempo de Respuesta (minutos) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={formData.responseTime}
                onChange={(e) => setFormData({ ...formData, responseTime: Number.parseInt(e.target.value) || 0 })}
                className={`bg-secondary/50 border-primary/20 ${errors.responseTime ? "border-destructive" : ""}`}
                required
              />
              {errors.responseTime && <p className="text-destructive text-sm mt-1">{errors.responseTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tiempo de Resolución (minutos) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={formData.resolutionTime}
                onChange={(e) => setFormData({ ...formData, resolutionTime: Number.parseInt(e.target.value) || 0 })}
                className={`bg-secondary/50 border-primary/20 ${errors.resolutionTime ? "border-destructive" : ""}`}
                required
              />
              {errors.resolutionTime && <p className="text-destructive text-sm mt-1">{errors.resolutionTime}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Condiciones de pausa</label>
            <textarea
              value={formData.pauseConditions}
              onChange={(e) => setFormData((prev) => ({ ...prev, pauseConditions: e.target.value }))}
              placeholder="Describe en qué situaciones se pausa el reloj del SLA..."
              className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground resize-none"
              rows={3}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50 bg-secondary/20">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-primary/20 text-foreground hover:bg-secondary/50 bg-transparent"
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            {isSubmitting ? "Guardando..." : sla ? "Actualizar" : "Crear"} SLA
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
