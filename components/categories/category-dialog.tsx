"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Category } from "@/types/category"

const ICONS = ["💻", "🏗️", "📦", "🧠", "📡", "🛰️", "🧩", "🚀"]
const COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-purple-500",
  "from-rose-500 to-red-500",
  "from-slate-500 to-slate-600",
  "from-lime-500 to-green-500",
]

export interface CategoryFormValues {
  name: string
  description: string
  icon: string
  color: string
}

interface CategoryDialogProps {
  category: Category | null
  onClose: () => void
  onSave: (data: CategoryFormValues) => Promise<void>
}

export function CategoryDialog({ category, onClose, onSave }: CategoryDialogProps) {
  const [formData, setFormData] = useState<CategoryFormValues>({
    name: "",
    description: "",
    icon: ICONS[0],
    color: COLORS[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        icon: category.icon ?? ICONS[0],
        color: category.color ?? COLORS[0],
      })
    } else {
      setFormData({
        name: "",
        description: "",
        icon: ICONS[0],
        color: COLORS[0],
      })
    }
    setErrors({})
    setSubmitError(null)
  }, [category])

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      nextErrors.name = "El nombre es obligatorio"
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = "El nombre debe tener al menos 2 caracteres"
    }

    if (!formData.description.trim()) {
      nextErrors.description = "La descripción es obligatoria"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color,
      })
      onClose()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo guardar la categoría.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = category ? "Editar categoría" : "Nueva categoría"

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
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg bg-card border border-primary/20 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border/30 bg-gradient-to-r from-primary/10 to-accent/10">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
            <h2 className="text-xl font-semibold text-foreground">{category ? category.name : "Registrar categoría"}</h2>
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Tecnología"
              className={`bg-secondary/50 border-primary/20 ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descripción <span className="text-destructive">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el alcance de la categoría..."
              className={`w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${
                errors.description ? "border-destructive" : ""
              }`}
              rows={3}
            />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Icono</label>
            <div className="grid grid-cols-4 gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                  className={`p-3 rounded-lg text-2xl transition border-2 ${
                    formData.icon === icon ? "border-primary bg-primary/10" : "border-primary/20 hover:border-primary/40"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Color</label>
            <div className="grid grid-cols-3 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`p-4 rounded-lg transition border-2 bg-gradient-to-br ${color} ${
                    formData.color === color ? "border-foreground" : "border-transparent opacity-70"
                  }`}
                />
              ))}
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50 bg-secondary/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-primary/20 text-foreground hover:bg-secondary/50 bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            {isSubmitting ? "Guardando..." : category ? "Actualizar" : "Crear"} categoría
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
