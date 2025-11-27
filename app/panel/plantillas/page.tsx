"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks"
import {
  fetchServices,
  fetchTemplatesByService,
  deleteTemplate,
  updateTemplate,
} from "@/lib/api/catalog"
import type { ApiService, ApiTemplate, ApiTemplateField } from "@/types/api"
import type { FormField, FormTemplate } from "@/types/form-template"

const SERVICE_LIMIT = 100

export default function TemplatesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<Array<{ id: number; name: string }>>([])
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  const loadServices = useCallback(async () => {
    setLoadingServices(true)
    try {
      const response = await fetchServices({ per_page: SERVICE_LIMIT })
      const mapped = response.data.map((service: ApiService) => ({ id: service.id, name: service.name }))
      setServices(mapped)
      if (!selectedServiceId && mapped.length > 0) {
        setSelectedServiceId(mapped[0].id)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos cargar los servicios.",
      })
    } finally {
      setLoadingServices(false)
    }
  }, [selectedServiceId, toast])

  const loadTemplates = useCallback(
    async (serviceId: number, explicitServiceName?: string) => {
      setLoadingTemplates(true)
      try {
        const response = await fetchTemplatesByService(serviceId)
        const serviceName = explicitServiceName ?? services.find((service) => service.id === serviceId)?.name ?? "Servicio"
        setTemplates(response.map((template) => mapApiTemplate(template, serviceName)))
      } catch (error) {
        toast({
          variant: "destructive",
          description: error instanceof Error ? error.message : "No pudimos cargar las plantillas.",
        })
      } finally {
        setLoadingTemplates(false)
      }
    },
    [services, toast],
  )

  useEffect(() => {
    void loadServices()
  }, [loadServices])

  useEffect(() => {
    if (selectedServiceId) {
      const serviceName = services.find((service) => service.id === selectedServiceId)?.name
      void loadTemplates(selectedServiceId, serviceName)
    }
  }, [selectedServiceId, services, loadTemplates])

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const haystack = `${template.name} ${template.description}`.toLowerCase()
      return haystack.includes(searchTerm.toLowerCase())
    })
  }, [searchTerm, templates])

  const handleDelete = async (templateId: number) => {
    try {
      await deleteTemplate(templateId)
      toast({ description: "Plantilla eliminada correctamente." })
      if (selectedServiceId) {
        await loadTemplates(selectedServiceId)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos eliminar la plantilla.",
      })
    }
  }

  const handleToggleActive = async (template: FormTemplate) => {
    try {
      await updateTemplate(template.id!, { active: !template.active })
      toast({ description: `Plantilla ${template.active ? "desactivada" : "activada"}.` })
      if (selectedServiceId) {
        await loadTemplates(selectedServiceId)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos actualizar la plantilla.",
      })
    }
  }

  if (loadingServices) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando servicios...</p>
      </div>
    )
  }

  const selectedService = services.find((service) => service.id === selectedServiceId)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Plantillas de Formularios</h1>
            <p className="text-muted-foreground mt-1">
              Administra los formularios asociados a cada servicio del catalogo.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <select
              value={selectedServiceId ?? ""}
              onChange={(event) => setSelectedServiceId(event.target.value ? Number(event.target.value) : null)}
              className="w-full md:w-64 px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground"
            >
              <option value="">Selecciona un servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                disabled={!selectedService}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2 w-full"
              >
                <Link
                  href={selectedService ? `/panel/plantillas/nueva?serviceId=${selectedService.id}` : "#"}
                  aria-disabled={!selectedService}
                >
                  <Plus className="w-4 h-4" />
                  Nueva plantilla
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {!selectedService ? (
        <Card className="border border-dashed border-primary/30 bg-secondary/30 p-8 text-center">
          <p className="text-muted-foreground">Selecciona un servicio para consultar sus plantillas.</p>
        </Card>
      ) : (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  placeholder="Buscar plantillas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-secondary/50 border-primary/20 pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => selectedServiceId && loadTemplates(selectedServiceId, selectedService?.name)}
                className="border-primary/20 text-foreground"
                disabled={loadingTemplates}
              >
                <RefreshCcw className={`w-4 h-4 mr-2 ${loadingTemplates ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>
          </motion.div>

          {loadingTemplates ? (
            <div className="flex justify-center items-center py-20 text-muted-foreground">Cargando plantillas...</div>
          ) : filteredTemplates.length === 0 ? (
            <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 p-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No hay plantillas registradas para este servicio.</p>
                <Button asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
                  <Link href={`/panel/plantillas/nueva?serviceId=${selectedService.id}`}>
                    <Plus className="w-4 h-4" />
                    Crear primera plantilla
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence>
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 p-4 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Version {template.version}</p>
                          <h3 className="font-semibold text-foreground">{template.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                        </div>
                        <Badge variant={template.active ? "default" : "secondary"}>
                          {template.active ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>

                      <div className="flex-1 space-y-2 text-sm text-muted-foreground">
                        <p>{template.fields.length} campo(s) configurados</p>
                        <p>Actualizado el {template.updatedAt?.toLocaleDateString("es-PE")}</p>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button asChild variant="outline" className="flex-1 border-primary/20">
                          <Link href={`/panel/plantillas/${template.id}?serviceId=${template.serviceId}`}>
                            Editar
                          </Link>
                        </Button>
                        <Button variant="ghost" onClick={() => handleToggleActive(template)}>
                          {template.active ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(template.id!)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

function mapApiTemplate(template: ApiTemplate, serviceName: string): FormTemplate {
  return {
    id: template.id,
    serviceId: template.service_id,
    serviceName,
    name: template.name,
    description: template.description ?? "",
    active: template.active,
    version: template.version,
    fields: (template.fields ?? []).map(mapApiField),
    createdAt: new Date(template.created_at),
    updatedAt: new Date(template.updated_at),
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
