import { AnimatePresence, motion } from 'motion/react'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

import { useCatalog } from '../lib/catalog'
import { useCart } from '../lib/cart'
import { cx } from '../lib/cx'

export function Logo({ className }: { className?: string }) {
  return <Link to="/" aria-label="BioHerbica — početna stranica" className={cx('inline-flex items-center', className)}><img src="/brand/bioherbica-wordmark.webp" alt="BioHerbica — priroda oblikovana znanjem" className="h-12 w-auto max-w-[210px] object-contain sm:h-[58px] sm:max-w-[250px]" /></Link>
}

export function Nav() {
  const cart = useCart()
  const { categories } = useCatalog()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location])
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 18); onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll) }, [])
  const links = [{ to: '/shop', label: 'Svi proizvodi' }, ...categories.map(category => ({ to: `/shop?category=${category.key}`, label: category.label })), { to: '/about', label: 'O nama' }]

  return <>
    <div className="flex min-h-8 items-center justify-center bg-olive-deep px-4 py-1.5 text-center text-[9px] uppercase tracking-[.17em] text-[#edf0e6] sm:text-[10px]">Prirodni proizvodi · Tuzla, Bosna i Hercegovina</div>
    <header className={cx('sticky top-0 z-40 border-b transition-all duration-300', scrolled ? 'border-line bg-bg/95 shadow-[0_5px_22px_-18px_rgba(37,44,36,.35)] backdrop-blur-md' : 'border-transparent bg-bg')}>
      <div className="mx-auto grid h-[68px] max-w-[1360px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:h-[75px] sm:px-8 lg:px-12">
        <button type="button" aria-label="Otvori meni" aria-expanded={open} onClick={() => setOpen(true)} className="grid size-10 place-items-center text-olive-deep lg:hidden"><Menu className="size-5"/></button>
        <nav aria-label="Glavna navigacija" className="hidden items-center gap-6 lg:flex">{[{ to: '/shop', label: 'Proizvodi' }, { to: '/about', label: 'O nama' }, { to: '/contact', label: 'Kontakt' }].map(link => <Link key={link.to} to={link.to} className="border-b border-transparent py-2 text-[11px] text-muted transition-colors hover:border-olive/50 hover:text-olive-deep">{link.label}</Link>)}</nav>
        <Logo className="justify-self-center"/>
        <div className="flex items-center justify-self-end"><button type="button" aria-label={`Otvori korpu, ${cart.count} artikala`} onClick={() => cart.setOpen(true)} className="relative flex h-10 items-center gap-2 border border-olive/25 px-3 text-[11px] text-olive-deep transition-colors hover:bg-[#eef0e8]"><ShoppingBag className="size-4"/><span className="hidden sm:inline">Korpa</span><span className="text-[10px] tabular-nums">{cart.count}</span></button></div>
      </div>
    </header>
    <AnimatePresence>{open && <motion.div className="fixed inset-0 z-50 bg-olive-deep/35 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}><motion.nav aria-label="Mobilna navigacija" initial={{ x: -28 }} animate={{ x: 0 }} exit={{ x: -28 }} transition={{ duration: .28, ease: [.22, 1, .36, 1] }} className="absolute inset-y-0 left-0 flex w-[min(370px,88vw)] flex-col bg-bg px-7 py-6 shadow-drawer" onClick={event => event.stopPropagation()}><div className="flex items-center justify-between"><Logo/><button type="button" aria-label="Zatvori meni" onClick={() => setOpen(false)} className="grid size-10 place-items-center"><X className="size-5"/></button></div><p className="mt-12 text-[9px] uppercase tracking-[.2em] text-olive">Istražite BioHerbicu</p><ul className="mt-4">{links.map((link, i) => <li key={`${link.to}-${link.label}`} className="border-b border-line"><Link to={link.to} className="flex items-center justify-between py-3.5 font-display text-[25px] text-olive-deep">{link.label}<span className="text-[9px] text-faint">{String(i + 1).padStart(2, '0')}</span></Link></li>)}</ul><div className="mt-auto border-t border-line pt-5 text-[10px] uppercase tracking-[.16em] text-muted">Tuzla · Bosna i Hercegovina</div></motion.nav></motion.div>}</AnimatePresence>
  </>
}
