import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Check, Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'

import { useCatalog } from '../lib/catalog'
import { ProductCard } from '../components/ProductCard'
import { Button, Container } from '../components/ui'
import { money, useCart } from '../lib/cart'
import { cx } from '../lib/cx'

// Descriptions may be long and structured: blank lines separate paragraphs, lines that start
// with a bullet marker become a list, and a lone short line in a multi-block text is a heading.
function Description({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map(block => block.split('\n').map(line => line.trim()).filter(Boolean)).filter(lines => lines.length > 0)
  const structured = blocks.length > 1
  return <div className="mt-5 flex max-w-lg flex-col gap-3 text-pretty text-[14px] leading-[1.9] text-muted">{blocks.map((lines, index) => {
    if (lines.every(line => line.startsWith('• '))) return <ul key={index} className="flex list-outside list-disc flex-col gap-1.5 pl-5 marker:text-olive">{lines.map(line => <li key={line}>{line.slice(2)}</li>)}</ul>
    const heading = structured && lines.length === 1 && lines[0].length <= 70 && !lines[0].endsWith('.')
    return <p key={index} className={heading ? 'font-medium text-fg' : undefined}>{lines.join(' ')}</p>
  })}</div>
}

export function Product() {
  const { slug } = useParams()
  const { products } = useCatalog()
  const product = slug ? products.find(candidate => candidate.slug === slug) : undefined
  const cart = useCart()
  const [quantity, setQuantity] = useState(1)
  const [option, setOption] = useState('')
  const [added, setAdded] = useState(false)
  const [open, setOpen] = useState<number | null>(0)

  useEffect(() => { setQuantity(1); setOption(''); window.scrollTo({ top: 0 }) }, [slug])
  if (!product) return <Navigate to="/shop" replace />
  const currentProduct = product
  const options = product.options ?? []
  const selectedOption = options.find(candidate => candidate.label === option) ?? options[0]
  const unitPrice = selectedOption?.price ?? product.price
  const purchasable = product.available && unitPrice !== null && product.verificationStatus === 'verified'
  const sections = [
    { title: 'Informacije o proizvodu', body: product.details },
    { title: 'Dostupnost i provjera', body: [product.verificationStatus === 'verified' ? 'Podatke o proizvodu potvrdila je BioHerbica.' : 'Opis, cijena, dostupnost, fotografija i klasifikacija čekaju potvrdu BioHerbice.'] },
    { title: 'Dostava i uslovi', body: ['Cijena dostave, područje isporuke i uslovi kupovine još nisu potvrđeni.'] },
  ]
  function add() { if (!purchasable) return; cart.add(currentProduct, selectedOption?.label, quantity); setAdded(true); window.setTimeout(() => setAdded(false), 1600) }
  const related = products.filter((candidate) => candidate.slug !== product.slug && candidate.category === product.category).slice(0, 4)

  return <Container className="pb-16 pt-6 sm:pt-10">
    <Link to="/shop" className="inline-flex h-9 items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-fg"><ArrowLeft className="size-4"/>Katalog</Link>
    <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <div className="image-frame relative aspect-[.82] overflow-hidden border border-line bg-blue-wash">{currentProduct.image ? <img src={currentProduct.image} alt={currentProduct.name} className="absolute inset-0 size-full object-cover" fetchPriority="high"/> : <div className="botanical-grain absolute inset-0 grid place-items-center"><span aria-hidden="true" className="font-display text-[clamp(7rem,22vw,15rem)] italic text-olive/30">{currentProduct.name.slice(0, 1)}</span><span className="absolute bottom-4 left-4 bg-bg/75 px-3 py-2 text-[9px] uppercase tracking-[.17em] text-olive-deep">Fotografija stiže</span></div>}</div>
      <div className="lg:pt-4"><p className="text-[10px] uppercase tracking-[.17em] text-olive">{product.category.replaceAll('-', ' ')}</p><h1 className="font-display mt-3 text-[41px] leading-[.98] sm:text-[57px]">{product.name}</h1><p className="mt-4 text-[14px] text-muted">{unitPrice !== null ? money(unitPrice) : 'Cijena čeka potvrdu'}</p>{product.referencePrice && <p className="mt-1 text-[11px] text-faint">Ranije navedeno: {money(product.referencePrice)} — nije aktuelna potvrđena cijena</p>}{product.size && <p className="mt-1 text-[11px] text-muted">{product.size}</p>}{options.length > 0 && <div role="group" aria-label="Pakovanje" className="mt-5"><p className="text-[11px] uppercase tracking-[.14em] text-olive">Odaberite pakovanje</p><div className="mt-2 flex flex-wrap gap-2">{options.map(candidate => <button key={candidate.label} type="button" aria-pressed={candidate.label === selectedOption?.label} onClick={() => setOption(candidate.label)} className={cx('min-w-[104px] border px-4 py-2.5 text-left text-[13px] transition-colors', candidate.label === selectedOption?.label ? 'border-olive-deep bg-olive-deep text-white' : 'border-line-strong hover:border-olive')}><span className="block leading-tight">{candidate.label}</span><span className={cx('block text-[11px]', candidate.label === selectedOption?.label ? 'text-white/80' : 'text-muted')}>{money(candidate.price)}</span></button>)}</div></div>}<Description text={product.description}/>{!purchasable && <p className="mt-4 border-l border-olive/40 bg-[#eff0e8] px-4 py-3 text-[11px] leading-relaxed text-olive-deep">Razvojni prikaz — detalji proizvoda čekaju potvrdu vlasnice. Ovaj proizvod još nije dostupan za naručivanje.</p>}
        <div className="mt-7 grid grid-cols-[115px_1fr] gap-3"><div className="grid h-12 grid-cols-[36px_1fr_36px] items-center border border-line-strong text-[13px]"><button type="button" aria-label="Smanji količinu" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span className="text-center tabular-nums">{quantity}</span><button type="button" aria-label="Povećaj količinu" disabled={quantity >= 50} onClick={() => setQuantity(Math.min(50, quantity + 1))}>+</button></div><Button size="md" disabled={!purchasable} onClick={add} className={cx('h-12 w-full rounded-[2px]', added && 'bg-accent hover:bg-accent')}>{added ? <><Check/>Dodano u korpu</> : purchasable ? 'Dodaj u korpu' : 'Nije dostupno za naručivanje'}</Button></div><p className="mt-3 text-[10px] text-muted">Plaćanje pouzećem · cijena dostave još nije određena.</p>
        <ul className="mt-10 divide-y divide-line border-y border-line">{sections.map((section, index) => { const isOpen = open === index; return <li key={section.title}><button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : index)} className="flex h-14 w-full items-center justify-between text-left text-[13px] font-medium">{section.title}{isOpen ? <Minus className="size-4 text-muted"/> : <Plus className="size-4 text-muted"/>}</button><AnimatePresence initial={false}>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><ul className="flex flex-col gap-1.5 pb-5 text-[12px] leading-relaxed text-muted">{section.body.map(line => <li key={line}>{line}</li>)}</ul></motion.div>}</AnimatePresence></li> }) }</ul>
      </div>
    </div>
    {related.length > 0 && <section className="pt-20"><h2 className="font-display text-[36px]">Još iz ove kategorije</h2><div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4">{related.map((item, index)=><ProductCard key={item.slug} product={item} index={index}/>)}</div></section>}
  </Container>
}
