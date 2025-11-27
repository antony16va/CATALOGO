"use client"

import { useCallback, useEffect, useMemo, useState, useTransition, useOptimistic } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Edit2, Trash2, Grid3x3, List, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SLADialog, type SlaFormValues } from "@/components/categories/sla-dialog"
import { useToast } from "@/hooks"
import type { SLA } from "@/types/sla"
import type { ApiSla } from "@/types/api"
import { createSlaRecord, updateSlaRecord, deleteSlaRecord, fetchSlas, type SlaRequestPayload } from "@/lib/api/catalog"
import { cn } from "@/lib/utils"

const VIEW_TOGGLE_BREAKPOINT = 1280
const PRIORITY_FILTERS: Array<"all" | "critical" | "standard" | "extended"> = ["all", "critical", "standard", "extended"]

// React 19: Optimistic reducer
type OptimisticAction =
  | { type: "add"; sla: SLA }
  | { type: "update"; sla: SLA }
  | { type: "delete"; id: number }

function slasReducer(state: SLA[], action: OptimisticAction): SLA[] {
  switch (action.type) {
    case "add":
      return [...state, action.sla]
    case "update":
      return state.map((s) => (s.id === action.sla.id ? action.sla : s))
    case "delete":
      return state.filter((s) => s.id !== action.id)
    default:
      return state
  }
}

export default function SLAPage() {
  const { toast } = useToast()
  const [slas, setSlas] = useState<SLA[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSeverity, setFilterSeverity] = useState<"all" | "critical" | "standard" | "extended">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSLA, setSelectedSLA] = useState<SLA | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [isCompactView, setIsCompactView] = useState(false)

  // React 19: useTransition for non-blocking mutations
  const [isPending, startTransition] = useTransition()
  
  // React 19: useOptimistic for instant UI updates
  const [optimisticSlas, addOptimistic] = useOptimistic(slas, slasReducer)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetchSlas({ per_page: 200 })
      setSlas(response.data.map(mapApiSla))
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos cargar los SLA.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadData()
  }, [loadData])

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

  const filteredSLAs = useMemo(() => {
    return optimisticSlas.filter((sla) => {
      const matchesSearch =
        sla.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sla.description ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      const severity = getSeverity(sla.responseTime, sla.resolutionTime)
      const matchesSeverity = filterSeverity === "all" || severity === filterSeverity
      return matchesSearch && matchesSeverity
    })
  }, [filterSeverity, searchTerm, optimisticSlas])

  const handleAddSLA = () => {
    setSelectedSLA(null)
    setDialogOpen(true)
  }

  const handleEditSLA = (sla: SLA) => {
    setSelectedSLA(sla)
    setDialogOpen(true)
  }

  const handleDeleteSLA = (id: number) => {
    startTransition(async () => {
      addOptimistic({ type: "delete", id })
      try {
        await deleteSlaRecord(id)
        toast({ description: "SLA eliminado correctamente." })
        await loadData()
      } catch (error) {
        toast({
          variant: "destructive",
          description: error instanceof Error ? error.message : "No pudimos eliminar el SLA.",
        })
        await loadData()
      }
    })
  }

  const handleSaveSLA = async (data: SlaFormValues) => {
    const payload: SlaRequestPayload = {
      name: data.name,
      description: data.description,
      responseTime: data.responseTime,
      resolutionTime: data.resolutionTime,
      pauseConditions: data.pauseConditions,
      active: true,
    }

    // React 19: Wrap in transition for optimistic update
    startTransition(async () => {
      try {
        if (selectedSLA) {
          addOptimistic({
            type: "update",
            sla: { ...selectedSLA, ...data },
          })
          await updateSlaRecord(selectedSLA.id, payload)
          toast({ description: "SLA actualizado correctamente." })
        } else {
          const tempSla: SLA = {
            id: -Date.now(),
            name: data.name,
            description: data.description ?? null,
            responseTime: data.responseTime,
            resolutionTime: data.resolutionTime,
            pauseConditions: data.pauseConditions ?? null,
            active: true,
            createdAt: new Date(),
          }
          addOptimistic({ type: "add", sla: tempSla })
          await createSlaRecord(payload)
          toast({ description: "SLA creado correctamente." })
        }
        await loadData()
      } catch (error) {
        toast({
          variant: "destructive",
          description: error instanceof Error ? error.message : "No pudimos guardar el SLA.",
        })
        await loadData()
        throw error
      }
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const effectiveViewMode = isCompactView ? "cards" : viewMode

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* React 19: Pending indicator */}
      {isPending && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Guardando...</span>
          </div>
        </div>
      )}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Catálogo de SLA</p>
            <h1 className="text-3xl font-bold text-foreground">Niveles de servicio</h1>
            <p className="text-muted-foreground mt-1">Define los tiempos de respuesta y resolución de tu operación.</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleAddSLA}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2 w-full md:w-auto"
            >
              <Plus className="w-4 h-4" />
              Nuevo SLA
            </Button>
          </motion.div>
        </div>
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
              placeholder="Buscar SLA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-secondary/50 border-primary/20 pl-10"
            />
          </div>
        </div>

        <motion.select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as typeof filterSeverity)}
          className="px-3 py-2 rounded-lg bg-secondary/50 border border-primary/20 text-foreground cursor-pointer text-sm"
          whileHover={{ borderColor: "hsl(var(--primary))" }}
        >
          <option value="all">Severidad</option>
          <option value="critical">Urgentes (&lt; 60 min)</option>
          <option value="standard">Estándar (60-240 min)</option>
          <option value="extended">Extendidos (&gt; 240 min)</option>
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
          <SlaTable slas={filteredSLAs} onEdit={handleEditSLA} onDelete={handleDeleteSLA} />
        ) : (
          <SlaCards slas={filteredSLAs} onEdit={handleEditSLA} onDelete={handleDeleteSLA} />
        )}
      </motion.div>

      <AnimatePresence>
        {dialogOpen && (
          <SLADialog
            sla={selectedSLA}
            onClose={() => {
              setDialogOpen(false)
              setSelectedSLA(null)
            }}
            onSave={handleSaveSLA}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function getSeverity(responseTime: number, resolutionTime: number): "critical" | "standard" | "extended" {
  if (responseTime <= 60 && resolutionTime <= 240) return "critical"
  if (responseTime <= 240 && resolutionTime <= 720) return "standard"
  return "extended"
}

function getSeverityBadge(severity: "critical" | "standard" | "extended") {
  switch (severity) {
    case "critical":
      return "border-destructive/50 bg-destructive/10 text-destructive"
    case "standard":
      return "border-orange-500/50 bg-orange-500/10 text-orange-500"
    default:
      return "border-blue-500/40 bg-blue-500/10 text-blue-400"
  }
}

function ToggleButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ElementType
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

function SlaTable({ slas, onEdit, onDelete }: { slas: SLA[]; onEdit: (sla: SLA) => void; onDelete: (id: number) => void }) {
  if (slas.length === 0) {
    return (
      <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-12">
        <div className="text-center">
          <p className="text-muted-foreground">No hay SLAs registrados</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/20">
              <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Nombre</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Respuesta</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Resolución</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Severidad</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {slas.map((sla, index) => {
              const severity = getSeverity(sla.responseTime, sla.resolutionTime)
              return (
                <motion.tr
                  key={sla.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{sla.name}</p>
                    <p className="text-sm text-muted-foreground">{sla.description}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{sla.responseTime} min</td>
                  <td className="px-6 py-4 text-sm text-foreground">{sla.resolutionTime} min</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={getSeverityBadge(severity)}>
                      {severity === "critical" && "Crítico"}
                      {severity === "standard" && "Estándar"}
                      {severity === "extended" && "Extendido"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onEdit(sla)} className="p-2 text-muted-foreground hover:text-primary transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(sla.id)} className="p-2 text-muted-foreground hover:text-destructive transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function SlaCards({ slas, onEdit, onDelete }: { slas: SLA[]; onEdit: (sla: SLA) => void; onDelete: (id: number) => void }) {
  if (slas.length === 0) {
    return (
      <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-12 text-center">
        <p className="text-muted-foreground">No hay SLAs registrados</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {slas.map((sla, index) => {
        const severity = getSeverity(sla.responseTime, sla.resolutionTime)
        return (
          <motion.div key={sla.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="h-full border border-primary/20 bg-gradient-to-br from-card to-card/60 backdrop-blur-xl p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">SLA</p>
                  <h3 className="text-xl font-semibold text-foreground">{sla.name}</h3>
                </div>
                <Badge variant="outline" className={getSeverityBadge(severity)}>
                  {severity === "critical" && "Crítico"}
                  {severity === "standard" && "Estándar"}
                  {severity === "extended" && "Extendido"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{sla.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-primary/10 bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground">Respuesta</p>
                  <p className="text-lg font-semibold text-foreground">{sla.responseTime} min</p>
                </div>
                <div className="rounded-lg border border-primary/10 bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground">Resolución</p>
                  <p className="text-lg font-semibold text-foreground">{sla.resolutionTime} min</p>
                </div>
              </div>
              {sla.pauseConditions && (
                <p className="text-xs text-muted-foreground border border-border/50 rounded-lg p-3 bg-secondary/20">
                  {sla.pauseConditions}
                </p>
              )}
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => onEdit(sla)} className="px-3 py-2 text-sm text-muted-foreground hover:text-primary transition">
                  Editar
                </button>
                <button onClick={() => onDelete(sla.id)} className="px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition">
                  Eliminar
                </button>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

function mapApiSla(sla: ApiSla): SLA {
  return {
    id: sla.id,
    name: sla.name,
    description: sla.description ?? "",
    responseTime: sla.first_response_minutes,
    resolutionTime: sla.resolution_minutes,
    pauseConditions: sla.pause_conditions,
    active: sla.active,
    createdAt: new Date(sla.created_at),
  }
}
