import { AnimatePresence, motion } from 'motion/react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import { useCatalog } from '../lib/catalog'
import { ProductCard } from '../components/ProductCard'
import { Button, Container, inputClass } from '../components/ui'

export function Shop() {
  const { categories, products } = useCatalog()
  const categoryOptions = categories.map(({ key, label }) => ({ key, label }))
  const [params, setParams] = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const query = params.get('q') ?? ''
  const category = params.get('category') ?? ''

  function update(next: Record<string, string>) {
    const merged = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) value ? merged.set(key, value) : merged.delete(key)
    setParams(merged, { replace: true })
  }

  const list = useMemo(() => products.filter((product) => (!category || product.category === category) && (!query || `${product.name} ${product.short} ${product.description}`.toLocaleLowerCase('bs').includes(query.toLocaleLowerCase('bs')))), [category, query])
  const title = categoryOptions.find((option) => option.key === category)?.label ?? 'Katalog proizvoda'
  const filters = <div className="flex flex-col gap-7"><div><p className="text-[11px] uppercase tracking-[.16em] text-muted">Kategorije</p><ul className="mt-3 flex flex-col gap-1"><li><FilterOption active={!category} onClick={() => update({ category: '' })}>Sve kategorije <span className="ml-auto text-[12px] text-faint">{products.length}</span></FilterOption></li>{categoryOptions.map((option) => <li key={option.key}><FilterOption active={category === option.key} onClick={() => update({ category: option.key })}>{option.label}<span className="ml-auto text-[12px] text-faint">{products.filter((product) => product.category === option.key).length}</span></FilterOption></li>)}</ul></div></div>

  return <Container className="pb-20 pt-10 sm:pt-16">
    <div className="border-b border-line pb-8 sm:pb-11"><p className="text-[10px] uppercase tracking-[.2em] text-olive">BioHerbica · Tuzla / {products.length.toString().padStart(2, '0')}</p><div className="mt-4 flex flex-wrap items-end justify-between gap-5"><h1 className="font-display text-[48px] leading-none sm:text-[68px]">{title}</h1><p className="max-w-sm text-[13px] leading-[1.8] text-muted">Katalog je u pripremi. Podaci o cijenama, dostupnosti i proizvodima bit će objavljeni nakon potvrde vlasnice.</p></div></div>
    <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6"><p className="text-[12px] text-muted">{list.length} {list.length === 1 ? 'proizvod' : 'proizvoda'} <span className="ml-2 text-faint">· Razvojni prikaz</span></p><div className="flex w-full items-center gap-2 sm:w-auto"><Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setMobileOpen(true)}><SlidersHorizontal/>Kategorije</Button><label className="relative flex-1 sm:w-[290px]"><span className="sr-only">Pretraži proizvode</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint"/><input value={query} onChange={(event) => update({ q: event.target.value })} placeholder="Pretražite katalog" className={`${inputClass} h-10 border-0 bg-[#f0f0ea] pl-10 pr-4 text-[13px]`}/></label></div></div>
    <div className="mt-8 grid gap-9 lg:grid-cols-[220px_1fr] lg:gap-12"><aside className="hidden lg:block"><div className="sticky top-24">{filters}<div className="mt-8 border-l border-olive/50 bg-[#eff1eb] p-4"><p className="text-[12px] font-medium text-olive-deep">Podaci se provjeravaju</p><p className="mt-2 text-[11px] leading-relaxed text-muted">Proizvodi bez potvrđenih cijena nisu dostupni za naručivanje.</p></div></div></aside><div><motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:gap-x-6"><AnimatePresence mode="popLayout">{list.map((product, index) => <motion.div key={product.slug} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}><ProductCard product={product} index={index}/></motion.div>)}</AnimatePresence></motion.div>{list.length === 0 && <div className="py-24 text-center"><p className="font-display text-[34px]">Nema rezultata pretrage.</p><Button variant="secondary" className="mt-5" onClick={() => update({ q: '', category: '' })}>Prikaži cijeli katalog</Button></div>}</div></div>
    <AnimatePresence>{mobileOpen && <motion.div className="fixed inset-0 z-50 bg-fg/30 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)}><motion.div initial={{ y: 36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 36, opacity: 0 }} className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-auto bg-bg p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-drawer sm:inset-x-2 sm:bottom-2 sm:p-6" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><p className="font-display text-[29px]">Kategorije</p><button type="button" aria-label="Zatvori kategorije" onClick={() => setMobileOpen(false)}><X className="size-5"/></button></div>{filters}<Button className="mt-6 w-full" onClick={() => setMobileOpen(false)}>Prikaži {list.length} proizvoda</Button></motion.div></motion.div>}</AnimatePresence>
  </Container>
}

function FilterOption({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`flex min-h-9 w-full items-center gap-2 px-2 text-left text-[12px] transition-colors ${active ? 'text-olive-deep' : 'text-muted hover:text-fg'}`}><span className={`size-1.5 shrink-0 rounded-full ${active ? 'bg-olive' : 'bg-line-strong'}`}/>{children}</button> }
