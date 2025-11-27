"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FormFieldBuilder } from "@/components/forms/form-field-builder"
import { TemplatePreview } from "@/components/forms/template-preview"
import { useToast } from "@/hooks"
import {
  fetchServices,
  fetchTemplate,
  updateTemplate,
  createTemplateField,
  updateTemplateField,
  deleteTemplateField,
  type TemplateFieldPayload,
} from "@/lib/api/catalog"
import type { FormField, FormTemplate } from "@/types/form-template"
import type { ApiTemplate, ApiTemplateField, ApiService } from "@/types/api"

interface FieldDiff {
  toCreate: FormField[]
  toUpdate: FormField[]
  toDelete: number[]
}

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const templateId = Number(params.id)

  const [services, setServices] = useState<Array<{ id: number; name: string }>>([])
  const [template, setTemplate] = useState<FormTemplate | null>(null)
  const [initialFieldIds, setInitialFieldIds] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const previewTemplate = useDeferredValue(template)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [servicesResponse, templateResponse] = await Promise.all([
          fetchServices({ per_page: 200 }),
          fetchTemplate(templateId),
        ])
        const mappedServices = servicesResponse.data.map((service: ApiService) => ({ id: service.id, name: service.name }))
        setServices(mappedServices)
        setTemplate(mapApiTemplate(templateResponse))
        setInitialFieldIds((templateResponse.fields ?? []).map((field) => field.id))
      } catch (error) {
        toast({
          variant: "destructive",
          description: error instanceof Error ? error.message : "No pudimos cargar la plantilla.",
        })
        router.push("/panel/plantillas")
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [templateId, router, toast])

  const selectedServiceIdFromQuery = searchParams.get("serviceId")

  const handleTemplateChange = (patch: Partial<FormTemplate>) => {
    setTemplate((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const handleFieldChange = (updater: (fields: FormField[]) => FormField[]) => {
    setTemplate((prev) => (prev ? { ...prev, fields: updater(prev.fields) } : prev))
  }

  const handleAddField = () => {
    handleFieldChange((fields) => [...fields, createEmptyField(fields.length + 1)])
  }

  const handleUpdateField = (index: number, updated: FormField) => {
    handleFieldChange((fields) => {
      const next = [...fields]
      next[index] = { ...updated, order: index + 1 }
      return next
    })
  }

  const handleDeleteField = (index: number) => {
    handleFieldChange((fields) => fields.filter((_, i) => i !== index).map((field, i) => ({ ...field, order: i + 1 })))
  }

  const handleDuplicateField = (index: number) => {
    handleFieldChange((fields) => {
      const field = fields[index]
      const duplicated: FormField = {
        ...field,
        id: crypto.randomUUID(),
        persistedId: undefined,
        fieldName: generateFieldName(field.label, fields.length + 1),
        order: fields.length + 1,
      }
      return [...fields, duplicated]
    })
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    handleFieldChange((fields) => {
      const next = [...fields]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next.map((field, i) => ({ ...field, order: i + 1 }))
    })
  }

  const handleMoveDown = (index: number) => {
    handleFieldChange((fields) => {
      if (index >= fields.length - 1) return fields
      const next = [...fields]
      ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
      return next.map((field, i) => ({ ...field, order: i + 1 }))
    })
  }

  const handleSave = async () => {
    if (!template) return
    setIsSaving(true)
    try {
      await updateTemplate(template.id!, {
        name: template.name.trim(),
        description: template.description.trim(),
        active: template.active,
        version: template.version,
      })

      const diff = diffFields(template.fields, initialFieldIds)
      for (const field of diff.toDelete) {
        await deleteTemplateField(field)
      }
      for (const field of diff.toUpdate) {
        const payload = mapFieldToPayload(field, field.order)
        await updateTemplateField(field.persistedId!, payload)
      }
      for (const field of diff.toCreate) {
        const payload = mapFieldToPayload(field, field.order)
        await createTemplateField(template.id!, payload)
      }

      toast({ description: "Plantilla actualizada correctamente." })
      const backTo = template.serviceId ?? selectedServiceIdFromQuery
      router.push(backTo ? `/panel/plantillas?serviceId=${backTo}` : "/panel/plantillas")
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos actualizar la plantilla.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const serviceName = useMemo(() => {
    if (!template) return undefined
    return services.find((service) => service.id === template.serviceId)?.name
  }, [services, template])

  if (loading || !template) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando plantilla...</p>
      </div>
    )
  }

  const previewData: FormTemplate = { ...(previewTemplate ?? template), serviceName }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4 mb-6">
          <Link href={selectedServiceIdFromQuery ? `/panel/plantillas?serviceId=${selectedServiceIdFromQuery}` : "/panel/plantillas"}>
            <Button variant="outline" size="sm" className="border-primary/20 text-foreground bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Plantilla</h1>
            <p className="text-muted-foreground mt-1">Servicio: {serviceName ?? "Sin identificar"}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="space-y-4">
            <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 p-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nombre *</label>
                  <Input
                    value={template.name}
                    onChange={(e) => handleTemplateChange({ name: e.target.value })}
                    placeholder="Ej: Formulario de solicitud"
                    className="bg-secondary/50 border-primary/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Descripcion</label>
                  <textarea
                    value={template.description}
                    onChange={(e) => handleTemplateChange({ description: e.target.value })}
                    placeholder="Describe el objetivo de la plantilla"
                    className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant={template.active ? "default" : "outline"}
                      onClick={() => handleTemplateChange({ active: !template.active })}
                      className={template.active ? "bg-green-500/80" : "border-primary/20"}
                    >
                      {template.active ? "Activa" : "Inactiva"}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Controla si la plantilla esta disponible para nuevas solicitudes.
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Campos</h2>
              <Button onClick={handleAddField} className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Agregar campo
              </Button>
            </div>

            <AnimatePresence>
              {template.fields.length === 0 ? (
                <Card className="border border-dashed border-primary/30 p-8 text-center text-muted-foreground">
                  No hay campos configurados todavía.
                </Card>
              ) : (
                template.fields.map((field, index) => (
                  <FormFieldBuilder
                    key={field.id}
                    field={field}
                    onUpdate={(updated) => handleUpdateField(index, updated)}
                    onDelete={() => handleDeleteField(index)}
                    onDuplicate={() => handleDuplicateField(index)}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    canMoveUp={index > 0}
                    canMoveDown={index < template.fields.length - 1}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <TemplatePreview template={previewData} />
        </motion.div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" className="border-primary/20" onClick={() => router.back()} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-primary to-accent">
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  )
}

function mapApiTemplate(data: ApiTemplate): FormTemplate {
  return {
    id: data.id,
    serviceId: data.service_id,
    name: data.name,
    description: data.description ?? "",
    active: data.active,
    version: data.version,
    fields: (data.fields ?? []).map(mapApiField),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

function mapApiField(field: ApiTemplateField): FormField {
  return {
    id: `${field.id}`,
    persistedId: field.id,
    templateId: field.template_id,
    fieldName: field.field_name,
    label: field.label,
    type: field.type,
    placeholder: field.placeholder ?? "",
    description: field.help_text ?? "",
    options: field.options ?? [],
    required: field.required,
    order: field.order ?? 0,
    validationPattern: field.validation_pattern ?? null,
    errorMessage: field.error_message ?? null,
  }
}

function createEmptyField(order: number): FormField {
  return {
    id: crypto.randomUUID(),
    fieldName: generateFieldName("campo", order),
    label: `Campo ${order}`,
    type: "texto",
    placeholder: "",
    description: "",
    required: false,
    options: [],
    order,
  }
}

function generateFieldName(label: string, fallback: number) {
  const slug = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
  return slug || `campo_${fallback}`
}

function mapFieldToPayload(field: FormField, order: number): TemplateFieldPayload {
  const baseName = field.fieldName || generateFieldName(field.label, order)
  const needsOptions = field.type === "select" || field.type === "checkbox"

  return {
    field_name: baseName,
    label: field.label.trim() || `Campo ${order}`,
    type: field.type,
    options: needsOptions ? field.options ?? [] : undefined,
    help_text: field.description?.trim() || null,
    required: field.required,
    placeholder: field.placeholder?.trim() || null,
    order,
  }
}

function diffFields(fields: FormField[], initialIds: number[]): FieldDiff {
  const currentIds = fields.filter((field) => field.persistedId).map((field) => field.persistedId!)
  return {
    toCreate: fields.filter((field) => !field.persistedId),
    toUpdate: fields.filter((field) => field.persistedId),
    toDelete: initialIds.filter((id) => !currentIds.includes(id)),
  }
}
