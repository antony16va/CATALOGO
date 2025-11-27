"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, useOptimistic } from "react"
import type { ElementType } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, Search, Clock, Grid3x3, List, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ServiceDialog, type ServiceFormValues } from "@/components/services/service-dialog"
import { ServiceTable } from "@/components/services/service-table"
import { ServiceCards } from "@/components/services/service-cards"
import { useToast } from "@/hooks"
import { useAuth } from "@/contexts/auth-context"
import {
  fetchServices,
  fetchCategories,
  fetchSlas,
  fetchSubcategories,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
  type ServiceRecordPayload,
} from "@/lib/api/catalog"
import type { ApiService } from "@/types/api"
import type { Service, ServicePriority, ServiceStatus } from "@/types/service"
import { cn } from "@/lib/utils"

type Option = { id: number; name: string }

const VIEW_TOGGLE_BREAKPOINT = 1280
const STATUS_FILTERS: Array<"all" | ServiceStatus> = ["all", "Publicado", "Borrador", "Inactivo"]

// React 19: Optimistic reducer for services
type OptimisticAction =
  | { type: "add"; service: Service }
  | { type: "update"; service: Service }
  | { type: "delete"; id: number }

function servicesReducer(state: Service[], action: OptimisticAction): Service[] {
  switch (action.type) {
    case "add":
      return [...state, action.service]
    case "update":
      return state.map((s) => (s.id === action.service.id ? action.service : s))
    case "delete":
      return state.filter((s) => s.id !== action.id)
    default:
      return state
  }
}

export default function ServicesPage() {
  const { toast } = useToast()
  const { isAdmin } = useAuth()

  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<"all" | ServiceStatus>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isCompactView, setIsCompactView] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [categories, setCategories] = useState<Option[]>([])
  const [slas, setSlas] = useState<Option[]>([])
  const subcategoriesCache = useRef<Record<number, Option[]>>({})

  // React 19: useTransition for non-blocking async operations
  const [isPending, startTransition] = useTransition()
  
  // React 19: useOptimistic for instant UI feedback
  const [optimisticServices, addOptimistic] = useOptimistic(services, servicesReducer)

  const loadInitialData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [servicesResponse, categoriesResponse, slasResponse] = await Promise.all([
        fetchServices({ per_page: 200 }),
        fetchCategories({ per_page: 200 }),
        fetchSlas({ per_page: 200 }),
      ])

      setServices(servicesResponse.data.map(mapApiServiceToService))
      setCategories(categoriesResponse.data.map((category) => ({ id: category.id, name: category.name })))
      setSlas(slasResponse.data.map((sla) => ({ id: sla.id, name: sla.name })))
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos cargar los servicios.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  useEffect(() => {
    const handleResize = () => {
      const compactScreen = window.innerWidth < VIEW_TOGGLE_BREAKPOINT
      setIsCompactView(compactScreen)
      if (compactScreen) {
        setViewMode("cards")
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const loadSubcategories = useCallback(async (categoryId: number) => {
    if (subcategoriesCache.current[categoryId]) {
      return subcategoriesCache.current[categoryId]
    }

    try {
      const response = await fetchSubcategories(categoryId)
      const options = response.map((sub) => ({ id: sub.id, name: sub.name }))
      subcategoriesCache.current[categoryId] = options
      return options
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos cargar las subcategorías.",
      })
      return []
    }
  }, [toast])

  const filteredServices = useMemo(() => {
    return optimisticServices.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || service.category === filterCategory
      const matchesStatus = filterStatus === "all" || service.status === filterStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [filterCategory, filterStatus, searchTerm, optimisticServices])

  const categoriesFilterOptions = useMemo(() => ["all", ...new Set(optimisticServices.map((service) => service.category))], [optimisticServices])

  const totalServices = optimisticServices.length
  const activeServices = optimisticServices.filter((service) => service.status === "Publicado").length
  const highPriorityServices = optimisticServices.filter((service) => service.priority === "Alta" || service.priority === "Crítica").length
  const effectiveViewMode = isCompactView ? "cards" : viewMode

  const handleAddService = () => {
    setSelectedService(null)
    setDialogOpen(true)
  }

  const handleEditService = (service: Service) => {
    setSelectedService(service)
    setDialogOpen(true)
  }

  const handleDeleteService = (id: number) => {
    // React 19: Optimistic delete with transition
    startTransition(async () => {
      addOptimistic({ type: "delete", id })
      try {
        await deleteServiceRecord(id)
        toast({ description: "Servicio eliminado correctamente." })
        await loadInitialData()
      } catch (error) {
        toast({
          variant: "destructive",
          description: error instanceof Error ? error.message : "No pudimos eliminar el servicio.",
        })
        await loadInitialData()
      }
    })
  }

  const handleSaveService = async (values: ServiceFormValues) => {
    const payload: ServiceRecordPayload = {
      code: values.code,
      name: values.name,
      description: values.description,
      category_id: values.categoryId,
      subcategory_id: values.subcategoryId ?? null,
      sla_id: values.slaId,
      priority: values.priority,
      status: values.status,
      keywords: values.keywords || null,
      metadata: { channel: "portal" },
    }

    // React 19: Optimistic save with transition
    startTransition(async () => {
      try {
        if (selectedService) {
          const categoryName = categories.find((c) => c.id === values.categoryId)?.name ?? selectedService.category
          addOptimistic({
            type: "update",
            service: { ...selectedService, ...values, category: categoryName },
          })
          await updateServiceRecord(selectedService.id, payload)
          toast({ description: "Servicio actualizado correctamente." })
        } else {
          const categoryName = categories.find((c) => c.id === values.categoryId)?.name ?? "Sin categoría"
          const tempService: Service = {
            id: -Date.now(),
            code: values.code,
            name: values.name,
            description: values.description,
            category: categoryName,
            priority: values.priority,
            status: values.status,
            sla: slas.find((s) => s.id === values.slaId)?.name ?? "Sin SLA",
            keywords: values.keywords ?? null,
            createdAt: new Date().toISOString(),
          }
          addOptimistic({ type: "add", service: tempService })
          await createServiceRecord(payload)
          toast({ description: "Servicio creado correctamente." })
        }
        await loadInitialData()
      } catch (error) {
        toast({
          variant: "destructive",
          description: error instanceof Error ? error.message : "No pudimos guardar el servicio.",
        })
        await loadInitialData()
        throw error
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col gap-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
          <span className="text-muted-foreground">Cargando servicios del catálogo…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* React 19: Pending indicator for transitions */}
      {isPending && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Guardando...</span>
          </div>
        </div>
      )}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Panel de Servicios</p>
            <h1 className="text-3xl font-bold text-foreground">Gestión del catálogo interno</h1>
            <p className="text-muted-foreground mt-1">Administra los servicios, SLA y niveles de prioridad publicados.</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isAdmin && (
              <Button
                onClick={handleAddService}
                disabled={categories.length === 0 || slas.length === 0 || isPending}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2 w-full md:w-auto disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo servicio</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
            )}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <SummaryCard label="Total de Servicios" value={totalServices} />
        <SummaryCard label="Servicios Publicados" value={activeServices} highlight="success" />
        <SummaryCard label="Alta Prioridad" value={highPriorityServices} highlight="danger" />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-secondary/50 border-primary/20 pl-10 text-sm"
            />
          </div>
        </div>

        <motion.select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary/50 border border-primary/20 text-foreground cursor-pointer text-sm"
          whileHover={{ borderColor: "hsl(var(--primary))" }}
        >
          <option value="all">Categoría</option>
          {categoriesFilterOptions
            .filter((option) => option !== "all")
            .map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
        </motion.select>

        <motion.select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | ServiceStatus)}
          className="px-3 py-2 rounded-lg bg-secondary/50 border border-primary/20 text-foreground cursor-pointer text-sm"
          whileHover={{ borderColor: "hsl(var(--primary))" }}
        >
          <option value="all">Estado</option>
          {STATUS_FILTERS.filter((status) => status !== "all").map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </motion.select>

        <div className="flex gap-2 justify-end">
          {!isCompactView && (
            <div className="flex gap-1 bg-secondary/50 border border-primary/20 rounded-lg p-1">
              <ToggleButton active={effectiveViewMode === "table"} icon={List} label="Vista tabla" onClick={() => setViewMode("table")} />
              <ToggleButton active={effectiveViewMode === "cards"} icon={Grid3x3} label="Vista tarjetas" onClick={() => setViewMode("cards")} />
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        {effectiveViewMode === "table" ? (
          <ServiceTable services={filteredServices} onEdit={handleEditService} onDelete={handleDeleteService} showActions={isAdmin} />
        ) : (
          <ServiceCards services={filteredServices} onEdit={handleEditService} onDelete={handleDeleteService} showActions={isAdmin} />
        )}
      </motion.div>

      <AnimatePresence>
        {dialogOpen && (
          <ServiceDialog
            service={selectedService}
            categories={categories}
            slas={slas}
            loadSubcategories={loadSubcategories}
            onClose={() => {
              setDialogOpen(false)
              setSelectedService(null)
            }}
            onSave={handleSaveService}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: number
  highlight?: "success" | "danger"
}) {
  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-4">
      <div className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</div>
      <div
        className={cn(
          "text-xl sm:text-2xl font-bold text-foreground",
          highlight === "success" && "text-green-500",
          highlight === "danger" && "text-destructive",
        )}
      >
        {value}
      </div>
    </Card>
  )
}

function ToggleButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: ElementType
  label: string
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "p-2 rounded transition-colors",
        active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground",
      )}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </motion.button>
  )
}

function mapApiServiceToService(service: ApiService): Service {
  const normalize = (value?: string | null) =>
    value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? ""

  const priority = service.priority === "Cr�tica" ? "Crítica" : service.priority

  return {
    id: service.id,
    code: service.code,
    name: service.name,
    description: service.description,
    category: service.category?.name ?? "Sin categoría",
    categoryId: service.category?.id ?? null,
    subcategory: service.subcategory?.name ?? null,
    subcategoryId: service.subcategory?.id ?? null,
    priority: priority as ServicePriority,
    status: service.status,
    sla: service.sla?.name ?? "Sin SLA",
    slaId: service.sla?.id ?? null,
    keywords: service.keywords ?? "",
    createdAt: new Date(service.created_at),
  }
}
