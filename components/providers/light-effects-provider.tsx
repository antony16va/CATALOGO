"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import gsap from "gsap"

interface LightEffect {
  mode: "spotlight" | "aurora" | "highglow" | "off"
  intensity: number
  color: "purple" | "cyan" | "pink" | "default"
}

interface LightEffectsContextType {
  effect: LightEffect
  setEffect: (effect: LightEffect) => void
  mousePosition: { x: number; y: number }
}

const LightEffectsContext = createContext<LightEffectsContextType | undefined>(undefined)

export function LightEffectsProvider({ children }: { children: React.ReactNode }) {
  const [effect, setEffect] = useState<LightEffect>({
    mode: "aurora",
    intensity: 0.6,
    color: "default",
  })

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const auroraRef1 = useRef<HTMLDivElement>(null)
  const auroraRef2 = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      // Aurora effect
      if (effect.mode === "aurora") {
        if (auroraRef1.current) {
          gsap.to(auroraRef1.current, {
            x: e.clientX - 192,
            y: e.clientY - 192,
            duration: 0.5,
            ease: "power2.out",
          })
        }
        if (auroraRef2.current) {
          gsap.to(auroraRef2.current, {
            x: e.clientX - 160,
            y: e.clientY + 100 - 160,
            duration: 0.6,
            ease: "power2.out",
          })
        }
      }

      // Spotlight effect
      if (effect.mode === "spotlight" && spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          x: e.clientX - 128,
          y: e.clientY - 128,
          duration: 0.4,
          ease: "power2.out",
        })
      }

      // High glow effect
      if (effect.mode === "highglow" && glowRef.current) {
        gsap.to(glowRef.current, {
          x: e.clientX - 160,
          y: e.clientY - 160,
          duration: 0.3,
          ease: "power2.out",
        })
      }
    },
    [effect.mode],
  )

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setEffect((prev) => ({ ...prev, mode: "off" }))
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  const getGradientColor = () => {
    switch (effect.color) {
      case "purple":
        return "from-purple-500 via-pink-500 to-purple-600"
      case "cyan":
        return "from-cyan-400 via-blue-500 to-purple-600"
      case "pink":
        return "from-pink-400 via-rose-500 to-pink-600"
      default:
        return "from-purple-500 via-pink-500 to-blue-600"
    }
  }

  return (
    <LightEffectsContext.Provider value={{ effect, setEffect, mousePosition }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {effect.mode !== "off" && (
          <>
            {/* Aurora effect */}
            {effect.mode === "aurora" && (
              <div className="absolute inset-0">
                <div
                  ref={auroraRef1}
                  className={`absolute w-96 h-96 bg-gradient-to-r ${getGradientColor()} rounded-full blur-3xl opacity-20`}
                  style={{ filter: `blur(${80 + effect.intensity * 40}px)` }}
                />
                <div
                  ref={auroraRef2}
                  className={`absolute w-80 h-80 bg-gradient-to-r ${getGradientColor()} rounded-full blur-2xl opacity-15`}
                  style={{ filter: `blur(${100 + effect.intensity * 50}px)` }}
                />
              </div>
            )}

            {/* Spotlight effect */}
            {effect.mode === "spotlight" && (
              <div
                ref={spotlightRef}
                className={`absolute w-64 h-64 bg-gradient-to-r ${getGradientColor()} rounded-full blur-2xl opacity-25`}
              />
            )}

            {/* High glow effect */}
            {effect.mode === "highglow" && (
              <div
                ref={glowRef}
                className={`absolute w-80 h-80 bg-gradient-radial bg-gradient-to-r ${getGradientColor()} rounded-full opacity-40`}
                style={{
                  filter: `blur(${40 + effect.intensity * 30}px)`,
                  boxShadow: `0 0 ${80 + effect.intensity * 100}px rgba(168, 85, 247, ${effect.intensity})`,
                }}
              />
            )}
          </>
        )}
      </div>

      {children}
    </LightEffectsContext.Provider>
  )
}

export function useLightEffects() {
  const context = useContext(LightEffectsContext)
  if (!context) {
    throw new Error("useLightEffects must be used within LightEffectsProvider")
  }
  return context
}
