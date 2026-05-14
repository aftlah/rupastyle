"use client"

import { useEffect, useMemo } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const TRACK_THROTTLE_MS = 3000

export default function Histats() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!pathname) return

    let cancelled = false

    const track = async () => {
      const query = searchParams?.toString()
      const fullPath = query ? `${pathname}?${query}` : pathname
      const dedupeKey = `${pathname}|${query ?? ""}`
      const storageKey = "rs-analytics-last-track"

      try {
        const lastTrackedRaw = window.sessionStorage.getItem(storageKey)
        if (lastTrackedRaw) {
          const lastTracked = JSON.parse(lastTrackedRaw) as { key?: string; at?: number }
          if (
            lastTracked.key === dedupeKey &&
            typeof lastTracked.at === "number" &&
            Date.now() - lastTracked.at < TRACK_THROTTLE_MS
          ) {
            return
          }
        }

        window.sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            key: dedupeKey,
            at: Date.now(),
          })
        )
      } catch {
        // Ignore storage errors and continue tracking.
        
      }

      let userId: string | null = null
      let userEmail: string | null = null
      let userName: string | null = null

      try {
        const { data } = await supabase.auth.getUser()
        const user = data.user ?? null
        if (user) {
          userId = user.id
          userEmail = user.email ?? null
          userName =
            typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
              ? user.user_metadata.full_name.trim()
              : (user.email?.split("@")[0] ?? null)
        }
      } catch {
        // Anonymous visitors are still valid for tracking.
      }

      if (cancelled) return

      void fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: pathname,
          fullPath,
          referrer:
            typeof document.referrer === "string" && document.referrer.trim()
              ? document.referrer
              : null,
          userId,
          userEmail,
          userName,
        }),
        keepalive: true,
      }).catch(() => {
        // Visitor tracking should never block the UI.
      })
    }

    void track()

    return () => {
      cancelled = true
    }
  }, [pathname, searchParams, supabase])

  return null
}
