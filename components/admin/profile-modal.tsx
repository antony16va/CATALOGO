"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { X, Mail, Shield, Calendar, User as UserIcon, Pencil, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AuthUser } from "@/contexts/auth-context"
import { updateUsername } from "@/lib/api/auth"
import { useAuth } from "@/contexts/auth-context"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: AuthUser | null
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { refreshUser } = useAuth()

  // Estado para edición del username
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [usernameValue, setUsernameValue] = useState(user?.username ?? "")
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isSavingUsername, setIsSavingUsername] = useState(false)

  // Actualizar el valor cuando cambia el usuario
  useEffect(() => {
    setUsernameValue(user?.username ?? "")
    setIsEditingUsername(false)
    setUsernameError(null)
  }, [user?.username, isOpen])

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (!user?.fullName) return "?"
    const names = user.fullName.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0].substring(0, 2).toUpperCase()
  }

  // Formatear username: minúsculas, espacios por puntos, sin caracteres especiales
  const formatUsername = (value: string): string => {
    return value
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/\s+/g, ".") // Espacios por puntos
      .replace(/[^a-z0-9._-]/g, "") // Solo letras, números, puntos, guiones y guiones bajos
  }

  // Manejar cambio en el input
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUsername(e.target.value)
    setUsernameValue(formatted)
    setUsernameError(null)
  }

  // Verificar si el username ha cambiado
  const hasUsernameChanged = usernameValue !== user?.username

  // Guardar el username
  const handleSaveUsername = async () => {
    if (!hasUsernameChanged || isSavingUsername) return

    if (usernameValue.length < 3) {
      setUsernameError("El usuario debe tener al menos 3 caracteres")
      return
    }

    setIsSavingUsername(true)
    setUsernameError(null)

    try {
      await updateUsername(usernameValue)
      await refreshUser()
      setIsEditingUsername(false)
    } catch (error) {
      setUsernameError(error instanceof Error ? error.message : "Error al guardar")
    } finally {
      setIsSavingUsername(false)
    }
  }

  // Cancelar edición
  const handleCancelEdit = () => {
    setUsernameValue(user?.username ?? "")
    setIsEditingUsername(false)
    setUsernameError(null)
  }

  useEffect(() => {
    if (isOpen) {
      const backdrop = modalRef.current?.querySelector("[data-backdrop]")
      const content = contentRef.current

      gsap.set([backdrop, content], { opacity: 0 })

      gsap.to(backdrop, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      })

      gsap.to(content, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "back.out",
        delay: 0.1,
      })

      // Animate profile info items
      const infoItems = content?.querySelectorAll("[data-info-item]")
      gsap.fromTo(
        infoItems,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.08, delay: 0.2, ease: "power2.out" },
      )
    }
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current?.querySelector("[data-backdrop]")) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center">
      <div data-backdrop className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleBackdropClick} />

      <div
        ref={contentRef}
        className="relative z-10 w-full max-w-md mx-4 bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
        style={{ transform: "translateY(20px)" }}
      >
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-r from-primary/20 to-accent/20 border-b border-border/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-primary/10 rounded-lg transition-colors z-10"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Avatar and Basic Info */}
        <div className="px-6 pt-4 pb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary-foreground">{getUserInitials()}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{user?.fullName ?? "Sin nombre"}</h3>
              <p className="text-sm text-muted-foreground">{user?.role ?? "Sin rol"}</p>
            </div>
          </div>

          {/* Info Items */}
          <div className="space-y-4">
            {/* Email */}
            <div
              data-info-item
              className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg border border-border/30 hover:border-primary/20 transition-colors"
            >
              <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Correo</p>
                <p className="text-sm font-medium text-foreground truncate">{user?.email ?? "Sin correo"}</p>
              </div>
            </div>

            {/* Username - Editable */}
            <div
              data-info-item
              className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg border border-border/30 hover:border-primary/20 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Usuario</p>
                {isEditingUsername ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={usernameValue}
                      onChange={handleUsernameChange}
                      className="h-8 text-sm bg-background/50"
                      placeholder="nombre.usuario"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveUsername()
                        if (e.key === "Escape") handleCancelEdit()
                      }}
                    />
                    {hasUsernameChanged && (
                      <button
                        onClick={handleSaveUsername}
                        disabled={isSavingUsername}
                        className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
                        title="Guardar"
                      >
                        {isSavingUsername ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={handleCancelEdit}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{user?.username ?? "Sin usuario"}</p>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      title="Editar usuario"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {usernameError && (
                  <p className="text-xs text-destructive mt-1">{usernameError}</p>
                )}
              </div>
            </div>

            {/* Role */}
            <div
              data-info-item
              className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg border border-border/30 hover:border-primary/20 transition-colors"
            >
              <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Rol</p>
                <p className="text-sm font-medium text-foreground">
                  {user?.isAdmin ? "Administrador del Sistema" : "Usuario"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div
              data-info-item
              className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg border border-border/30 hover:border-primary/20 transition-colors"
            >
              <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Estado</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${user?.active ? "bg-green-500" : "bg-red-500"}`} />
                  <p className="text-sm font-medium text-foreground">
                    {user?.active ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1 bg-transparent">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
