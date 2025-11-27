"use client"

import { motion } from "framer-motion"
import { X, Copy, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { FormField, TemplateFieldType } from "@/types/form-template"

interface FormFieldBuilderProps {
  field: FormField
  onUpdate: (field: FormField) => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

const FIELD_TYPES: Array<{ value: TemplateFieldType; label: string }> = [
  { value: "texto", label: "Texto corto" },
  { value: "textarea", label: "Texto largo" },
  { value: "email", label: "Correo" },
  { value: "numero", label: "Número" },
  { value: "fecha", label: "Fecha" },
  { value: "select", label: "Lista desplegable" },
  { value: "checkbox", label: "Casillas de verificación" },
  { value: "archivo", label: "Archivo adjunto" },
]

export function FormFieldBuilder({
  field,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: FormFieldBuilderProps) {
  const sanitizeFieldName = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .toLowerCase()
      .trim()

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Campo: {field.label || "Sin título"}</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="h-8 w-8 p-0"
              title="Subir campo"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="h-8 w-8 p-0"
              title="Bajar campo"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDuplicate}
              className="h-8 w-8 p-0 hover:bg-primary/20"
              title="Duplicar campo"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 p-0 hover:bg-destructive/20 text-destructive hover:text-destructive"
              title="Eliminar campo"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Etiqueta *</label>
            <Input
              value={field.label}
              onChange={(e) => onUpdate({ ...field, label: e.target.value })}
              placeholder="Ej: Nombre completo"
              className="bg-secondary/50 border-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tipo de campo *</label>
            <select
              value={field.type}
              onChange={(e) => onUpdate({ ...field, type: e.target.value as TemplateFieldType })}
              className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground"
            >
              {FIELD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Identificador técnico *</label>
          <Input
            value={field.fieldName ?? ""}
            onChange={(e) => onUpdate({ ...field, fieldName: sanitizeFieldName(e.target.value) })}
            placeholder="Ej: nombre_completo"
            className="bg-secondary/50 border-primary/20 font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Sin espacios, se usa en las respuestas almacenadas.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Placeholder</label>
          <Input
            value={field.placeholder || ""}
            onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
            placeholder="Texto de ayuda..."
            className="bg-secondary/50 border-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Descripción / texto de ayuda</label>
          <textarea
            value={field.description || ""}
            onChange={(e) => onUpdate({ ...field, description: e.target.value })}
            placeholder="Descripción del campo..."
            className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground resize-none"
            rows={2}
          />
        </div>

        {["select", "checkbox"].includes(field.type) && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Opciones (una por línea) *</label>
            <textarea
              value={(field.options || []).join("\n")}
              onChange={(e) => onUpdate({ ...field, options: e.target.value.split("\n").filter((opt) => opt.trim()) })}
              placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
              className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground resize-none"
              rows={3}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`required-${field.id}`}
            checked={field.required}
            onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
            className="rounded border-primary/20"
          />
          <label htmlFor={`required-${field.id}`} className="text-sm text-foreground cursor-pointer">
            Requerido
          </label>
        </div>
      </Card>
    </motion.div>
  )
}
