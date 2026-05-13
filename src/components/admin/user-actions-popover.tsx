"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { setUserPasswordAction, setUserRoleAction } from "@/lib/actions/admin"

type UserActionsPopoverProps = {
  userId: string
  defaultRole: "admin" | "user"
  allowRoleChange?: boolean
}

export function UserActionsPopover({ userId, defaultRole, allowRoleChange = true }: UserActionsPopoverProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  const computePos = useMemo(() => {
    return () => {
      const btn = buttonRef.current
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      const width = 320
      const gap = 12
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      let left = rect.right - width
      left = Math.max(16, Math.min(left, viewportW - width - 16))

      const estimatedHeight = 220
      let top = rect.bottom + gap
      if (top + estimatedHeight > viewportH - 16) {
        top = Math.max(16, rect.top - gap - estimatedHeight)
      }

      setPos({ top, left })
    }
  }, [])

  useEffect(() => {
    if (!open) return
    computePos()

    const onScroll = () => computePos()
    const onResize = () => computePos()

    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onResize)
    }
  }, [open, computePos])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (buttonRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown, { passive: true })
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="User actions"
      className="fixed w-80 max-w-[calc(100vw-2rem)] border-4 border-foreground bg-white shadow-[10px_10px_0_0_rgba(0,0,0,1)] rounded-xl p-4 z-[60]"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Actions
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-8 w-8 border-2 border-foreground bg-white font-black rounded-xl hover:bg-primary/5 transition-colors"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {allowRoleChange ? (
        <>
          <div className="space-y-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Ubah Role
            </div>
            <div className="flex gap-2">
              <form action={setUserRoleAction} className="flex-1">
                <input type="hidden" name="userId" value={userId} />
                <input type="hidden" name="role" value="user" />
                <button
                  type="submit"
                  className={[
                    "w-full h-10 border-2 border-foreground font-black uppercase text-xs rounded-xl transition-colors",
                    defaultRole === "user" ? "bg-primary/10" : "bg-white hover:bg-primary/5",
                  ].join(" ")}
                >
                  Jadikan User
                </button>
              </form>
              <form action={setUserRoleAction} className="flex-1">
                <input type="hidden" name="userId" value={userId} />
                <input type="hidden" name="role" value="admin" />
                <button
                  type="submit"
                  className={[
                    "w-full h-10 border-2 border-foreground font-black uppercase text-xs rounded-xl transition-colors",
                    defaultRole === "admin"
                      ? "bg-primary text-white"
                      : "bg-white hover:bg-primary hover:text-white",
                  ].join(" ")}
                >
                  Jadikan Admin
                </button>
              </form>
            </div>
          </div>

          <div className="h-px bg-foreground/10 my-4" />
        </>
      ) : null}

      <details>
        <summary className="list-none cursor-pointer">
          <span className="inline-flex w-full h-10 items-center justify-center border-2 border-foreground bg-foreground text-white font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl">
            Ubah Password
          </span>
        </summary>
        <form action={setUserPasswordAction} className="mt-3 space-y-2">
          <input type="hidden" name="userId" value={userId} />
          <input
            name="password"
            type="password"
            minLength={8}
            placeholder="Password baru (min 8)"
            className="w-full h-10 px-3 border-2 border-foreground font-bold bg-white rounded-xl"
            required
          />
          <button
            type="submit"
            className="w-full h-10 border-2 border-foreground bg-primary text-white font-black uppercase text-xs hover:bg-primary/90 transition-colors rounded-xl"
          >
            Simpan Password
          </button>
        </form>
      </details>
    </div>
  )

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center justify-center border-2 border-foreground bg-white px-4 font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Actions
      </button>
      {mounted && open ? createPortal(panel, document.body) : null}
    </>
  )
}
