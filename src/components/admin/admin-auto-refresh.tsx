"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminAutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh()
      }
    }, intervalMs)

    return () => {
      window.clearInterval(id)
    }
  }, [intervalMs, router])

  return null
}
