"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Shield,
  X,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { ProfileModal } from "./profile-modal"
import { useAuth } from "@/contexts/auth-context"

const ThemeToggle = dynamic(() => import("@/components/theme-toggle").then((mod) => mod.ThemeToggle), {
  ssr: false,
  loading: () => <div className="h-9 w-9 rounded-lg" aria-hidden="true" />,
})

export function AdminHeader() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  // Estado para evitar errores de hidratación con IDs de Radix
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const handleAnimateDropdown = (ref: React.RefObject<HTMLDivElement>) => {
      if (ref.current) {
        const menuContent = ref.current.querySelector('[role="menu"]')
        if (menuContent && menuContent.style.display !== "none") {
          gsap.fromTo(
            menuContent,
            { opacity: 0, y: -10, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out" },
          )

          const items = menuContent.querySelectorAll('[role="menuitem"]')
          gsap.fromTo(
            items,
            { opacity: 0, x: -5 },
            { opacity: 1, x: 0, duration: 0.2, stagger: 0.05, ease: "power2.out" },
          )
        }
      }
    }

    const observer = new MutationObserver(() => {
      handleAnimateDropdown(dropdownRef)
      handleAnimateDropdown(notificationsRef)
    })

    if (dropdownRef.current) {
      observer.observe(dropdownRef.current, { attributes: true, subtree: true })
    }
    if (notificationsRef.current) {
      observer.observe(notificationsRef.current, { attributes: true, subtree: true })
    }

    return () => observer.disconnect()
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (!user?.fullName) return "?"
    const names = user.fullName.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0].substring(0, 2).toUpperCase()
  }

  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Servicio completado",
      description: "El servicio #1234 fue marcado como completado",
      time: "Hace 5 min",
    },
    {
      id: 2,
      type: "warning",
      title: "SLA próximo a vencer",
      description: "Servicio #5678 vence en 2 horas",
      time: "Hace 15 min",
    },
    {
      id: 3,
      type: "info",
      title: "Nuevo usuario registrado",
      description: "Se registró un nuevo usuario en el sistema",
      time: "Hace 1 hora",
    },
    {
      id: 4,
      type: "warning",
      title: "Cambio de estado",
      description: "Servicio #9012 cambió a estado En progreso",
      time: "Hace 2 horas",
    },
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <Bell className="w-4 h-4 text-primary" />
    }
  }

  return (
    <>
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} user={user} />

      <header className="border-b border-border bg-card/30 backdrop-blur-xl sticky top-0 z-30 h-16">
        <div className="flex items-center justify-between h-full px-6 gap-4">
          {/* Search */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-lg">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="Buscar servicios, clientes..."
              className="bg-secondary/50 border-border/50 placeholder:text-muted-foreground text-sm h-9 focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            <ThemeToggle />
            {/* Solo renderizar DropdownMenus después del montaje para evitar errores de hidratación */}
            {isMounted ? (
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors relative group">
                    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex">
                      <Bell className="w-4 h-4" />
                    </motion.span>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 bg-card/95 backdrop-blur-lg border border-primary/20 rounded-xl shadow-xl p-0"
                  ref={notificationsRef}
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Notificaciones</p>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      {notifications.length}
                    </span>
                  </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 border-b border-border/30 hover:bg-primary/5 transition-colors cursor-pointer group"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                          <p className="text-xs text-muted-foreground/60 mt-1.5">{notification.time}</p>
                        </div>
                        <button className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded">
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border/50 text-center">
                  <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                    Ver todas las notificaciones
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            ) : (
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors relative group">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </button>
            )}

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
            >
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex">
                <Settings className="w-4 h-4" />
              </motion.span>
            </Button>

            {/* User menu */}
            {isMounted ? (
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-3 pr-2 py-1.5 hover:bg-primary/10 rounded-lg transition-colors">
                  <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center shrink-0 text-xs font-bold text-primary-foreground">
                      {getUserInitials()}
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-card/95 backdrop-blur-lg border border-primary/20 rounded-xl shadow-xl"
                ref={dropdownRef}
              >
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Cuenta</p>
                  <p className="text-sm font-medium truncate text-foreground">{user?.email ?? "Sin email"}</p>
                </div>

                {/* Menu Items */}
                <DropdownMenuItem
                  onClick={() => setProfileOpen(true)}
                  className="cursor-pointer hover:bg-primary/10 rounded-md mx-2 my-1"
                >
                  <Shield className="w-4 h-4 mr-2 text-primary" />
                  <span>Perfil</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2 bg-border/50" />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive rounded-md mx-2 my-1"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Salir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            ) : (
              <button className="flex items-center gap-2 pl-3 pr-2 py-1.5 hover:bg-primary/10 rounded-lg transition-colors">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  )
}


