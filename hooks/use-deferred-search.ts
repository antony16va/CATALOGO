"use client"

import { useState, useDeferredValue, useMemo, useCallback, useTransition } from "react"

/**
 * Hook Personalizado React 19: useDeferredSearch
 * 
 * Proporciona búsqueda optimizada sin bloquear la interfaz de usuario.
 * 
 * Características principales:
 * - useDeferredValue: Retrasa la actualización de búsqueda para no bloquear el tipeo
 * - useTransition: Marca la búsqueda como operación no urgente
 * - Resultados memorizados: Evita recálculos innecesarios
 * 
 * ¿Por qué usar useDeferredValue?
 * Cuando el usuario escribe rápido, React puede saltarse renderizados intermedios
 * y solo mostrar el resultado final, haciendo la UI más fluida.
 * 
 * @example
 * // Ejemplo de uso con categorías
 * const { searchTerm, setSearchTerm, filteredItems, isSearching } = useDeferredSearch({
 *   items: categories,
 *   searchFn: (item, term) => 
 *     item.name.toLowerCase().includes(term.toLowerCase()),
 * })
 */

/**
 * Configuración para el hook de búsqueda diferida
 */
export interface DeferredSearchConfig<T> {
  /** Lista de elementos donde buscar */
  items: T[]
  /** Función que determina si un elemento coincide con el término de búsqueda */
  searchFn: (item: T, searchTerm: string) => boolean
  /** Caracteres mínimos antes de activar la búsqueda (por defecto: 0) */
  minChars?: number
}

/**
 * Hook para búsqueda optimizada con valor diferido
 * 
 * @param config - Configuración con items y función de búsqueda
 * @returns Objeto con término de búsqueda, resultados filtrados y estados
 */
export function useDeferredSearch<T>(config: DeferredSearchConfig<T>) {
  const { items, searchFn, minChars = 0 } = config
  
  // Estado del término de búsqueda (valor inmediato que el usuario ve en el input)
  const [searchTerm, setSearchTerm] = useState("")
  // useTransition para marcar la búsqueda como no urgente
  const [isPending, startTransition] = useTransition()
  
  // React 19: useDeferredValue crea una versión "retrasada" del término de búsqueda
  // Esto permite que el input responda inmediatamente mientras el filtrado
  // se hace en segundo plano sin bloquear la UI
  const deferredSearchTerm = useDeferredValue(searchTerm)
  
  // Detecta si la búsqueda está "en progreso" (valor diferido desactualizado)
  // Útil para mostrar indicadores de carga
  const isSearching = searchTerm !== deferredSearchTerm || isPending

  // Filtra los elementos usando el término diferido (memorizado para rendimiento)
  const filteredItems = useMemo(() => {
    // No filtra si no hay suficientes caracteres
    if (deferredSearchTerm.length < minChars) {
      return items
    }
    // Aplica la función de búsqueda a cada elemento
    return items.filter((item) => searchFn(item, deferredSearchTerm))
  }, [items, deferredSearchTerm, searchFn, minChars])

  // Función para actualizar la búsqueda envuelta en transición
  const updateSearch = useCallback((value: string) => {
    startTransition(() => {
      setSearchTerm(value)
    })
  }, [])

  // Limpia el término de búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm("")
  }, [])

  return {
    /** Término de búsqueda actual (inmediato, lo que está en el input) */
    searchTerm,
    /** Término de búsqueda diferido (usado para filtrar, puede estar retrasado) */
    deferredSearchTerm,
    /** Función para actualizar el término de búsqueda */
    setSearchTerm: updateSearch,
    /** Función para limpiar la búsqueda */
    clearSearch,
    /** Elementos filtrados basados en la búsqueda diferida */
    filteredItems,
    /** Indica si la búsqueda está en progreso */
    isSearching,
    /** Cantidad total de resultados encontrados */
    resultCount: filteredItems.length,
    /** Indica si no hay resultados (útil para mostrar mensaje vacío) */
    hasNoResults: filteredItems.length === 0 && deferredSearchTerm.length >= minChars,
  }
}

/**
 * Hook Personalizado React 19: useFilteredList
 * 
 * Combina búsqueda con múltiples filtros usando valores diferidos.
 * Ideal para tablas con varios criterios de filtrado (estado, categoría, fecha, etc.)
 * 
 * @example
 * // Ejemplo de uso con servicios
 * const { items, filters, setFilter, clearFilters, isFiltering } = useFilteredList({
 *   items: services,
 *   filterConfigs: {
 *     status: (item, value) => value === 'all' || item.status === value,
 *     category: (item, value) => value === 'all' || item.categoryId === value,
 *   },
 *   searchFn: (item, term) => item.name.toLowerCase().includes(term.toLowerCase()),
 * })
 */

/**
 * Configuración para el hook de lista filtrada
 * @template T - Tipo de los elementos de la lista
 * @template K - Tipo de las claves de filtro (union de strings)
 */
export interface FilterConfig<T, K extends string = string> {
  /** Lista de elementos a filtrar */
  items: T[]
  /** Mapa de nombres de filtro a funciones de filtrado */
  filterConfigs: Record<K, (item: T, value: string) => boolean>
  /** Función de búsqueda opcional (para el campo de texto) */
  searchFn?: (item: T, searchTerm: string) => boolean
  /** Valores iniciales de los filtros */
  initialFilters?: Partial<Record<K, string>>
}

/**
 * Hook para lista con múltiples filtros y búsqueda
 * 
 * @param config - Configuración con items, filtros y búsqueda
 * @returns Objeto con filtros, funciones de control y elementos filtrados
 */
export function useFilteredList<T, K extends string = string>(
  config: FilterConfig<T, K>
) {
  const { items, filterConfigs, searchFn, initialFilters = {} as Partial<Record<K, string>> } = config
  
  // Estado del término de búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  // Estado de los filtros (cada filtro comienza en "all" por defecto)
  const [filters, setFilters] = useState<Record<K, string>>(
    Object.keys(filterConfigs).reduce(
      (acc, key) => ({
        ...acc,
        [key]: (initialFilters as Record<string, string>)[key] ?? "all",
      }),
      {} as Record<K, string>
    )
  )
  
  // Valores diferidos para búsqueda y filtros
  // Permite que la UI responda mientras se calcula el filtrado
  const deferredSearch = useDeferredValue(searchTerm)
  const deferredFilters = useDeferredValue(filters)
  
  // Detecta si hay filtrado en progreso
  const isFiltering = 
    searchTerm !== deferredSearch || 
    JSON.stringify(filters) !== JSON.stringify(deferredFilters)

  // Calcula los elementos filtrados (memorizado para rendimiento)
  const filteredItems = useMemo(() => {
    let result = items

    // Aplica búsqueda si hay función y término
    if (searchFn && deferredSearch) {
      result = result.filter((item) => searchFn(item, deferredSearch))
    }

    // Aplica cada filtro configurado
    for (const [key, filterFn] of Object.entries(filterConfigs)) {
      const filterValue = deferredFilters[key as K]
      // Solo aplica si hay valor y no es "all"
      if (filterValue && filterValue !== "all") {
        result = result.filter((item) => 
          (filterFn as (item: T, value: string) => boolean)(item, filterValue)
        )
      }
    }

    return result
  }, [items, deferredSearch, deferredFilters, filterConfigs, searchFn])

  // Actualiza un filtro específico
  const setFilter = useCallback((key: K, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Limpia todos los filtros y la búsqueda
  const clearFilters = useCallback(() => {
    setFilters(
      Object.keys(filterConfigs).reduce(
        (acc, key) => ({ ...acc, [key]: "all" }),
        {} as Record<K, string>
      )
    )
    setSearchTerm("")
  }, [filterConfigs])

  // Verifica si hay algún filtro activo
  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm.length > 0 ||
      Object.values(filters).some((value) => value !== "all")
    )
  }, [searchTerm, filters])

  return {
    /** Término de búsqueda actual */
    searchTerm,
    /** Función para actualizar el término de búsqueda */
    setSearchTerm,
    /** Valores actuales de todos los filtros */
    filters,
    /** Función para actualizar un filtro específico */
    setFilter,
    /** Función para limpiar todos los filtros y búsqueda */
    clearFilters,
    /** Indica si hay algún filtro o búsqueda activa */
    hasActiveFilters,
    /** Indica si el filtrado está en progreso */
    isFiltering,
    /** Lista de elementos filtrados */
    filteredItems,
    /** Cantidad de resultados */
    resultCount: filteredItems.length,
  }
}
