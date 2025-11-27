"use client"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface DashboardMetricProps {
  label: string
  value: string
  description: string
  icon: LucideIcon
  gradient: string
}

export function DashboardMetric({ label, value, description, icon: Icon, gradient }: DashboardMetricProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl hover:border-primary/40 transition-all duration-300 p-6">
        {/* Background gradient accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-accent/5 opacity-30 rounded-full blur-2xl" />

        <div className="relative z-10">
          {/* Header with icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{label}</h3>
          <motion.p
            className="text-3xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {value}
          </motion.p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </Card>
    </motion.div>
  )
}
