import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const VISITOR_COOKIE = "rs_visitor_id"
const BOT_PATTERN =
  /bot|spider|crawl|preview|facebookexternalhit|whatsapp|slurp|bingpreview|headless/i

type TrackPayload = {
  path?: string
  fullPath?: string
  referrer?: string | null
  userId?: string | null
  userEmail?: string | null
  userName?: string | null
}

function sanitizePath(value: unknown) {
  if (typeof value !== "string") return "/"
  const trimmed = value.trim()
  if (!trimmed.startsWith("/")) return "/"
  return trimmed.slice(0, 512) || "/"
}

function sanitizeReferrer(value: unknown) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, 1024) : null
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, maxLength) : null
}

function extractMissingColumn(message: string) {
  const match = message.match(/Could not find the '([^']+)' column/i)
  return match?.[1] ?? null
}

async function insertTrackingRow(payload: Record<string, unknown>) {
  const supabase = createAdminClient()
  const nextPayload = { ...payload }

  while (true) {
    const { error } = await supabase.from("site_page_views").insert(nextPayload)
    if (!error) return { error: null }

    const missingColumn =
      error.code === "PGRST204" ? extractMissingColumn(error.message) : null

    if (missingColumn && missingColumn in nextPayload) {
      delete nextPayload[missingColumn]
      continue
    }

    return { error }
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TrackPayload
    const userAgent = request.headers.get("user-agent") ?? ""

    if (BOT_PATTERN.test(userAgent)) {
      return NextResponse.json({ ok: true, skipped: "bot" })
    }

    const path = sanitizePath(payload.path)
    const fullPath = sanitizePath(payload.fullPath ?? payload.path)
    const referrer = sanitizeReferrer(payload.referrer)
    const userId = sanitizeText(payload.userId, 64)
    const userEmail = sanitizeText(payload.userEmail, 320)
    const userName = sanitizeText(payload.userName, 200)

    const cookieHeader = request.headers.get("cookie") ?? ""
    const existingVisitorId = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${VISITOR_COOKIE}=`))
      ?.split("=")[1]

    const visitorId = existingVisitorId || crypto.randomUUID()

    const { error } = await insertTrackingRow({
      visitor_id: visitorId,
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      path,
      full_path: fullPath,
      referrer,
      user_agent: userAgent.slice(0, 512) || null,
      visited_at: new Date().toISOString(),
    })

    if (error) {
      const knownSetupError =
        error.code === "PGRST205" ||
        error.code === "42P01" ||
        error.message.toLowerCase().includes("site_page_views")

      if (knownSetupError) {
        console.error("Analytics track setup error:", error.message)
        return NextResponse.json({ ok: false, setupRequired: true }, { status: 202 })
      }

      console.error("Analytics track error:", error)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    const response = NextResponse.json({ ok: true })
    if (!existingVisitorId) {
      response.cookies.set({
        name: VISITOR_COOKIE,
        value: visitorId,
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    return response
  } catch (error) {
    console.error("Analytics request error:", error)
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
