"use client"

import { useState, useEffect, useMemo, useCallback, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Trash2, Edit2, Plus, Search, Users, Shield, Loader2, Clock, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts"
import { fetchUsers, createUser, updateUser, deleteUser, toggleUserActive } from "@/lib/api/catalog"
import type { ApiUser } from "@/types/api"
import { useToast } from "@/hooks/use-toast"

/**
 * Tipo interno para representar un usuario en el frontend.
 * Mapea los campos de la API a una estructura más amigable para la UI.
 */
interface User {
  id: string
  name: string
  email: string
  username: string
  password: string
  role: "admin" | "user"
  status: "active" | "inactive"
  joinDate: string
}

/**
 * Convierte un usuario de la API al formato interno del frontend.
 * @param apiUser - Usuario devuelto por la API
 * @returns Usuario en formato del frontend
 */
function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: String(apiUser.id),
    name: apiUser.full_name,
    email: apiUser.email,
    username: apiUser.username,
    password: "", // La API no devuelve contraseñas por seguridad
    role: apiUser.role === "Administrador" ? "admin" : "user",
    status: apiUser.active ? "active" : "inactive",
    joinDate: apiUser.created_at || new Date().toISOString(),
  }
}

/**
 * Convierte el rol del frontend al formato de la API.
 * @param role - Rol en formato frontend ('admin' | 'user')
 * @returns Rol en formato API ('Administrador' | 'Usuario')
 */
function mapRoleToApi(role: "admin" | "user"): "Administrador" | "Usuario" {
  return role === "admin" ? "Administrador" : "Usuario"
}

/**
 * Página de gestión de usuarios del sistema.
 * Permite crear, editar, eliminar y buscar usuarios.
 * Se conecta a la API de Laravel para persistir los datos.
 */
export default function UsersPage() {
  // ============================================================================
  // Estado principal y hooks
  // ============================================================================
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Estado de datos
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Estado de UI
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [activeRoleTab, setActiveRoleTab] = useState<"user" | "admin" | "pending">("user")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [activatingUserId, setActivatingUserId] = useState<string | null>(null)

  // Formularios
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "user" as User["role"],
    status: "active" as User["status"],
  })
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "user" as User["role"],
    status: "active" as User["status"],
  })

  // ============================================================================
  // Funciones de carga de datos
  // ============================================================================

  /**
   * Carga la lista de usuarios desde la API.
   * Convierte los datos de la API al formato del frontend.
   */
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetchUsers()
      // La API devuelve una respuesta paginada, extraemos los datos
      const apiUsers = response.data
      const mappedUsers = apiUsers.map(mapApiUserToUser)
      setUsers(mappedUsers)
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios. Verifica tu conexión.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // ============================================================================
  // Datos calculados y filtrados
  // ============================================================================

  /**
   * Usuarios filtrados por rol activo y término de búsqueda.
   */
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        // Pestaña "pending" muestra usuarios inactivos de cualquier rol
        if (activeRoleTab === "pending") {
          return user.status === "inactive"
        }
        // Otras pestañas muestran solo usuarios activos del rol correspondiente
        return user.role === activeRoleTab && user.status === "active"
      })
      .filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [users, activeRoleTab, searchTerm])

  // Estadísticas calculadas
  const totalUsers = users.length
  const adminCount = users.filter((u) => u.role === "admin" && u.status === "active").length
  const userCount = users.filter((u) => u.role === "user" && u.status === "active").length
  const pendingCount = users.filter((u) => u.status === "inactive").length
  const activeCount = users.filter((u) => u.status === "active").length

  /**
   * Datos para el gráfico de registros mensuales.
   * Muestra los últimos 6 meses con cantidad de usuarios registrados.
   */
  const monthlyRegistrations = useMemo(() => {
    const now = new Date()
    const data = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = monthDate.toLocaleString("es-ES", { month: "short" })
      const total = users.filter((user) => {
        const join = new Date(user.joinDate)
        return join.getFullYear() === monthDate.getFullYear() && join.getMonth() === monthDate.getMonth()
      }).length
      data.push({
        month: label.charAt(0).toUpperCase() + label.slice(1),
        usuarios: total,
      })
    }
    return data
  }, [users])

  // ============================================================================
  // Handlers de formularios
  // ============================================================================

  /**
   * Resetea el formulario de creación a sus valores iniciales.
   */
  const resetForm = () => {
    setNewUserForm({ name: "", email: "", username: "", password: "", role: "user", status: "active" })
    setFormError("")
  }

  /**
   * Crea un nuevo usuario llamando a la API.
   * Valida campos obligatorios antes de enviar.
   */
  const handleCreateUser = async () => {
    // Validación del frontend
    if (!newUserForm.name.trim() || !newUserForm.email.trim() || !newUserForm.password.trim() || !newUserForm.username.trim()) {
      setFormError("Nombre, nombre de usuario, correo y contraseña son obligatorios.")
      return
    }

    setIsSaving(true)
    setFormError("")

    try {
      await createUser({
        full_name: newUserForm.name.trim(),
        email: newUserForm.email.trim(),
        username: newUserForm.username.trim(),
        password: newUserForm.password.trim(),
        role: mapRoleToApi(newUserForm.role),
        active: newUserForm.status === "active",
      })

      toast({
        title: "Usuario creado",
        description: `${newUserForm.name} ha sido registrado exitosamente.`,
      })

      setIsCreateOpen(false)
      resetForm()

      // Recargar lista de usuarios
      startTransition(() => {
        loadUsers()
      })
    } catch (error) {
      console.error("Error al crear usuario:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al crear el usuario."
      setFormError(errorMessage)
      toast({
        title: "Error al crear usuario",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Abre el diálogo de edición con los datos del usuario seleccionado.
   * @param user - Usuario a editar
   */
  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id)
    setEditUserForm({
      name: user.name,
      email: user.email,
      username: user.username,
      password: "", // No pre-llenar contraseña por seguridad
      role: user.role,
      status: user.status,
    })
    setFormError("")
    setIsEditOpen(true)
  }

  /**
   * Actualiza un usuario existente llamando a la API.
   * La contraseña es opcional en actualizaciones.
   */
  const handleUpdateUser = async () => {
    if (!editUserForm.name.trim() || !editUserForm.email.trim() || !editUserForm.username.trim()) {
      setFormError("Nombre, nombre de usuario y correo son obligatorios.")
      return
    }

    if (!editingUserId) return

    setIsSaving(true)
    setFormError("")

    try {
      const updateData: Parameters<typeof updateUser>[1] = {
        full_name: editUserForm.name.trim(),
        email: editUserForm.email.trim(),
        username: editUserForm.username.trim(),
        role: mapRoleToApi(editUserForm.role),
        active: editUserForm.status === "active",
      }

      // Solo incluir contraseña si se proporcionó una nueva
      if (editUserForm.password.trim()) {
        updateData.password = editUserForm.password.trim()
      }

      await updateUser(Number(editingUserId), updateData)

      toast({
        title: "Usuario actualizado",
        description: `Los datos de ${editUserForm.name} han sido actualizados.`,
      })

      setIsEditOpen(false)
      setEditingUserId(null)

      // Recargar lista de usuarios
      startTransition(() => {
        loadUsers()
      })
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al actualizar el usuario."
      setFormError(errorMessage)
      toast({
        title: "Error al actualizar usuario",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Elimina un usuario de la base de datos.
   * Requiere confirmación previa del usuario.
   */
  const handleConfirmDelete = async () => {
    if (!deleteUserId) return

    const userToDelete = users.find((u) => u.id === deleteUserId)
    setIsSaving(true)

    try {
      await deleteUser(Number(deleteUserId))

      toast({
        title: "Usuario eliminado",
        description: userToDelete ? `${userToDelete.name} ha sido eliminado del sistema.` : "Usuario eliminado.",
      })

      setDeleteUserId(null)

      // Recargar lista de usuarios
      startTransition(() => {
        loadUsers()
      })
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al eliminar el usuario."
      toast({
        title: "Error al eliminar usuario",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Activa un usuario pendiente.
   * Cambia el estado de inactive a active.
   */
  const handleActivateUser = async (userId: string) => {
    const userToActivate = users.find((u) => u.id === userId)
    if (!userToActivate) return

    setActivatingUserId(userId)

    try {
      await toggleUserActive(Number(userId))

      toast({
        title: "Usuario activado",
        description: `${userToActivate.name} ahora puede iniciar sesión en el sistema.`,
      })

      // Recargar lista de usuarios
      startTransition(() => {
        loadUsers()
      })
    } catch (error) {
      console.error("Error al activar usuario:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al activar el usuario."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setActivatingUserId(null)
    }
  }

  // ============================================================================
  // Renderizado del componente
  // ============================================================================

  // Estado de carga inicial
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Hero - Cabecera con título y botón de acción */}
      <div className="space-y-4 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/10 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-400">Panel de usuarios</p>
            <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
            <p className="text-muted-foreground">Gestiona accesos, roles y actividad de tu organización</p>
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 px-6"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Stats - Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-blue-500/20 to-blue-500/5 backdrop-blur-xl p-5 shadow-lg shadow-blue-500/10">
          <p className="text-sm text-blue-200">Total de usuarios</p>
          <p className="text-4xl font-bold text-white mt-2">{totalUsers}</p>
          <p className="text-xs text-white/70 mt-1">Incluye roles administrativos y operativos</p>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-xl p-5 shadow-lg shadow-purple-500/10">
          <p className="text-sm text-purple-200">Administradores</p>
          <p className="text-4xl font-bold text-white mt-2">{adminCount}</p>
          <p className="text-xs text-white/70 mt-1">
            {totalUsers > 0 ? ((adminCount / totalUsers) * 100).toFixed(0) : 0}% de la base total
          </p>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 backdrop-blur-xl p-5 shadow-lg shadow-emerald-500/10">
          <p className="text-sm text-emerald-200">Usuarios activos</p>
          <p className="text-4xl font-bold text-white mt-2">{activeCount}</p>
          <p className="text-xs text-white/70 mt-1">Usuarios con sesiones habilitadas</p>
        </Card>
      </div>

      {/* Insights - Gráficos y métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico de registros mensuales */}
        <Card className="lg:col-span-2 border border-blue-500/10 bg-card/60 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Registro mensual</h3>
              <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRegistrations} barCategoryGap="20%">
                <XAxis dataKey="month" stroke="currentColor" className="text-xs text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.9)",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="usuarios" fill="url(#chartGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.9)" />
                    <stop offset="100%" stopColor="rgba(168,85,247,0.4)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribución de roles */}
        <Card className="border border-purple-500/10 bg-card/60 backdrop-blur-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Distribución de roles</h3>
          {[
            {
              label: "Administradores",
              value: adminCount,
              percentage: totalUsers > 0 ? (adminCount / totalUsers) * 100 : 0,
              color: "from-blue-500 to-blue-400",
            },
            {
              label: "Usuarios",
              value: totalUsers - adminCount,
              percentage: totalUsers > 0 ? ((totalUsers - adminCount) / totalUsers) * 100 : 0,
              color: "from-purple-500 to-purple-400",
            },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold text-foreground">{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Lista de usuarios */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Listado de usuarios</h2>
            <p className="text-sm text-muted-foreground">
              Visualiza perfiles por tipo de rol y busca por nombre o correo
            </p>
          </div>

          {/* Tabs de filtro por rol */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-primary/20 bg-slate-100 dark:bg-secondary/40 p-1 shadow-inner">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 rounded-lg px-4 ${activeRoleTab === "user" ? "bg-primary/15 text-primary" : "text-muted-foreground"
                }`}
              onClick={() => setActiveRoleTab("user")}
            >
              <Users className="w-4 h-4" />
              Usuarios
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 rounded-lg px-4 ${activeRoleTab === "admin" ? "bg-primary/15 text-primary" : "text-muted-foreground"
                }`}
              onClick={() => setActiveRoleTab("admin")}
            >
              <Shield className="w-4 h-4" />
              Administradores
            </Button>
            {pendingCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 rounded-lg px-4 ${activeRoleTab === "pending" ? "bg-amber-500/15 text-amber-400" : "text-muted-foreground"
                  }`}
                onClick={() => setActiveRoleTab("pending")}
              >
                <Clock className="w-4 h-4" />
                Pendientes
                <Badge variant="secondary" className="ml-1 bg-amber-500/20 text-amber-400 text-xs px-1.5">
                  {pendingCount}
                </Badge>
              </Button>
            )}
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre, usuario o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-blue-500/30 text-sm h-11 rounded-xl"
          />
        </div>

        {/* Grid de tarjetas de usuario */}
        <div className="grid gap-4">
          {isPending && (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
            </div>
          )}

          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card
                key={user.id}
                data-user-card
                className="border border-slate-200 dark:border-blue-500/20 bg-white dark:bg-slate-950/60 backdrop-blur-2xl overflow-hidden hover:border-blue-400/40 transition-all duration-300 group shadow-sm dark:shadow-none"
              >
                <div className="p-5 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-3">
                      {/* Avatar del usuario */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                        <span className="text-lg font-bold text-white">{user.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">@{user.username} · {user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Badges y metadatos */}
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className={
                        user.role === "admin"
                          ? "bg-blue-500/20 text-blue-200 border-blue-500/30"
                          : "bg-purple-500/20 text-purple-200 border-purple-500/30"
                      }
                    >
                      {user.role === "admin" ? "Administrador" : "Usuario"}
                    </Badge>

                    <Badge
                      variant="outline"
                      className={
                        user.status === "active"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : "bg-red-500/10 text-red-300 border-red-500/30"
                      }
                    >
                      {user.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>

                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Alta {new Date(user.joinDate).toLocaleDateString("es-ES")}
                    </span>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    {activeRoleTab === "pending" ? (
                      /* Botón de activar para usuarios pendientes */
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 bg-transparent"
                        onClick={() => handleActivateUser(user.id)}
                        disabled={activatingUserId === user.id}
                      >
                        {activatingUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                    ) : (
                      /* Botón de editar para usuarios activos */
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500/30 hover:bg-blue-500/10 bg-transparent"
                        onClick={() => handleOpenEdit(user)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 bg-transparent"
                      onClick={() => setDeleteUserId(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="border border-slate-700/50 bg-slate-950/40 p-12 text-center">
              <p className="text-muted-foreground">
                {activeRoleTab === "admin"
                  ? "No hay administradores que coincidan con la búsqueda."
                  : activeRoleTab === "pending"
                    ? "No hay usuarios pendientes de activación."
                    : "No hay usuarios que coincidan con la búsqueda."}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Diálogo de creación de usuario */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false)
            resetForm()
          } else {
            setIsCreateOpen(true)
          }
        }}
      >
        <DialogContent className="bg-card/90 backdrop-blur-xl border border-blue-500/20">
          <DialogHeader>
            <DialogTitle>Registrar nuevo usuario</DialogTitle>
            <DialogDescription>Completa la información básica para otorgar acceso a la plataforma.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Ej: Laura Mendoza"
                value={newUserForm.name}
                onChange={(e) => setNewUserForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                placeholder="Ej: laura.mendoza"
                value={newUserForm.username}
                onChange={(e) => setNewUserForm((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@empresa.com"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Rol</Label>
                <select
                  id="role"
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, role: e.target.value as User["role"] }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border text-sm"
                >
                  <option value="admin">Administrador</option>
                  <option value="user">Usuario</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  value={newUserForm.status}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, status: e.target.value as User["status"] }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border text-sm"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres con mayúsculas, números y símbolos"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
            {formError && <p className="text-sm text-red-400">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar usuario"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición de usuario */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditOpen(false)
            setEditingUserId(null)
            setFormError("")
          } else {
            setIsEditOpen(true)
          }
        }}
      >
        <DialogContent className="bg-card/90 backdrop-blur-xl border border-blue-500/20">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Actualiza los datos del usuario seleccionado. La contraseña es opcional.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre completo</Label>
              <Input
                id="edit-name"
                value={editUserForm.name}
                onChange={(e) => setEditUserForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-username">Nombre de usuario</Label>
              <Input
                id="edit-username"
                value={editUserForm.username}
                onChange={(e) => setEditUserForm((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Correo</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role">Rol</Label>
                <select
                  id="edit-role"
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm((prev) => ({ ...prev, role: e.target.value as User["role"] }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border text-sm"
                >
                  <option value="admin">Administrador</option>
                  <option value="user">Usuario</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-status">Estado</Label>
                <select
                  id="edit-status"
                  value={editUserForm.status}
                  onChange={(e) => setEditUserForm((prev) => ({ ...prev, status: e.target.value as User["status"] }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border text-sm"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-password">Nueva contraseña (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Dejar vacío para mantener la actual"
                value={editUserForm.password}
                onChange={(e) => setEditUserForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
            {formError && <p className="text-sm text-red-400">{formError}</p>}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false)
                setEditingUserId(null)
                setFormError("")
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateUser}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={Boolean(deleteUserId)} onOpenChange={(open) => (!open ? setDeleteUserId(null) : null)}>
        <DialogContent className="bg-card/90 backdrop-blur-xl border border-red-500/20">
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer. ¿Deseas continuar?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserId(null)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-500"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
