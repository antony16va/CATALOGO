"use client"

import { useState, useCallback, useTransition, useOptimistic } from "react"
import { useToast } from "@/hooks"

/**
 * Hook Personalizado React 19: useOptimisticCrud
 * 
 * Proporciona un patrón CRUD completo con actualizaciones optimistas.
 * 
 * Características principales:
 * - useTransition: Permite operaciones asíncronas sin bloquear la UI
 * - useOptimistic: Muestra cambios instantáneos antes de que el servidor responda
 * - Rollback automático: Si hay error, revierte los cambios al estado anterior
 * - Notificaciones toast: Informa al usuario del resultado de cada operación
 * 
 * @example
 * // Ejemplo de uso con categorías
 * const { items, isPending, create, update, remove, refresh } = useOptimisticCrud({
 *   fetchFn: () => fetchCategories({ per_page: 200 }),
 *   createFn: (data) => createCategory(data),
 *   updateFn: (id, data) => updateCategory(id, data),
 *   deleteFn: (id) => deleteCategory(id),
 *   mapResponse: (response) => response.data.map(mapApiCategory),
 *   getItemId: (item) => item.id,
 * })
 */

/**
 * Configuración para el hook CRUD
 * Define las funciones necesarias para interactuar con la API
 */
export interface CrudConfig<T, TCreate, TUpdate, TResponse> {
  /** Función para obtener todos los elementos desde el servidor */
  fetchFn: () => Promise<TResponse>
  /** Función para crear un nuevo elemento en el servidor */
  createFn: (data: TCreate) => Promise<unknown>
  /** Función para actualizar un elemento existente en el servidor */
  updateFn: (id: number, data: TUpdate) => Promise<unknown>
  /** Función para eliminar un elemento del servidor */
  deleteFn: (id: number) => Promise<void>
  /** Transforma la respuesta de la API al formato del estado local */
  mapResponse: (response: TResponse) => T[]
  /** Obtiene el ID único de un elemento (para identificarlo en el estado) */
  getItemId: (item: T) => number
  /** Crea un elemento temporal para mostrar mientras se procesa la creación */
  createTempItem?: (data: TCreate) => T
  /** Combina los datos de actualización con el elemento existente */
  mergeUpdate?: (item: T, data: TUpdate) => T
}

/**
 * Mensajes personalizables para las notificaciones toast
 * Permite definir mensajes en español para cada operación
 */
export interface CrudMessages {
  createSuccess?: string
  createError?: string
  updateSuccess?: string
  updateError?: string
  deleteSuccess?: string
  deleteError?: string
  fetchError?: string
}

/**
 * Mensajes por defecto en español
 * Se usan si no se proporcionan mensajes personalizados
 */
const defaultMessages: CrudMessages = {
  createSuccess: "Elemento creado correctamente.",
  createError: "No pudimos crear el elemento.",
  updateSuccess: "Elemento actualizado correctamente.",
  updateError: "No pudimos actualizar el elemento.",
  deleteSuccess: "Elemento eliminado correctamente.",
  deleteError: "No pudimos eliminar el elemento.",
  fetchError: "No pudimos cargar los datos.",
}

/**
 * Tipo de acción optimista
 * Define las tres operaciones posibles: agregar, actualizar o eliminar
 */
type OptimisticAction<T> =
  | { type: "add"; item: T }      // Agregar nuevo elemento
  | { type: "update"; item: T }   // Actualizar elemento existente
  | { type: "delete"; id: number } // Eliminar elemento por ID

/**
 * Crea un reducer para manejar las acciones optimistas
 * Este reducer actualiza el estado local inmediatamente sin esperar al servidor
 * 
 * @param getItemId - Función para obtener el ID de un elemento
 * @returns Función reducer que procesa las acciones optimistas
 */
function createReducer<T>(getItemId: (item: T) => number) {
  return function reducer(state: T[], action: OptimisticAction<T>): T[] {
    switch (action.type) {
      case "add":
        // Agrega el nuevo elemento al final del array
        return [...state, action.item]
      case "update":
        // Reemplaza el elemento que coincida con el ID
        return state.map((item) =>
          getItemId(item) === getItemId(action.item) ? action.item : item
        )
      case "delete":
        // Filtra y elimina el elemento con el ID especificado
        return state.filter((item) => getItemId(item) !== action.id)
      default:
        return state
    }
  }
}

/**
 * Hook principal para operaciones CRUD con actualizaciones optimistas
 * 
 * @param config - Configuración con las funciones de API y transformación
 * @param messages - Mensajes personalizados para las notificaciones (opcional)
 * @returns Objeto con items, estados y funciones CRUD
 */
export function useOptimisticCrud<T, TCreate, TUpdate, TResponse>(
  config: CrudConfig<T, TCreate, TUpdate, TResponse>,
  messages: CrudMessages = {}
) {
  const { toast } = useToast()
  // Combina mensajes por defecto con los personalizados
  const msgs = { ...defaultMessages, ...messages }
  
  // Estado principal: lista de elementos desde el servidor
  const [items, setItems] = useState<T[]>([])
  // Estado de carga inicial
  const [isLoading, setIsLoading] = useState(true)
  // React 19: useTransition para marcar operaciones como no urgentes
  // isPending será true mientras la transición está en progreso
  const [isPending, startTransition] = useTransition()
  
  // Crea el reducer para este tipo de elemento
  const reducer = createReducer(config.getItemId)
  // React 19: useOptimistic permite mostrar cambios antes de que se confirmen
  // optimisticItems refleja el estado "esperado" antes de la respuesta del servidor
  const [optimisticItems, addOptimistic] = useOptimistic(items, reducer)

  /**
   * Recarga todos los elementos desde el servidor
   * Se llama al inicio y después de cada operación CRUD
   */
  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await config.fetchFn()
      // Transforma la respuesta de la API al formato local
      setItems(config.mapResponse(response))
    } catch (error) {
      // Muestra error si falla la carga
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : msgs.fetchError,
      })
    } finally {
      setIsLoading(false)
    }
  }, [config, msgs.fetchError, toast])

  /**
   * Crea un nuevo elemento con actualización optimista
   * 
   * @param data - Datos del nuevo elemento
   * @param tempItem - Elemento temporal para mostrar mientras se procesa (opcional)
   */
  const create = useCallback(
    async (data: TCreate, tempItem?: T) => {
      // Envuelve la operación en una transición para no bloquear la UI
      startTransition(async () => {
        // Si hay elemento temporal, lo muestra inmediatamente
        if (tempItem) {
          addOptimistic({ type: "add", item: tempItem })
        }
        try {
          // Envía la petición al servidor
          await config.createFn(data)
          toast({ description: msgs.createSuccess })
          // Recarga para obtener el elemento con ID real del servidor
          await refresh()
        } catch (error) {
          toast({
            variant: "destructive",
            description: error instanceof Error ? error.message : msgs.createError,
          })
          // En caso de error, recarga para revertir el estado optimista
          await refresh()
          throw error
        }
      })
    },
    [config, msgs.createSuccess, msgs.createError, toast, refresh, addOptimistic]
  )

  /**
   * Actualiza un elemento existente con actualización optimista
   * 
   * @param id - ID del elemento a actualizar
   * @param data - Nuevos datos del elemento
   * @param optimisticItem - Estado optimista del elemento actualizado (opcional)
   */
  const update = useCallback(
    async (id: number, data: TUpdate, optimisticItem?: T) => {
      startTransition(async () => {
        // Muestra el cambio inmediatamente si hay estado optimista
        if (optimisticItem) {
          addOptimistic({ type: "update", item: optimisticItem })
        }
        try {
          await config.updateFn(id, data)
          toast({ description: msgs.updateSuccess })
          await refresh()
        } catch (error) {
          toast({
            variant: "destructive",
            description: error instanceof Error ? error.message : msgs.updateError,
          })
          // Rollback: recarga el estado real del servidor
          await refresh()
          throw error
        }
      })
    },
    [config, msgs.updateSuccess, msgs.updateError, toast, refresh, addOptimistic]
  )

  /**
   * Elimina un elemento con actualización optimista
   * El elemento desaparece inmediatamente de la UI
   * 
   * @param id - ID del elemento a eliminar
   */
  const remove = useCallback(
    async (id: number) => {
      startTransition(async () => {
        // Elimina visualmente de inmediato (optimista)
        addOptimistic({ type: "delete", id })
        try {
          // Confirma la eliminación en el servidor
          await config.deleteFn(id)
          toast({ description: msgs.deleteSuccess })
          await refresh()
        } catch (error) {
          toast({
            variant: "destructive",
            description: error instanceof Error ? error.message : msgs.deleteError,
          })
          // Si falla, recarga para restaurar el elemento
          await refresh()
        }
      })
    },
    [config, msgs.deleteSuccess, msgs.deleteError, toast, refresh, addOptimistic]
  )

  return {
    /** Elementos con actualizaciones optimistas aplicadas (lo que ve el usuario) */
    items: optimisticItems,
    /** Elementos sin cambios optimistas (estado real del servidor) */
    rawItems: items,
    /** Indica si la carga inicial está en progreso */
    isLoading,
    /** Indica si hay una operación CRUD en progreso (de useTransition) */
    isPending,
    /** Crear un nuevo elemento con actualización optimista */
    create,
    /** Actualizar un elemento existente con actualización optimista */
    update,
    /** Eliminar un elemento con actualización optimista */
    remove,
    /** Recargar todos los elementos desde el servidor */
    refresh,
    /** Establecer elementos directamente (para actualizaciones externas) */
    setItems,
  }
}
