'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LayoutGrid, LogOut } from 'lucide-react'

type UserAvatarDropdownProps = {
  name: string
  email: string
  isAdmin: boolean
  logoutAction: () => Promise<void>
}

export function UserAvatarDropdown({ name, email, isAdmin, logoutAction }: UserAvatarDropdownProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>([])

  const initial = useMemo(() => {
    const trimmed = name.trim()
    if (!trimmed) return 'U'
    return trimmed.slice(0, 1).toUpperCase()
  }, [name])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (buttonRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
      if (event.key === 'Tab') {
        const target = event.target as Node | null
        if (!target) return
        if (panelRef.current?.contains(target)) return
        if (buttonRef.current?.contains(target)) return
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown, { passive: true })
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const first = itemRefs.current.find(Boolean)
    if (!first) return
    const id = window.setTimeout(() => first?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [open])

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen((v) => !v)
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
    }
  }

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') {
      return
    }

    const focusables = itemRefs.current.filter(Boolean) as Array<HTMLAnchorElement | HTMLButtonElement>
    if (focusables.length === 0) return

    const activeIndex = focusables.findIndex((el) => el === document.activeElement)
    const lastIndex = focusables.length - 1

    const focusAt = (index: number) => {
      const clamped = Math.max(0, Math.min(lastIndex, index))
      focusables[clamped]?.focus()
    }

    event.preventDefault()

    if (event.key === 'Home') return focusAt(0)
    if (event.key === 'End') return focusAt(lastIndex)
    if (event.key === 'ArrowDown') return focusAt(activeIndex < 0 ? 0 : activeIndex + 1)
    if (event.key === 'ArrowUp') return focusAt(activeIndex < 0 ? lastIndex : activeIndex - 1)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        className="group relative"
      >
        <span className="relative block rounded-full bg-gradient-to-r from-purple-600 to-pink-500 p-[2px] transition-transform duration-200 group-hover:scale-[1.04] group-active:scale-[0.98]">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground border-4 border-foreground font-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
            {initial}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-foreground" />
          </span>
        </span>
        <span className="sr-only">Open user menu</span>
      </button>

      <div
        ref={panelRef}
        role="menu"
        aria-hidden={!open}
        onKeyDown={handleMenuKeyDown}
        className={[
          'absolute right-0 mt-4 w-80 origin-top-right',
          'rounded-xl border-4 border-foreground bg-background',
          'shadow-[10px_10px_0_0_rgba(0,0,0,1)]',
          'transition-all duration-200',
          open ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-2',
        ].join(' ')}
      >
        <div className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="relative rounded-full bg-gradient-to-r from-purple-600 to-pink-500 p-[2px]">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground border-4 border-foreground font-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                {initial}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-foreground" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-black uppercase tracking-tight truncate text-base">{name || 'User'}</p>
              <p className="text-xs font-bold text-muted-foreground truncate mt-1">{email}</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-foreground/10" />

        <div className="p-3">
          {isAdmin ? (
            <Link
              href="/admin"
              role="menuitem"
              ref={(el) => {
                itemRefs.current[0] = el
              }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-black uppercase text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              <LayoutGrid className="h-5 w-5" />
              Admin Dashboard
            </Link>
          ) : null}

          <form action={logoutAction} className={isAdmin ? 'mt-1' : undefined}>
            <button
              type="submit"
              role="menuitem"
              ref={(el) => {
                itemRefs.current[isAdmin ? 1 : 0] = el
              }}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 font-black uppercase text-sm text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
