"use client"
import { motion } from "framer-motion"
import { Zap, Clock, AlertTriangle, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { DashboardMetric } from "@/components/dashboard/metric"

const metrics = [
  {
    label: "Servicios Activos",
    value: "24",
    description: "Servicios disponibles en el catálogo",
    icon: Zap,
    gradient: "from-slate-400 to-slate-500",
  },
  {
    label: "Solicitudes Pendientes",
    value: "8",
    description: "En espera de atención",
    icon: AlertTriangle,
    gradient: "from-slate-400 to-slate-500",
  },
  {
    label: "SLA Promedio",
    value: "2.5h",
    description: "Tiempo promedio de respuesta",
    icon: Clock,
    gradient: "from-slate-400 to-slate-500",
  },
  {
    label: "Eficiencia",
    value: "94%",
    description: "SLA cumplidos este mes",
    icon: TrendingUp,
    gradient: "from-slate-400 to-slate-500",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
}

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Control</h1>
        <p className="text-muted-foreground">Resumen de métricas del Service Desk y catálogo de servicios</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {metrics.map((metric) => (
          <motion.div key={metric.label} variants={itemVariants}>
            <DashboardMetric {...metric} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="lg:col-span-2 border-primary/10 bg-card/40 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Servicios más solicitados</h3>
          <div className="space-y-3">
            {[
              { name: "Soporte Técnico", requests: 45 },
              { name: "Acceso a Sistemas", requests: 32 },
              { name: "Licencias de Software", requests: 28 },
              { name: "Reset de Contraseña", requests: 21 },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.requests / 45) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{item.requests}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-primary/10 bg-card/40 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Estado de SLA</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">En tiempo</span>
              <span className="text-emerald-500 font-medium">88%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">En riesgo</span>
              <span className="text-yellow-500 font-medium">9%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">Vencido</span>
              <span className="text-red-500 font-medium">3%</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
