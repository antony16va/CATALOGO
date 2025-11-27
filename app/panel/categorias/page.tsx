"use client"

import { useCallback, useEffect, useMemo, useState, useTransition, useOptimistic } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Edit2, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { CategoryDialog, type CategoryFormValues } from "@/components/categories/category-dialog"
import { useToast } from "@/hooks"
import { useAuth } from "@/contexts/auth-context"
import type { Category } from "@/types/category"
import type { ApiCategory } from "@/types/api"
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api/catalog"

const iconFallbacks = ["💡", "🧠", "🛠️", "⚙️", "🛰️", "🔐", "🧩", "🚀"]
const colorFallbacks = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-purple-500",
  "from-rose-500 to-red-500",
]

// Optimistic update reducer for React 19
type OptimisticAction = 
  | { type: "add"; category: Category }
  | { type: "update"; category: Category }
  | { type: "delete"; id: number }

function categoriesReducer(state: Category[], action: OptimisticAction): Category[] {
  switch (action.type) {
    case "add":
      return [...state, action.category]
    case "update":
      return state.map((c) => (c.id === action.category.id ? action.category : c))
    case "delete":
      return state.filter((c) => c.id !== action.id)
    default:
      return state
  }
}

export default function CategoriesPage() {
  const { toast } = useToast()
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // React 19: useTransition for non-blocking async operations
  const [isPending, startTransition] = useTransition()
  
  // React 19: useOptimistic for instant UI feedback
  const [optimisticCategories, addOptimistic] = useOptimistic(
    categories,
    categoriesReducer
  )

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetchCategories({ per_page: 200 })
      setCategories(response.data.map((category, index) => mapApiCategory(category, index)))
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "No pudimos cargar las categorías.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const filteredCategories = useMemo(() => {
    return optimisticCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [optimisticCategories, searchTerm])

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setDialogOpen(true)
  }

  const handleDeleteCategory = async (id: number) => {
    // React 19: Optimistic delete with transition
    startTransition(async () => {
      addOptimistic({ type: "delete", id })
      try {
        await deleteCategory(id)
        toast({ description: "Categoría eliminada correctamente." })
        await loadCategories()
      } catch (error) {
        toast({
          variant: "destructive",
          description: error instanceof Error ? error.message : "No pudimos eliminar la categoría.",
        })
        // Revert on error by reloading
        await loadCategories()
      }
    })
  }

  const handleSaveCategory = async (data: CategoryFormValues) => {
    const payload = {
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      active: true,
    }

    // React 19: Use transition for async save
    startTransition(async () => {
      try {
        if (selectedCategory) {
          // Optimistic update
          addOptimistic({
            type: "update",
            category: { ...selectedCategory, ...data },
          })
          await updateCategory(selectedCategory.id, payload)
          toast({ description: "Categoría actualizada correctamente." })
        } else {
          // Optimistic add with temp ID
          const tempCategory: Category = {
            id: -Date.now(),
            name: data.name,
            description: data.description,
            icon: data.icon,
            color: data.color,
            active: true,
            servicesCount: 0,
            createdAt: new Date(),
          }
          addOptimistic({ type: "add", category: tempCategory })
          await createCategory(payload)
          toast({ description: "Categoría creada correctamente." })
        }
        await loadCategories()
      } catch (error) {
        toast({
          variant: "destructive",
          description: error instanceof Error ? error.message : "No pudimos guardar la categoría.",
        })
        await loadCategories()
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

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Pending indicator for transitions */}
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
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Catálogo</p>
            <h1 className="text-3xl font-bold text-foreground">Gestión de categorías</h1>
            <p className="text-muted-foreground mt-1">Agrupa y jerarquiza los servicios publicados.</p>
          </div>
          {isAdmin && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleAddCategory}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2 w-full md:w-auto"
              >
                <Plus className="w-4 h-4" />
                Nueva categoría
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-secondary/50 border-primary/20 pl-10"
          />
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredCategories.length === 0 ? (
          <Card className="col-span-full border border-primary/20 bg-gradient-to-br from-card to-card/50 p-12">
            <div className="text-center">
              <p className="text-muted-foreground">No hay categorías registradas</p>
            </div>
          </Card>
        ) : (
          <AnimatePresence>
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border border-primary/20 bg-gradient-to-br ${category.color} bg-opacity-10 p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{category.icon}</div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 rounded-lg hover:bg-primary/20 transition text-muted-foreground hover:text-primary"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 rounded-lg hover:bg-destructive/20 transition text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>

                  <div className="text-xs text-muted-foreground">
                    {category.servicesCount} servicio{category.servicesCount !== 1 ? "s" : ""}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      <AnimatePresence>
        {dialogOpen && (
          <CategoryDialog
            category={selectedCategory}
            onClose={() => {
              setDialogOpen(false)
              setSelectedCategory(null)
            }}
            onSave={handleSaveCategory}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function mapApiCategory(category: ApiCategory, index: number): Category {
  const fallbackIcon = iconFallbacks[index % iconFallbacks.length]
  const fallbackColor = colorFallbacks[index % colorFallbacks.length]

  return {
    id: category.id,
    name: category.name,
    description: category.description ?? "",
    icon: category.icon ?? fallbackIcon,
    color: category.color ?? fallbackColor,
    active: category.active,
    servicesCount: category.services_count ?? 0,
    createdAt: new Date(category.created_at),
  }
}
