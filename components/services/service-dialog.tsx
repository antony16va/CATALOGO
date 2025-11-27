"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ServicePriority, ServiceStatus } from "@/types/service"

export interface ServiceFormValues {
  code: string
  name: string
  description: string
  categoryId: number
  subcategoryId?: number | null
  slaId: number
  priority: ServicePriority
  status: ServiceStatus
  keywords?: string
}

interface Option {
  id: number
  name: string
}

interface ServiceDialogProps {
  service: {
    id: number
    code: string
    name: string
    description: string
    categoryId?: number | null
    subcategoryId?: number | null
    priority: ServicePriority
    status: ServiceStatus
    slaId?: number | null
    keywords?: string | null
  } | null
  categories: Option[]
  slas: Option[]
  loadSubcategories: (categoryId: number) => Promise<Option[]>
  onClose: () => void
  onSave: (values: ServiceFormValues) => Promise<void>
}

const priorityOptions: ServicePriority[] = ["Baja", "Media", "Alta", "Crítica"]
const statusOptions: ServiceStatus[] = ["Borrador", "Publicado", "Inactivo"]

export function ServiceDialog({ service, categories, slas, loadSubcategories, onClose, onSave }: ServiceDialogProps) {
  const initialCategory = categories[0]?.id ?? ""
  const initialSla = slas[0]?.id ?? ""

  const [formData, setFormData] = useState({
    code: service?.code ?? "",
    name: service?.name ?? "",
    description: service?.description ?? "",
    categoryId: service?.categoryId ? String(service.categoryId) : initialCategory ? String(initialCategory) : "",
    subcategoryId: service?.subcategoryId ? String(service.subcategoryId) : "",
    slaId: service?.slaId ? String(service.slaId) : initialSla ? String(initialSla) : "",
    priority: service?.priority ?? "Media",
    status: service?.status ?? "Borrador",
    keywords: service?.keywords ?? "",
  })
  const [subcategories, setSubcategories] = useState<Option[]>([])
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData({
      code: service?.code ?? "",
      name: service?.name ?? "",
      description: service?.description ?? "",
      categoryId: service?.categoryId ? String(service.categoryId) : initialCategory ? String(initialCategory) : "",
      subcategoryId: service?.subcategoryId ? String(service.subcategoryId) : "",
      slaId: service?.slaId ? String(service.slaId) : initialSla ? String(initialSla) : "",
      priority: service?.priority ?? "Media",
      status: service?.status ?? "Borrador",
      keywords: service?.keywords ?? "",
    })
    setErrors({})
    setSubmitError(null)
  }, [service, initialCategory, initialSla])

  useEffect(() => {
    const categoryId = Number(formData.categoryId)
    if (!categoryId) {
      setSubcategories([])
      setFormData((prev) => ({ ...prev, subcategoryId: "" }))
      return
    }

    let mounted = true
    setSubcategoriesLoading(true)
    loadSubcategories(categoryId)
      .then((options) => {
        if (!mounted) return
        setSubcategories(options)
        const exists = options.some((opt) => String(opt.id) === formData.subcategoryId)
        if (!exists) {
          setFormData((prev) => ({ ...prev, subcategoryId: "" }))
        }
      })
      .catch(() => {
        if (mounted) setSubcategories([])
      })
      .finally(() => {
        if (mounted) setSubcategoriesLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [formData.categoryId, loadSubcategories, service?.subcategoryId])

  const categoryName = useMemo(() => {
    return categories.find((cat) => String(cat.id) === formData.categoryId)?.name ?? "-"
  }, [categories, formData.categoryId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "El código es obligatorio"
    }
    if (!formData.name.trim()) {
      newErrors.name = "El nombre del servicio es requerido"
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida"
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "La descripción debe tener al menos 10 caracteres"
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Selecciona una categoría"
    }

    if (!formData.slaId) {
      newErrors.slaId = "Selecciona un SLA"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSave({
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: Number(formData.categoryId),
        subcategoryId: formData.subcategoryId ? Number(formData.subcategoryId) : undefined,
        slaId: Number(formData.slaId),
        priority: formData.priority,
        status: formData.status,
        keywords: formData.keywords?.trim(),
      })
      onClose()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo guardar el servicio.")
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
        className="w-full max-w-2xl bg-card border border-primary/20 rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {service ? "Editar servicio" : "Nuevo servicio"}
            </p>
            <h2 className="text-xl font-bold text-foreground">{service ? service.name : "Registrar servicio"}</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Palabras clave</label>
            <Input
              value={formData.keywords}
              onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
              placeholder="Ej: accesos, soporte, VPN"
              className="bg-secondary/50 border-primary/20"
            />
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {(submitError || Object.keys(errors).length > 0) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError ?? "Por favor corrige los errores del formulario."}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Código
                <span className="text-destructive ml-1">*</span>
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="Ej: SRV-001"
                className={`bg-secondary/50 border-primary/20 ${errors.code ? "border-destructive" : ""}`}
              />
              {errors.code && <p className="text-destructive text-sm mt-1">{errors.code}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre del servicio
                <span className="text-destructive ml-1">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Mesa de ayuda TI"
                className={`bg-secondary/50 border-primary/20 ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descripción
              <span className="text-destructive ml-1">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el alcance, condiciones y canales del servicio..."
              className={`w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${
                errors.description ? "border-destructive" : ""
              }`}
              rows={4}
            />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Categoría
                <span className="text-destructive ml-1">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                className={`w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.categoryId ? "border-destructive" : ""
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-destructive text-sm mt-1">{errors.categoryId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Subcategoría</label>
              <select
                value={formData.subcategoryId}
                onChange={(e) => setFormData((prev) => ({ ...prev, subcategoryId: e.target.value }))}
                className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                disabled={subcategoriesLoading || subcategories.length === 0}
              >
                <option value="">Sin subcategoría</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              {subcategoriesLoading && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Cargando subcategorías de {categoryName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as ServicePriority }))}
                className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ServiceStatus }))}
                className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SLA
                <span className="text-destructive ml-1">*</span>
              </label>
              <select
                value={formData.slaId}
                onChange={(e) => setFormData((prev) => ({ ...prev, slaId: e.target.value }))}
                className={`w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.slaId ? "border-destructive" : ""
                }`}
              >
                <option value="">Selecciona un SLA</option>
                {slas.map((sla) => (
                  <option key={sla.id} value={sla.id}>
                    {sla.name}
                  </option>
                ))}
              </select>
              {errors.slaId && <p className="text-destructive text-sm mt-1">{errors.slaId}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : service ? (
                "Actualizar servicio"
              ) : (
                "Crear servicio"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
