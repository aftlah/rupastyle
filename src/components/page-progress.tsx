'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // When the path or search params change, it means navigation finished
    setLoading(false)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      
      if (anchor && 
          anchor.href && 
          anchor.href.startsWith(window.location.origin) && 
          !anchor.href.includes('#') &&
          anchor.target !== '_blank') {
        
        // If it's the same URL, don't show loading (Next.js won't navigate)
        if (anchor.href === window.location.href) return
        
        setLoading(true)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1.5 overflow-hidden bg-secondary">
      <div className="h-full w-full origin-left animate-[loading_1s_infinite_linear] bg-primary" />
    </div>
  )
}
