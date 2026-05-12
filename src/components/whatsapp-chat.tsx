import Link from "next/link"
import { MessageCircle } from "lucide-react"

export default function WhatsAppChat() {
  const raw = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "")
  const message = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Halo RupaStyle, saya mau tanya produk."

  if (!raw) return null

  const number = raw.startsWith("0")
    ? `62${raw.slice(1)}`
    : raw.startsWith("8")
      ? `62${raw}`
      : raw

  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
      aria-label="Chat WhatsApp"
      title="Chat WhatsApp"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
        <MessageCircle className="h-5 w-5" />
      </span>
      <span className="hidden sm:inline text-sm font-black uppercase tracking-wide">
        Chat WA
      </span>
    </Link>
  )
}
