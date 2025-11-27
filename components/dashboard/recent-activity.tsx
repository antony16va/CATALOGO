"use client"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"

const activities = [{ id: 1, action: "Consulta", entity: "SKU o nombre y exporta el stock consolidado." }]

export function RecentActivity() {
  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Inventario de productos</h2>
          <p className="text-sm text-muted-foreground">Busca por SKU o nombre y exporta el stock consolidado.</p>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/20 text-foreground hover:bg-primary/10 bg-transparent"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
          <span className="text-3xl">📦</span>
        </div>
        <p className="text-muted-foreground mb-2">No se encontraron productos con ese criterio.</p>
        <p className="text-sm text-muted-foreground">Intenta con otros filtros o términos de búsqueda.</p>
      </div>

      {/* Table headers (for reference) */}
      <div className="border-t border-border/50 pt-4">
        <div className="grid grid-cols-8 gap-4 text-xs font-semibold text-muted-foreground px-4">
          <div>SKU</div>
          <div>Producto</div>
          <div>Categoría</div>
          <div>Stock</div>
          <div>Punto pedido</div>
          <div>Precio venta</div>
          <div>Ubicación</div>
          <div>Estado</div>
        </div>
      </div>
    </Card>
  )
}
