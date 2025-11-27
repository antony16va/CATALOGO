"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchPublicServices, fetchPublicCategories } from "@/lib/api/catalog"
import type { Service } from "@/types/service"
import type { Category } from "@/types/category"
import type { ApiCategory, ApiService } from "@/types/api"

const iconPalette = ["💡", "🧠", "🛠️", "⚙️", "🛰️", "🔐", "🧩", "🚀"]
const gradientPalette = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-blue-500",
  "from-rose-500 to-red-500",
]

const mapApiCategoryToUi = (category: ApiCategory, index: number): Category => ({
  id: String(category.id),
  name: category.name,
  description: category.description ?? "",
  icon: iconPalette[index % iconPalette.length],
  color: gradientPalette[index % gradientPalette.length],
  servicesCount: category.services_count ?? 0,
  createdAt: new Date(category.created_at),
})

const mapApiServiceToUi = (service: ApiService): Service => ({
  id: service.id,
  code: service.code,
  name: service.name,
  description: service.description,
  category: service.category?.name ?? "Catálogo general",
  categoryId: service.category?.id ?? null,
  subcategory: service.subcategory?.name ?? null,
  subcategoryId: service.subcategory?.id ?? null,
  priority: service.priority === "Crítica" || service.priority === "Cr�tica" ? "Crítica" : service.priority,
  status: service.status,
  sla: service.sla?.name ?? "Sin SLA",
  slaId: service.sla?.id ?? null,
  keywords: service.keywords ?? "",
  createdAt: new Date(service.created_at),
})

export default function ServicesCatalogPage() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get("category")

  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFilter)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [serviceResponse, categoryResponse] = await Promise.all([
          fetchPublicServices(),
          fetchPublicCategories(),
        ])

        setServices(
          serviceResponse
            .filter((service) => service.status === "Publicado")
            .map((service) => mapApiServiceToUi(service)),
        )

        setCategories(categoryResponse.map((category, index) => mapApiCategoryToUi(category, index)))
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [])

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (categoryName: string): string => {
    const cat = categories.find((c) => c.name === categoryName)
    return cat?.color || "from-gray-500 to-gray-600"
  }

  const getCategoryIcon = (categoryName: string): string => {
    const cat = categories.find((c) => c.name === categoryName)
    return cat?.icon || "📦"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando catálogo de servicios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Catálogo de Servicios</h1>
          <p className="text-xl text-muted-foreground">Descubre nuestros servicios y soluciones empresariales</p>
        </div>

        {/* Search and filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-4" />
              <Input
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-secondary/50 border-primary/20 pl-12 h-12 text-base"
              />
            </div>
          </div>

          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-3 rounded-lg bg-secondary/50 border border-primary/20 text-foreground cursor-pointer h-12"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category tags */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              className={`px-4 py-2 rounded-full transition ${
                selectedCategory === cat.name
                  ? `bg-gradient-to-r ${cat.color} text-primary-foreground shadow-lg`
                  : "bg-secondary/50 border border-primary/20 text-foreground hover:border-primary/40"
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Results count */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
        <p className="text-muted-foreground">
          {filteredServices.length} servicio{filteredServices.length !== 1 ? "s" : ""} encontrado
          {filteredServices.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* Services grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredServices.length === 0 ? (
          <div className="col-span-full">
            <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 p-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">No hay servicios disponibles</p>
                <p className="text-sm text-muted-foreground">Intenta con otros términos de búsqueda o categoría</p>
              </div>
            </Card>
          </div>
        ) : (
          <AnimatePresence>
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`border border-primary/20 bg-gradient-to-br ${getCategoryColor(
                    service.category,
                  )} bg-opacity-5 p-6 hover:shadow-lg transition flex flex-col h-full`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{getCategoryIcon(service.category)}</div>
                    <Badge
                      variant="outline"
                      className={
                        service.priority === "Alta"
                          ? "border-destructive/50 bg-destructive/10 text-destructive"
                          : service.priority === "Media"
                            ? "border-orange-500/50 bg-orange-500/10 text-orange-500"
                            : "border-green-500/50 bg-green-500/10 text-green-500"
                      }
                    >
                      {service.priority === "Alta" && "Prioritario"}
                      {service.priority === "Media" && "Estándar"}
                      {service.priority === "Baja" && "Básico"}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-2">{service.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-1">{service.description}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-primary font-medium">Categoría:</span>
                      <span className="text-foreground">{service.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-foreground">{service.sla}</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium transition hover:shadow-lg"
                  >
                    Solicitar Servicio
                  </motion.button>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Info section */}
      {filteredServices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 pt-12 border-t border-border/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Rápido</h4>
              <p className="text-sm text-muted-foreground">Respuesta ágil a tus solicitudes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Profesional</h4>
              <p className="text-sm text-muted-foreground">Equipo altamente capacitado</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Confiable</h4>
              <p className="text-sm text-muted-foreground">SLAs garantizados</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
