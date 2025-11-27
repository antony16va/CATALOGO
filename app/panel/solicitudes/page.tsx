"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Search, RefreshCcw, Trash2, Plus, List, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks"
import { useAuth } from "@/contexts/auth-context"
import { 
  fetchRequests, 
  updateRequestStatus, 
  deleteRequest, 
  fetchServices,
  createServiceRequest,
} from "@/lib/api/catalog"
import { RequestDialog, type RequestFormValues } from "@/components/requests/request-dialog"
import { RequestCards } from "@/components/requests/request-cards"
import type { ApiRequest, ApiService } from "@/types/api"
import type { RequestStatus, ServiceRequestSummary } from "@/types/request"
import { cn } from "@/lib/utils"

const STATUS_FILTERS: Array<"all" | RequestStatus> = ["all", "Pendiente", "En Proceso", "Resuelta", "Cancelada"]
const VIEW_TOGGLE_BREAKPOINT = 1024

type ServiceOption = { id: number; name: string; priority?: string }

export default function RequestsPage() {
  const { toast } = useToast()
  const { isAdmin } = useAuth()
  
  const [requests, setRequests] = useState<ServiceRequestSummary[]>([])
  const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearch = useDeferredValue(searchTerm)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  
  // Estado para el diálogo de nueva solicitud
  const [dialogOpen, setDialogOpen] = useState(false)
  const [services, setServices] = useState<ServiceOption[]>([])
  const [loadingServices, setLoadingServices] = useState(false)

  // Estado para el modo de vista (tabla/cards)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [isCompactView, setIsCompactView] = useState(false)

  // Detectar pantalla compacta para cambiar automáticamente a cards
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

  const effectiveViewMode = isCompactView ? "cards" : viewMode

  /**
   * Carga los servicios disponibles para crear solicitudes.
   * Solo carga servicios publicados.
   */
  const loadServices = useCallback(async () => {
    setLoadingServices(true)
    try {
      const response = await fetchServices({ per_page: 200, status: "Publicado" })
      setServices(
        response.data.map((s: ApiService) => ({
          id: s.id,
          name: s.name,
          priority: s.priority,
        }))
      )
    } catch (error) {
      toast({
        variant: "destructive",
        description: "No pudimos cargar los servicios.",
      })
    } finally {
      setLoadingServices(false)
    }
  }, [toast])

  /**
   * Abre el diálogo y carga los servicios si no están cargados.
   */
  const handleOpenDialog = useCallback(() => {
    if (services.length === 0) {
      void loadServices()
    }
    setDialogOpen(true)
  }, [services.length, loadServices])

  /**
   * Crea una nueva solicitud.
   */
  const handleCreateRequest = async (values: RequestFormValues) => {
    const newRequest = await createServiceRequest({
      service_id: values.serviceId,
      form_payload: {
        description: values.description,
      },
    })
    
    toast({ description: "Solicitud creada correctamente." })
    
    // Agregar la nueva solicitud a la lista
    setRequests((prev) => [mapApiRequest(newRequest), ...prev])
  }

  /**
   * Carga las solicitudes desde la API.
   * El backend se encarga de filtrar por usuario si no es administrador.
   */
  const loadRequests = useCallback(
    async (term: string, status: "all" | RequestStatus) => {
      setIsLoading(true)
      try {
        // El backend filtra automáticamente por usuario si no es admin
        // NO enviamos requester_id desde el frontend por seguridad
        const response = await fetchRequests({
          per_page: 100,
          status: status === "all" ? undefined : status,
          search: term || undefined,
        })
        setRequests(response.data.map(mapApiRequest))
      } catch (error) {
        toast({
          variant: "destructive",
          description: error instanceof Error ? error.message : "No pudimos cargar las solicitudes.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    void loadRequests(deferredSearch, statusFilter)
  }, [deferredSearch, statusFilter, loadRequests])

  const handleStatusChange = async (requestId: number, newStatus: RequestStatus) => {
    setUpdatingId(requestId)
    setRequests((prev) => prev.map((request) => (request.id === requestId ? { ...request, status: newStatus } : request)))
    try {
      await updateRequestStatus(requestId, newStatus)
      toast({ description: "Estado actualizado." })
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos actualizar el estado.",
      })
      void loadRequests(deferredSearch, statusFilter)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (requestId: number) => {
    try {
      await deleteRequest(requestId)
      toast({ description: "Solicitud eliminada." })
      setRequests((prev) => prev.filter((request) => request.id !== requestId))
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos eliminar la solicitud.",
      })
    }
  }

  const stats = useMemo(() => {
    return STATUS_FILTERS.filter((status) => status !== "all").map((status) => ({
      status,
      total: requests.filter((req) => req.status === status).length,
    }))
  }, [requests])

  return (
    <div className="p-6 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Solicitudes</h1>
        <p className="text-muted-foreground">Monitorea el flujo de requerimientos vinculados al catalogo.</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {stats.map((item) => (
          <Card key={item.status} className="border border-primary/20 bg-gradient-to-br from-card to-card/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">{item.status}</p>
            <p className="text-2xl font-bold text-foreground">{item.total}</p>
          </Card>
        ))}
      </motion.div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Buscar por codigo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-secondary/50 border-primary/20 pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | RequestStatus)}
            className="px-3 py-2 rounded-lg bg-secondary/50 border border-primary/20 text-foreground"
          >
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "Todos los estados" : status}
              </option>
            ))}
          </select>

          {/* Toggle de vista tabla/cards */}
          {!isCompactView && (
            <div className="flex gap-1 bg-secondary/50 border border-primary/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  effectiveViewMode === "table"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Vista tabla"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  effectiveViewMode === "cards"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Vista tarjetas"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          )}

          <Button variant="outline" onClick={() => loadRequests(deferredSearch, statusFilter)} className="border-primary/20">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Recargar
          </Button>
          <Button onClick={handleOpenDialog} disabled={loadingServices}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Diálogo de nueva solicitud */}
      <AnimatePresence>
        {dialogOpen && (
          <RequestDialog
            services={services}
            onClose={() => setDialogOpen(false)}
            onSave={handleCreateRequest}
          />
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center text-muted-foreground py-20">Cargando solicitudes...</div>
      ) : requests.length === 0 ? (
        <Card className="border border-dashed border-primary/30 bg-secondary/30 p-10 text-center">
          <p className="text-muted-foreground">No hay solicitudes para los filtros seleccionados.</p>
        </Card>
      ) : effectiveViewMode === "cards" ? (
        /* Vista de tarjetas */
        <RequestCards
          requests={requests}
          isAdmin={isAdmin}
          updatingId={updatingId}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      ) : (
        /* Vista de tabla */
        <div className="overflow-x-auto rounded-xl border border-primary/10">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Codigo</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Servicio</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Descripción</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Solicitante</th>
                )}
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Prioridad</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">SLA</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Estado</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr key={request.id ?? `row-${index}`} className="border-t border-primary/10">
                  <td className="px-4 py-3 font-semibold text-foreground">{request.code}</td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{request.serviceName}</p>
                    <p className="text-xs text-muted-foreground">{request.submittedAt.toLocaleDateString("es-PE")}</p>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-foreground text-sm truncate" title={request.description ?? undefined}>
                      {request.description || <span className="text-muted-foreground italic">Sin descripción</span>}
                    </p>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <p className="text-foreground">{request.requesterName}</p>
                      <p className="text-xs text-muted-foreground">{request.requesterEmail ?? "sin correo"}</p>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <Badge variant="outline">{request.priority ?? "-"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{request.slaName ?? "Sin SLA"}</p>
                    {request.slaResponseMinutes && request.slaResolutionMinutes && (
                      <p className="text-xs text-muted-foreground">
                        {request.slaResponseMinutes}m / {request.slaResolutionMinutes}m
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value as RequestStatus)}
                        disabled={updatingId === request.id}
                        className="px-3 py-1 rounded-lg border border-primary/20 bg-secondary/30 text-foreground"
                      >
                        {STATUS_FILTERS.filter((status) => status !== "all").map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge 
                        variant="outline"
                        className={
                          request.status === "Pendiente" ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-500" :
                          request.status === "En Proceso" ? "border-blue-500/50 bg-blue-500/10 text-blue-500" :
                          request.status === "Resuelta" ? "border-green-500/50 bg-green-500/10 text-green-500" :
                          "border-red-500/50 bg-red-500/10 text-red-500"
                        }
                      >
                        {request.status}
                      </Badge>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(request.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function mapApiRequest(request: ApiRequest): ServiceRequestSummary {
  return {
    id: request.id,
    code: request.code,
    serviceId: request.service_id,
    serviceName: request.service?.name ?? request.service_snapshot?.name ?? "Servicio",
    requesterName: request.requester?.full_name ?? "Sin usuario",
    requesterEmail: request.requester?.email ?? null,
    status: request.status,
    submittedAt: new Date(request.submitted_at),
    templateId: request.template_id,
    priority: request.service?.priority ?? request.service_snapshot?.priority ?? null,
    slaName: request.sla_snapshot?.name ?? null,
    slaResponseMinutes: request.sla_snapshot?.first_response_minutes ?? null,
    slaResolutionMinutes: request.sla_snapshot?.resolution_minutes ?? null,
    description: (request.form_payload?.description as string) ?? null,
  }
}
