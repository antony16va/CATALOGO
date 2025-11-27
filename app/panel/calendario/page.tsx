"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, Zap } from "lucide-react"
import { useToast } from "@/hooks"
import { fetchRequests } from "@/lib/api/catalog"
import type { ApiRequest } from "@/types/api"
import gsap from "gsap"

type ViewMode = "month" | "week" | "day"

interface CalendarService {
  id: number
  name: string
  user: string
  level: "critical" | "high" | "medium" | "low"
  date: string // yyyy-MM-dd
  time: string // HH:mm
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const YEARS = (() => {
  const now = new Date().getFullYear()
  return Array.from({ length: 11 }, (_, i) => now - 5 + i)
})()

const getISODate = (date: Date) => date.toISOString().split("T")[0]

const getLevelColor = (level: CalendarService["level"]) => {
  switch (level) {
    case "critical":
      return "bg-red-500/20 text-red-400 border-red-500/40"
    case "high":
      return "bg-orange-500/20 text-orange-400 border-orange-500/40"
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
    case "low":
      return "bg-green-500/20 text-green-400 border-green-500/40"
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/40"
  }
}

export default function CalendarPage() {
  const today = useMemo(() => new Date(), [])
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [activeDate, setActiveDate] = useState(today)
  const [weekAnchorDate, setWeekAnchorDate] = useState(today)
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [scheduledServices, setScheduledServices] = useState<CalendarService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const daysInMonth = useMemo(
    () => new Date(currentYear, currentMonth + 1, 0).getDate(),
    [currentYear, currentMonth],
  )

  const servicesForDate = (date: Date) => {
    const iso = getISODate(date)
    return scheduledServices.filter((service) => service.date === iso)
  }

  const handleSelectDay = (day: number) => {
    const clampedDay = Math.min(Math.max(day, 1), daysInMonth)
    const nextDate = new Date(currentYear, currentMonth, clampedDay)
    setActiveDate(nextDate)
    setWeekAnchorDate(nextDate)
  }

  const handleYearChange = (year: number) => {
    setCurrentYear(year)
    handleSelectDay(activeDate.getDate())
  }

  const handleMonthChange = (monthIndex: number) => {
    setCurrentMonth(monthIndex)
    handleSelectDay(activeDate.getDate())
  }

  const shiftMonth = (offset: number) => {
    const next = new Date(currentYear, currentMonth + offset, 1)
    setCurrentYear(next.getFullYear())
    setCurrentMonth(next.getMonth())
    const nextDaysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
    const safeDay = Math.min(activeDate.getDate(), nextDaysInMonth)
    const updated = new Date(next.getFullYear(), next.getMonth(), safeDay)
    setActiveDate(updated)
    setWeekAnchorDate(updated)
  }

  const goToToday = () => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setActiveDate(today)
    setWeekAnchorDate(today)
  }

  const monthViewDate = useMemo(() => new Date(currentYear, currentMonth, 1), [currentYear, currentMonth])
  const firstDayIndex = monthViewDate.getDay()

  const monthCells = useMemo(() => {
    const cells: Array<number | null> = []
    for (let i = 0; i < firstDayIndex; i++) cells.push(null)
    for (let day = 1; day <= daysInMonth; day++) cells.push(day)
    return cells
  }, [firstDayIndex, daysInMonth])

  const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekAnchorDate)
    date.setDate(date.getDate() + i)
    return date
  }), [weekAnchorDate])

  const dayList = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const loadScheduledServices = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetchRequests({ per_page: 200 })
      setScheduledServices(response.data.map(mapRequestToCalendarService))
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos cargar la agenda.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadScheduledServices()
  }, [loadScheduledServices])

  useEffect(() => {
    const contentElement = document.querySelector("[data-calendar-content]")
    if (contentElement) {
      gsap.fromTo(contentElement, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
    }
  }, [viewMode, currentYear, currentMonth, weekAnchorDate, activeDate])

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 mb-4">
            <Clock className="w-6 h-6 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando agenda...</p>
        </div>
      </div>
    )
  }

  const monthView = () => (
    <Card className="border border-slate-200 dark:border-blue-500/20 bg-white dark:bg-slate-950 backdrop-blur-xl p-6 shadow-sm dark:shadow-none">
      <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-semibold text-muted-foreground">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((weekday) => (
          <div key={weekday} className="py-2 uppercase tracking-wide">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {monthCells.map((cell, index) => {
          if (cell === null) {
            return <div key={`empty-${index}`} className="h-20 rounded-lg bg-transparent" />
          }
          const dateInstance = new Date(currentYear, currentMonth, cell)
          const services = servicesForDate(dateInstance)
          const isToday = getISODate(dateInstance) === getISODate(today)
          const isActive = getISODate(dateInstance) === getISODate(activeDate)

          return (
            <button
              key={cell}
              onClick={() => {
                handleSelectDay(cell)
                if (services.length > 0) {
                  setSelectedDateISO(getISODate(dateInstance))
                  setShowModal(true)
                }
              }}
              className={`h-24 rounded-lg border transition-all text-left px-3 py-2 group ${isActive
                ? "border-primary/60 bg-primary/10 shadow-lg shadow-primary/30"
                : "border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>{cell}</span>
                {isToday && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">Hoy</span>}
              </div>

              <div className="space-y-1 mt-2">
                {services.slice(0, 2).map((service) => (
                  <div
                    key={service.id}
                    className={`text-[11px] px-2 py-1 rounded ${getLevelColor(service.level)} truncate`}
                    title={`${service.name} - ${service.user}`}
                  >
                    {service.time} · {service.name}
                  </div>
                ))}
                {services.length > 2 && (
                  <div className="text-[11px] text-blue-400 font-medium">+{services.length - 2} más</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )

  const weekView = () => (
    <Card className="border border-slate-200 dark:border-blue-500/20 bg-white dark:bg-slate-950 backdrop-blur-xl p-6 overflow-x-auto shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <span>
          Semana desde{" "}
          <strong>
            {weekAnchorDate.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
          </strong>{" "}
          hasta{" "}
          <strong>
            {new Date(weekAnchorDate.getFullYear(), weekAnchorDate.getMonth(), weekAnchorDate.getDate() + 6).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
            })}
          </strong>
        </span>
        <span className="text-xs uppercase tracking-wide text-blue-300">
          {weekDays[0].toLocaleDateString("es-ES", { weekday: "long" })} + 6 días
        </span>
      </div>
      <div className="grid grid-cols-8 gap-2 text-xs font-semibold text-muted-foreground mb-2">
        <div className="text-right pr-4">Hora</div>
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="text-center text-foreground">
            {day.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase()}
            <div className="text-[10px] text-muted-foreground">
              {day.toLocaleDateString("es-ES", { day: "numeric", month: "numeric" })}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 24 }).map((_, hour) => (
          <div key={hour} className="grid grid-cols-8 gap-2">
            <div className="text-right pr-4 text-[11px] text-muted-foreground font-medium">{`${String(hour).padStart(2, "0")}:00`}</div>
            {weekDays.map((day) => {
              const services = servicesForDate(day).filter(
                (service) => Number.parseInt(service.time.split(":")[0]) === hour,
              )
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="min-h-14 rounded-lg border border-slate-800/60 bg-slate-900/30 px-2 py-1 space-y-1"
                >
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`text-[11px] px-2 py-1 rounded ${getLevelColor(service.level)} truncate`}
                      title={`${service.name} - ${service.user}`}
                    >
                      {service.name}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </Card>
  )

  const dayView = () => {
    const services = servicesForDate(activeDate)
    const formatted = activeDate.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })

    return (
      <Card className="border border-slate-200 dark:border-blue-500/20 bg-white dark:bg-slate-950 backdrop-blur-xl p-6 space-y-4 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground capitalize">{formatted}</h2>
            <p className="text-sm text-muted-foreground">Actividades planificadas para este día</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm"
              value={activeDate.getDate()}
              onChange={(event) => handleSelectDay(Number(event.target.value))}
            >
              {dayList.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {services.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No hay actividades registradas.</p>
          )}

          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between border border-slate-200 dark:border-slate-800/60 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
              <div>
                <h3 className="text-base font-semibold text-foreground">{service.name}</h3>
                <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {service.user}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {service.time}
                  </span>
                </div>
              </div>
              <Badge className={getLevelColor(service.level)}>
                <Zap className="w-3 h-3 mr-1" />
                {service.level.charAt(0).toUpperCase() + service.level.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const miniCalendarView = () => (
    <Card className="border border-slate-200 dark:border-slate-800/70 bg-white dark:bg-slate-950 backdrop-blur-xl p-4 space-y-4 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Mes en curso</p>
          <p className="text-lg font-semibold text-foreground">
            {MONTHS[currentMonth]} {currentYear}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Hoy
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-muted-foreground">
        {["D", "L", "M", "M", "J", "V", "S"].map((day, index) => (
          <div key={`${day}-${index}`}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs">
        {monthCells.map((cell, index) => {
          if (!cell) return <div key={`mini-cell-${index}`} />
          const date = new Date(currentYear, currentMonth, cell)
          const isActive = getISODate(date) === getISODate(activeDate)
          return (
            <button
              key={`mini-cell-${index}`}
              onClick={() => handleSelectDay(cell)}
              className={`h-8 rounded-full transition ${isActive ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-slate-800/80"
                }`}
            >
              {cell}
            </button>
          )
        })}
      </div>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Calendario de Servicios
              </h1>
              <p className="text-sm text-muted-foreground">
                Fecha actual:{" "}
                <strong>{today.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</strong>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2">
              {(["month", "week", "day"] as ViewMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  onClick={() => setViewMode(mode)}
                  className={viewMode === mode ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : ""}
                >
                  {mode === "month" ? "Mes" : mode === "week" ? "Semana" : "Día"}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-xl p-4 text-sm">
            <label className="flex flex-col text-muted-foreground">
              Año
              <select
                className="mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5"
                value={currentYear}
                onChange={(event) => handleYearChange(Number(event.target.value))}
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-muted-foreground">
              Mes
              <select
                className="mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5"
                value={currentMonth}
                onChange={(event) => handleMonthChange(Number(event.target.value))}
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-muted-foreground">
              Día
              <select
                className="mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5"
                value={activeDate.getDate()}
                onChange={(event) => handleSelectDay(Number(event.target.value))}
              >
                {dayList.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>

            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => shiftMonth(-1)}>
                ← Mes
              </Button>
              <Button variant="outline" onClick={() => shiftMonth(1)}>
                Mes →
              </Button>
              <Button onClick={goToToday} className="bg-primary/80 hover:bg-primary">
                Ir a hoy
              </Button>
            </div>
          </div>
        </div>

        <div data-calendar-content>
          {viewMode === "month" && monthView()}
          {viewMode === "week" && weekView()}
          {viewMode === "day" && dayView()}
        </div>
      </div>

      <div className="hidden lg:block space-y-4">
        {miniCalendarView()}
        <Card className="border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950 backdrop-blur-xl p-4 space-y-2 shadow-sm dark:shadow-none">
          <h3 className="text-sm font-semibold text-foreground">Selección semanal</h3>
          <p className="text-xs text-muted-foreground">
            Elige un día para iniciar la semana y se incluirán automáticamente los 6 días siguientes.
          </p>
          <select
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm"
            value={getISODate(weekAnchorDate)}
            onChange={(event) => setWeekAnchorDate(new Date(event.target.value))}
          >
            {monthCells
              .filter((cell): cell is number => cell !== null)
              .map((day) => {
                const anchor = new Date(currentYear, currentMonth, day)
                return (
                  <option key={day} value={getISODate(anchor)}>
                    {anchor.toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </option>
                )
              })}
          </select>
        </Card>
      </div>

      {showModal && selectedDateISO && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <Card
            className="border border-blue-500/30 bg-slate-950/90 backdrop-blur-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  {new Date(selectedDateISO).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                {servicesForDate(new Date(selectedDateISO)).map((service) => (
                  <div key={service.id} className="p-4 rounded-lg border border-blue-500/20 bg-slate-900/60 space-y-2">
                    <h3 className="font-semibold text-foreground">{service.name}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {service.user}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {service.time}
                      </div>
                    </div>
                    <Badge className={getLevelColor(service.level)}>
                      <Zap className="w-3 h-3 mr-1" />
                      {service.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function mapRequestToCalendarService(request: ApiRequest): CalendarService {
  const submittedAt = request.submitted_at ? new Date(request.submitted_at) : new Date()
  const isoDate = submittedAt.toISOString().split("T")[0]
  const time = submittedAt.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
  const priority = request.service?.priority ?? request.service_snapshot?.priority ?? "Media"

  return {
    id: request.id,
    name: request.service?.name ?? request.service_snapshot?.name ?? request.code,
    user: request.requester?.full_name ?? request.requester?.email ?? "Sin usuario",
    level: priorityToLevel(priority),
    date: isoDate,
    time,
  }
}

function priorityToLevel(priority: string): CalendarService["level"] {
  const normalized = priority.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  if (normalized.includes("crit")) return "critical"
  if (normalized.includes("alta")) return "high"
  if (normalized.includes("media")) return "medium"
  return "low"
}
