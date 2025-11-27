"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FormFieldBuilder } from "@/components/forms/form-field-builder"
import { TemplatePreview } from "@/components/forms/template-preview"
import { useToast } from "@/hooks"
import {
  fetchServices,
  createTemplate,
  createTemplateField,
  type TemplateFieldPayload,
} from "@/lib/api/catalog"
import type { FormField, FormTemplate } from "@/types/form-template"
import type { ApiService } from "@/types/api"

const SERVICE_LIMIT = 100

export default function NewTemplatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [services, setServices] = useState<Array<{ id: number; name: string }>>([])
  const [template, setTemplate] = useState<FormTemplate>({
    serviceId: null,
    name: "",
    description: "",
    active: true,
    version: 1,
    fields: [],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [loadingServices, setLoadingServices] = useState(true)
  const previewTemplate = useDeferredValue(template)

  useEffect(() => {
    const serviceIdParam = searchParams.get("serviceId")
    const initialServiceId = serviceIdParam ? Number(serviceIdParam) : null

    async function loadServices() {
      setLoadingServices(true)
      try {
        const response = await fetchServices({ per_page: SERVICE_LIMIT })
        const mapped = response.data.map((service: ApiService) => ({ id: service.id, name: service.name }))
        setServices(mapped)
        setTemplate((prev) => ({
          ...prev,
          serviceId: initialServiceId && mapped.some((service) => service.id === initialServiceId)
            ? initialServiceId
            : mapped[0]?.id ?? null,
        }))
      } catch (error) {
        toast({
          variant: "destructive",
          description: error instanceof Error ? error.message : "No pudimos cargar los servicios.",
        })
      } finally {
        setLoadingServices(false)
      }
    }

    void loadServices()
  }, [searchParams, toast])

  const handleAddField = () => {
    setTemplate((prev) => {
      const newField = createEmptyField(prev.fields.length + 1)
      return { ...prev, fields: [...prev.fields, newField] }
    })
  }

  const handleUpdateField = (index: number, updated: FormField) => {
    setTemplate((prev) => {
      const fields = [...prev.fields]
      fields[index] = { ...updated, order: index + 1 }
      return { ...prev, fields }
    })
  }

  const handleDeleteField = (index: number) => {
    setTemplate((prev) => {
      const fields = prev.fields.filter((_, i) => i !== index).map((field, i) => ({ ...field, order: i + 1 }))
      return { ...prev, fields }
    })
  }

  const handleDuplicateField = (index: number) => {
    setTemplate((prev) => {
      const original = prev.fields[index]
      const duplicated: FormField = {
        ...original,
        id: crypto.randomUUID(),
        fieldName: generateFieldName(original.label, prev.fields.length + 1),
        order: prev.fields.length + 1,
        persistedId: undefined,
      }
      return { ...prev, fields: [...prev.fields, duplicated] }
    })
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    setTemplate((prev) => {
      const fields = [...prev.fields]
      ;[fields[index - 1], fields[index]] = [fields[index], fields[index - 1]]
      return { ...prev, fields: fields.map((field, i) => ({ ...field, order: i + 1 })) }
    })
  }

  const handleMoveDown = (index: number) => {
    setTemplate((prev) => {
      if (index >= prev.fields.length - 1) return prev
      const fields = [...prev.fields]
      ;[fields[index + 1], fields[index]] = [fields[index], fields[index + 1]]
      return { ...prev, fields: fields.map((field, i) => ({ ...field, order: i + 1 })) }
    })
  }

  const handleSave = async () => {
    if (!template.serviceId) {
      toast({ variant: "destructive", description: "Selecciona un servicio." })
      return
    }

    if (!template.name.trim()) {
      toast({ variant: "destructive", description: "Ingresa un nombre para la plantilla." })
      return
    }

    setIsSaving(true)
    try {
      const created = await createTemplate({
        service_id: template.serviceId,
        name: template.name.trim(),
        description: template.description.trim(),
        active: template.active,
        version: template.version,
      })

      const orderedFields = template.fields
        .map((field, idx) => ({ field, index: idx }))
        .sort((a, b) => a.field.order - b.field.order)

      for (const { field, index } of orderedFields) {
        const payload = mapFieldToPayload(field, index + 1)
        await createTemplateField(created.id, payload)
      }

      toast({ description: "Plantilla creada correctamente." })
      router.push(`/panel/plantillas?serviceId=${template.serviceId}`)
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos guardar la plantilla.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const selectedServiceName = useMemo(() => {
    return services.find((service) => service.id === template.serviceId)?.name
  }, [services, template.serviceId])

  if (loadingServices) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando servicios...</p>
      </div>
    )
  }

  const previewData: FormTemplate = {
    ...(previewTemplate ?? template),
    serviceName: selectedServiceName ?? undefined,
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4 mb-6">
          <Link href="/panel/plantillas">
            <Button variant="outline" size="sm" className="border-primary/20 text-foreground bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nueva Plantilla</h1>
            <p className="text-muted-foreground mt-1">Crea una nueva plantilla de formulario</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="space-y-4">
            <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 p-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Servicio *</label>
                  <select
                    value={template.serviceId ?? ""}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, serviceId: event.target.value ? Number(event.target.value) : null }))
                    }
                    className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground"
                  >
                    <option value="">Selecciona un servicio</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nombre *</label>
                  <Input
                    value={template.name}
                    onChange={(e) => setTemplate((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Formulario de solicitud"
                    className="bg-secondary/50 border-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Descripcion</label>
                  <textarea
                    value={template.description}
                    onChange={(e) => setTemplate((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe el objetivo de la plantilla"
                    className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground resize-none"
                    rows={3}
                  />
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
                  Aún no has agregado campos.
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
        <Button onClick={handleSave} disabled={isSaving || !template.serviceId} className="bg-gradient-to-r from-primary to-accent">
          {isSaving ? "Guardando..." : "Guardar plantilla"}
        </Button>
      </div>
    </div>
  )
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
