import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LightEffectsProvider } from "@/components/providers/light-effects-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ERP Sistema - Gestión de Servicios",
  description: "Sistema empresarial integrado para gestión de catálogo de servicios",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="erp-theme-v2"
          disableTransitionOnChange
        >
          <LightEffectsProvider>
            <AuthProvider>{children}</AuthProvider>
          </LightEffectsProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
