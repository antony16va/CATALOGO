"use client"

import { useState, useEffect, useMemo, useCallback } from "react"

import { motion, AnimatePresence } from "framer-motion"

import { Card } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { Clock, User, FileText, CheckCircle, AlertCircle, Grid3x3, List } from "lucide-react"

import { useToast } from "@/hooks"
import { fetchAuditLogs } from "@/lib/api/catalog"
import type { AuditLogEntry } from "@/types/audit-log"
import type { ApiAuditLog } from "@/types/api"

type AuditLog = AuditLogEntry

export default function AuditoriaPage() {

  const [logs, setLogs] = useState<AuditLog[]>([])

  const [filterAction, setFilterAction] = useState<string>("all")

  const [filterEntity, setFilterEntity] = useState<string>("all")

  const [isLoading, setIsLoading] = useState(true)

  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  const [isCompactView, setIsCompactView] = useState(false)

  const { toast } = useToast()

  const VIEW_TOGGLE_BREAKPOINT = 1280

  const loadLogs = useCallback(async () => {

    setIsLoading(true)

    try {

      const response = await fetchAuditLogs({ per_page: 200 })

      setLogs(response.data.map(mapApiAuditLog))

    } catch (error) {

      toast({

        variant: "destructive",

        description: error instanceof Error ? error.message : "No pudimos cargar la auditoría.",

      })

    } finally {

      setIsLoading(false)

    }

  }, [toast])

  useEffect(() => {

    void loadLogs()

  }, [loadLogs])

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

  const filteredLogs = useMemo(() => {

    return logs.filter((log) => {

      const matchesAction = filterAction === "all" || log.action === filterAction

      const matchesEntity = filterEntity === "all" || log.entity === filterEntity

      return matchesAction && matchesEntity

    })

  }, [filterAction, filterEntity, logs])

  const actions = useMemo(() => ["all", ...new Set(logs.map((l) => l.action))], [logs])

  const entities = useMemo(() => ["all", ...new Set(logs.map((l) => l.entity))], [logs])

  const createdCount = useMemo(
    () => logs.filter((log) => classifyAction(log.action) === "create").length,
    [logs],
  )

  const updatedCount = useMemo(
    () => logs.filter((log) => classifyAction(log.action) === "update").length,
    [logs],
  )

  const deletedCount = useMemo(
    () => logs.filter((log) => classifyAction(log.action) === "delete").length,
    [logs],
  )

  const getActionBadgeColor = (action: string) => {

    const classification = classifyAction(action)

    if (classification === "create") {

      return "border-green-500/50 bg-green-500/10 text-green-500"

    }

    if (classification === "update") {

      return "border-blue-500/50 bg-blue-500/10 text-blue-500"

    }

    if (classification === "delete") {

      return "border-destructive/50 bg-destructive/10 text-destructive"

    }

    return "border-muted-foreground/50 bg-muted/10 text-muted-foreground"

  }

  const getStatusIcon = (status: string) => {

    switch (status) {

      case "success":

        return <CheckCircle className="w-4 h-4 text-green-500" />

      case "warning":

        return <AlertCircle className="w-4 h-4 text-orange-500" />

      case "error":

        return <AlertCircle className="w-4 h-4 text-destructive" />

      default:

        return null

    }

  }

  if (isLoading) {

    return (

      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">

        <div className="text-center">

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 mb-4">

            <Clock className="w-6 h-6 text-primary animate-spin" />

          </div>

          <p className="text-muted-foreground">Cargando auditorÃ­a...</p>

        </div>

      </div>

    )

  }

  const effectiveViewMode = isCompactView ? "cards" : viewMode

  return (

    <div className="p-6 md:p-8 space-y-6">

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <div className="mb-6">

          <h1 className="text-3xl font-bold text-foreground">Registro de AuditorÃ­a</h1>

          <p className="text-muted-foreground mt-1">Historial completo de cambios en el sistema</p>

        </div>

      </motion.div>

      {/* Summary cards */}

      <motion.div

        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}

        transition={{ delay: 0.05 }}

      >

        <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-4">

          <div className="text-sm text-muted-foreground mb-1">Total de Eventos</div>

          <div className="text-2xl font-bold text-foreground">{logs.length}</div>

        </Card>

        <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-4">

          <div className="text-sm text-muted-foreground mb-1">Creaciones</div>

          <div className="text-2xl font-bold text-green-500">{createdCount}</div>

        </Card>

        <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-4">

          <div className="text-sm text-muted-foreground mb-1">Actualizaciones</div>

          <div className="text-2xl font-bold text-blue-500">{updatedCount}</div>

        </Card>

        <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-4">

          <div className="text-sm text-muted-foreground mb-1">Eliminaciones</div>

          <div className="text-2xl font-bold text-destructive">{deletedCount}</div>

        </Card>

      </motion.div>

      {/* Filters */}

      <motion.div

        className="grid grid-cols-1 md:grid-cols-3 gap-4"

        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}

        transition={{ delay: 0.1 }}

      >

        <motion.select

          value={filterAction}

          onChange={(e) => setFilterAction(e.target.value)}

          className="px-4 py-2 rounded-lg bg-secondary/50 border border-primary/20 text-foreground cursor-pointer"

          whileHover={{ borderColor: "hsl(var(--primary))" }}

        >

          <option value="all">Todas las acciones</option>

          {actions

            .filter((a) => a !== "all")

            .map((action) => (

              <option key={action} value={action}>

                {action}

              </option>

            ))}

        </motion.select>

        <motion.select

          value={filterEntity}

          onChange={(e) => setFilterEntity(e.target.value)}

          className="px-4 py-2 rounded-lg bg-secondary/50 border border-primary/20 text-foreground cursor-pointer"

          whileHover={{ borderColor: "hsl(var(--primary))" }}

        >

          <option value="all">Todas las entidades</option>

          {entities

            .filter((e) => e !== "all")

            .map((entity) => (

              <option key={entity} value={entity}>

                {entity}

              </option>

            ))}

        </motion.select>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:flex-col md:items-end md:text-right">

          <div>{filteredLogs.length} evento(s) encontrado(s)</div>

          {!isCompactView && (

            <div className="flex gap-1 bg-secondary/50 border border-primary/20 rounded-lg p-1">

              <motion.button

                whileHover={{ scale: 1.05 }}

                whileTap={{ scale: 0.95 }}

                onClick={() => setViewMode("table")}

                className={`p-2 rounded transition-colors ${

                  viewMode === "table" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"

                }`}

                title="Vista tabla"

              >

                <List className="w-4 h-4" />

              </motion.button>

              <motion.button

                whileHover={{ scale: 1.05 }}

                whileTap={{ scale: 0.95 }}

                onClick={() => setViewMode("cards")}

                className={`p-2 rounded transition-colors ${

                  viewMode === "cards" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"

                }`}

                title="Vista tarjetas"

              >

                <Grid3x3 className="w-4 h-4" />

              </motion.button>

            </div>

          )}

        </div>

      </motion.div>

      {/* Audit logs view */}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>

        {effectiveViewMode === "table" ? (

          <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl overflow-hidden">

            {filteredLogs.length === 0 ? (

              <div className="p-12 text-center">

                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />

                <p className="text-muted-foreground">No hay registros de auditoría</p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-border/50 bg-secondary/20">

                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Acción</th>

                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Entidad</th>

                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Usuario</th>

                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Descripción</th>

                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Fecha</th>

                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Estado</th>

                    </tr>

                  </thead>

                  <tbody>

                    <AnimatePresence>

                      {filteredLogs.map((log, index) => (

                        <motion.tr

                          key={log.id}

                          initial={{ opacity: 0, x: -20 }}

                          animate={{ opacity: 1, x: 0 }}

                          transition={{ delay: index * 0.04 }}

                          className="border-b border-border/50 hover:bg-secondary/20 transition-colors"

                        >

                          <td className="px-4 py-3">

                            <Badge variant="outline" className={getActionBadgeColor(log.action)}>

                              {log.action}

                            </Badge>

                          </td>

                          <td className="px-4 py-3 text-sm text-foreground">

                            <div className="font-medium">{log.entityName}</div>

                            <p className="text-xs text-muted-foreground">({log.entity})</p>

                          </td>

                          <td className="px-4 py-3 text-sm text-muted-foreground">{log.user}</td>

                          <td className="px-4 py-3 text-sm text-muted-foreground">{log.description}</td>

                          <td className="px-4 py-3 text-sm text-muted-foreground">

                            {log.timestamp.toLocaleString("es-ES")}

                          </td>

                          <td className="px-4 py-3">

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">

                              {getStatusIcon(log.status)}

                              <span className="capitalize">{log.status}</span>

                            </div>

                          </td>

                        </motion.tr>

                      ))}

                    </AnimatePresence>

                  </tbody>

                </table>

              </div>

            )}

          </Card>

        ) : (

          <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl overflow-hidden">

            <div className="divide-y divide-border/50">

              {filteredLogs.length === 0 ? (

                <div className="p-12 text-center">

                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />

                  <p className="text-muted-foreground">No hay registros de auditoría</p>

                </div>

              ) : (

                <AnimatePresence>

                  {filteredLogs.map((log, index) => (

                    <motion.div

                      key={log.id}

                      initial={{ opacity: 0, x: -20 }}

                      animate={{ opacity: 1, x: 0 }}

                      transition={{ delay: index * 0.05 }}

                      className="p-4 hover:bg-secondary/20 transition-colors"

                    >

                      <div className="flex items-start gap-4">

                        <div className="mt-1">{getStatusIcon(log.status)}</div>

                        <div className="flex-1 min-w-0">

                          <div className="flex items-center gap-2 mb-2 flex-wrap">

                            <Badge variant="outline" className={getActionBadgeColor(log.action)}>

                              {log.action}

                            </Badge>

                            <span className="text-sm font-medium text-foreground">{log.entityName}</span>

                            <span className="text-xs text-muted-foreground">({log.entity})</span>

                          </div>

                          <p className="text-sm text-muted-foreground mb-2">{log.description}</p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">

                            <div className="flex items-center gap-1">

                              <User className="w-3 h-3" />

                              {log.user}

                            </div>

                            <div className="flex items-center gap-1">

                              <Clock className="w-3 h-3" />

                              {log.timestamp.toLocaleString("es-ES")}

                            </div>

                          </div>

                        </div>

                      </div>

                    </motion.div>

                  ))}

                </AnimatePresence>

              )}

            </div>

          </Card>

        )}

      </motion.div>    </div>

  )

}

function mapApiAuditLog(log: ApiAuditLog): AuditLog {

  const action = log.action ?? "Evento"

  const entity = log.module ?? "Sistema"

  const entityName = formatEntityName(log, entity)

  const classification = classifyAction(action)

  return {

    id: log.id,

    action,

    entity,

    entityName,

    user: log.user?.email ?? log.user?.full_name ?? "Sistema",

    timestamp: new Date(log.created_at),

    status: statusFromClassification(classification),

    description: log.description ?? "Sin descripción",

  }

}

function formatEntityName(log: ApiAuditLog, fallback: string) {

  if (log.affected_table) {

    const suffix = log.affected_id ? ` #${log.affected_id}` : ""

    return `${log.affected_table}${suffix}`

  }

  return fallback

}

type AuditActionClass = "create" | "update" | "delete" | "other"

function classifyAction(action: string): AuditActionClass {

  const normalized = action.toLowerCase()

  if (normalized.match(/elimin|delete|baja/)) return "delete"

  if (normalized.match(/actual|update|edit|cambio/)) return "update"

  if (normalized.match(/crear|create|public|alta|registro/)) return "create"

  return "other"

}

function statusFromClassification(classification: AuditActionClass) {

  switch (classification) {

    case "delete":

      return "error"

    case "update":

      return "warning"

    default:

      return "success"

  }

}

