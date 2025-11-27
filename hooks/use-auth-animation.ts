"use client"

import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react"
import gsap from "gsap"

type LightEffectMode = "spotlight" | "aurora" | "highglow" | "off"
type LightEffectColor = "purple" | "cyan" | "pink" | "default" | "blue"

type SetEffectFn = (effect: { mode: LightEffectMode; intensity: number; color: LightEffectColor }) => void

export interface AuthAnimationConfig {
  containerRef: RefObject<HTMLElement>
  cardRef: RefObject<HTMLElement>
  titleRef?: RefObject<HTMLElement>
  subtitleRef?: RefObject<HTMLElement>
  inputsRef?: RefObject<HTMLElement>
  buttonRef?: RefObject<HTMLButtonElement>
  floatingElementsRef?: RefObject<HTMLElement>
  setEffect?: SetEffectFn
  withTimeline?: (timeline: gsap.core.Timeline) => void
  enableParallax?: boolean
  lightEffect?: { mode: LightEffectMode; intensity: number; color: LightEffectColor }
  playEntrance?: boolean
}

const DEFAULT_LIGHT_EFFECT: { mode: LightEffectMode; intensity: number; color: LightEffectColor } = {
  mode: "aurora",
  intensity: 0.6,
  color: "blue",
}

export function useAuthAnimation({
  containerRef,
  cardRef,
  titleRef,
  subtitleRef,
  inputsRef,
  buttonRef,
  floatingElementsRef,
  setEffect,
  withTimeline,
  enableParallax = true,
  lightEffect = DEFAULT_LIGHT_EFFECT,
  playEntrance = true,
}: AuthAnimationConfig) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const originalTitle = useRef<string | null>(null)
  const previousEffect = useRef<{ mode: LightEffectMode; intensity: number; color: LightEffectColor } | null>(null)
  const effectSignature = useMemo(
    () => `${lightEffect.mode}-${lightEffect.intensity}-${lightEffect.color}`,
    [lightEffect.mode, lightEffect.intensity, lightEffect.color],
  )

  const clearButtonStyles = useCallback(() => {
    const buttonEl = buttonRef?.current
    if (!buttonEl) return
    gsap.set(buttonEl, { clearProps: "all" })
    buttonEl.querySelectorAll("*").forEach((child) => {
      ;(child as HTMLElement).removeAttribute("style")
    })
  }, [buttonRef])

  const killAnimations = useCallback(() => {
    timelineRef.current?.kill()
    timelineRef.current = null
    clearButtonStyles()
  }, [clearButtonStyles])

  useEffect(() => {
    if (!containerRef.current) return

    if (setEffect) {
      const prev = previousEffect.current
      if (
        !prev ||
        prev.mode !== lightEffect.mode ||
        prev.intensity !== lightEffect.intensity ||
        prev.color !== lightEffect.color
      ) {
        setEffect(lightEffect)
        previousEffect.current = { ...lightEffect }
      }
    }

    killAnimations()

    if (titleRef?.current) {
      if (originalTitle.current === null) {
        originalTitle.current = titleRef.current.textContent ?? ""
      } else {
        titleRef.current.innerHTML = originalTitle.current
      }
    }

    const ctx = gsap.context(() => {
      if (floatingElementsRef?.current) {
        const elements = floatingElementsRef.current.querySelectorAll<HTMLElement>(".float-element")
        elements.forEach((el, index) => {
          gsap.set(el, { opacity: 0.3 })
          gsap.to(el, {
            y: -30 + index * 10,
            x: Math.sin(index) * 20,
            duration: 4 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.2,
          })
        })
      }

      if (!playEntrance) {
        timelineRef.current = null
        return
      }

      const tl = gsap.timeline()
      timelineRef.current = tl

      tl.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      })

      tl.from(
        cardRef.current,
        {
          opacity: 0,
          scale: 0.95,
          filter: "blur(20px)",
          duration: 1,
          ease: "power2.out",
        },
        0.1,
      )

      if (titleRef?.current) {
        const baseTitle = originalTitle.current ?? titleRef.current.textContent ?? ""
        titleRef.current.innerHTML = baseTitle
          .split("")
          .map((char) => `<span class="inline-block" data-char>${char}</span>`)
          .join("")

        tl.from(
          titleRef.current.querySelectorAll("[data-char]"),
          {
            opacity: 0,
            y: 20,
            stagger: 0.05,
            duration: 0.6,
            ease: "back.out",
          },
          0.3,
        )
      }

      if (subtitleRef?.current) {
        tl.from(
          subtitleRef.current,
          {
            opacity: 0,
            y: 10,
            duration: 0.6,
            ease: "power2.out",
          },
          0.6,
        )
      }

      if (inputsRef?.current) {
        tl.from(
          inputsRef.current.querySelectorAll("div"),
          {
            opacity: 0,
            x: -30,
            stagger: 0.15,
            duration: 0.6,
            ease: "power3.out",
          },
          0.5,
        )
      }

      if (buttonRef?.current) {
        tl.from(
          buttonRef.current,
          {
            opacity: 0,
            scale: 0.8,
            filter: "blur(20px)",
            duration: 0.5,
            ease: "back.out",
            clearProps: "opacity,scale,filter,transform",
          },
          1.2,
        )
      }

      withTimeline?.(tl)
    }, containerRef)

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableParallax || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / 20
      const y = (e.clientY - rect.top - rect.height / 2) / 20

      gsap.to(cardRef.current, {
        x,
        y,
        duration: 0.5,
        ease: "power2.out",
      })
    }

    if (enableParallax) {
      window.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      if (enableParallax) {
        window.removeEventListener("mousemove", handleMouseMove)
      }
      killAnimations()
      ctx.revert()
      if (titleRef?.current && originalTitle.current !== null) {
        titleRef.current.textContent = originalTitle.current
      }
    }
  }, [
    cardRef,
    clearButtonStyles,
    containerRef,
    enableParallax,
    floatingElementsRef,
    inputsRef,
    killAnimations,
    effectSignature,
    setEffect,
    subtitleRef,
    titleRef,
    playEntrance,
    withTimeline,
  ])

  return killAnimations
}
