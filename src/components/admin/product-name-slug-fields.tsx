"use client"

import { useMemo, useRef, useState } from "react"

function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

type ProductNameSlugFieldsProps = {
  defaultName?: string
  defaultSlug?: string
  autoSlug?: boolean
}

export function ProductNameSlugFields({
  defaultName = "",
  defaultSlug = "",
  autoSlug = true,
}: ProductNameSlugFieldsProps) {
  const initial = useMemo(() => {
    const name = defaultName ?? ""
    const slug = defaultSlug ?? ""
    return {
      name,
      slug: slug || (autoSlug ? slugify(name) : ""),
    }
  }, [defaultName, defaultSlug, autoSlug])

  const [name, setName] = useState(initial.name)
  const [slug, setSlug] = useState(initial.slug)
  const slugTouched = useRef(Boolean(defaultSlug))

  return (
    <>
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Nama Produk
        </label>
        <input
          name="name"
          required
          value={name}
          onChange={(e) => {
            const nextName = e.target.value
            setName(nextName)
            if (autoSlug && !slugTouched.current) {
              setSlug(slugify(nextName))
            }
          }}
          className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
          placeholder="Contoh: Midi Dress Satin"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Slug
        </label>
        <input
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            const next = e.target.value
            setSlug(next)
            slugTouched.current = next.trim().length > 0
          }}
          onBlur={() => setSlug((v) => slugify(v))}
          className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all font-mono rounded-xl"
          placeholder="contoh: midi-dress-satin"
        />
      </div>
    </>
  )
}
