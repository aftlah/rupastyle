import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg" />
        <Loader2 className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
      </div>
      <h2 className="mt-4 text-2xl font-black uppercase tracking-tighter text-foreground">
        RupaStyle...
      </h2>
      <div className="mt-2 h-2 w-48 overflow-hidden rounded-xl border-2 border-foreground bg-secondary">
        <div className="h-full w-1/3 animate-[loading_1.5s_infinite_linear] bg-primary" />
      </div>
    </div>
  )
}
