"use client"

import type React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/50 backdrop-blur-xl bg-card/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">⚙️</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground">ERP Sistema</h1>
              <p className="text-xs text-muted-foreground">Catálogo de Servicios</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/panel">
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 text-foreground hover:bg-secondary/50 bg-transparent"
              >
                Panel Admin
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-border/50 bg-gradient-to-b from-transparent to-secondary/20 mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Sobre Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Servicios</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/servicios" className="hover:text-foreground transition">
                    Catálogo
                  </Link>
                </li>
                <li>
                  <Link href="/servicios?category=Tecnología" className="hover:text-foreground transition">
                    Tecnología
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Soporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: soporte@ejemplo.com</li>
                <li>Teléfono: +1 234 567 8900</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 ERP Sistema. Todos los derechos reservados.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
