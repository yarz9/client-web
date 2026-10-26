import { motion } from 'motion/react'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router'

import { money } from '../lib/cart'
import type { Product } from '../../data/products'

export function ProductCard({ product, index = 0, priority }: { product: Product; index?: number; priority?: boolean }) {
  const purchasable = product.available && product.price !== null && product.verificationStatus === 'verified'
  const category = product.category.replaceAll('-', ' ')

  return <motion.article initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -5% 0px' }} transition={{ duration: .55, delay: (index % 4) * .05, ease: [.22, 1, .36, 1] }} className="group min-w-0">
    <Link to={`/product/${product.slug}`} className="block">
      <div className="image-frame relative aspect-[.86] overflow-hidden border border-line/70 bg-[#edf0e9]">
        {product.image ? <img src={product.image} alt={product.name} loading={priority ? 'eager' : 'lazy'} className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"/> : <div className="botanical-grain relative grid size-full place-items-center"><span aria-hidden="true" className="font-display text-[104px] italic text-olive/30">{product.name.split(' ').slice(0, 1)[0]?.[0] ?? 'B'}</span><span className="absolute bottom-3 left-3 text-[8px] uppercase tracking-[.17em] text-olive-deep/65">Fotografija stiže</span></div>}
        <span className="absolute left-3 top-3 bg-bg/90 px-2 py-1 text-[9px] uppercase tracking-[.13em] text-olive-deep">Podaci na potvrdi</span>
        <span className="absolute inset-x-3 bottom-3 flex min-h-10 items-center justify-center gap-2 border border-olive/30 bg-bg/95 px-3 text-[11px] text-olive-deep transition-all group-hover:bg-olive-deep group-hover:text-white"><span>{purchasable ? 'Dodaj u korpu' : 'Detalji proizvoda'}</span>{purchasable ? <ShoppingBag className="size-3.5"/> : <ArrowRight className="size-3.5"/>}</span>
      </div>
      <div className="mt-3"><p className="text-[9px] uppercase tracking-[.16em] text-olive">{category}</p><div className="mt-1.5 flex items-start justify-between gap-2"><h3 className="max-w-[78%] text-[13px] font-medium leading-snug text-fg sm:text-[14px]">{product.name}</h3><span className="shrink-0 text-right text-[10px] leading-snug text-muted">{purchasable ? money(product.price!) : 'Cijena na potvrdi'}</span></div><p className="mt-1.5 text-[10px] leading-relaxed text-muted">{product.short}</p>{product.referencePrice && <p className="mt-1 text-[9px] text-faint">Ranije navedeno: {money(product.referencePrice)} · nepotvrđeno</p>}</div>
    </Link>
  </motion.article>
}
