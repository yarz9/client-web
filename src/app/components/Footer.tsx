import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react'
import { Link } from 'react-router'

import { Container } from './ui'
import { Logo } from './Nav'

const columns = [
  { title: 'Istražite', links: [['Svi proizvodi', '/shop'], ['Njega lica', '/shop?category=njega-lica'], ['Njega tijela', '/shop?category=njega-tijela'], ['Biljni preparati', '/shop?category=biljni-preparati']] },
  { title: 'Informacije', links: [['O BioHerbici', '/about'], ['Kontakt', '/contact'], ['Privatnost — čeka potvrdu', '/policies'], ['Uslovi kupovine — čeka potvrdu', '/policies']] },
]

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="max-w-sm"><Logo/><p className="mt-5 max-w-xs text-[12px] leading-[1.8] text-muted">Prirodni proizvodi za njegu i svakodnevne rituale. Iz Tuzle, s pažnjom.</p><a href="https://www.instagram.com/bioherbica/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-[11px] text-olive hover:underline"><ArrowUpRight className="size-4"/> Instagram @bioherbica <ArrowRight className="size-3"/></a><p className="mt-5 flex items-center gap-2 text-[10px] text-muted"><MapPin className="size-3.5 text-olive"/> Tuzla, Bosna i Hercegovina</p></div>
          <div className="grid grid-cols-2 gap-6">{columns.map(column => <div key={column.title}><p className="text-[9px] uppercase tracking-[.17em] text-olive">{column.title}</p><ul className="mt-4 flex flex-col gap-3">{column.links.map(([label, to]) => <li key={label}><Link to={to} className="text-[10px] leading-relaxed text-muted transition-colors hover:text-olive">{label}</Link></li>)}</ul></div>)}</div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-5 text-[9px] leading-relaxed text-faint sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} BioHerbica · Tuzla</p><p>Privatnost, uslovi prodaje i pravne informacije čekaju potvrdu vlasnice i lokalnu provjeru.</p></div>
      </Container>
    </footer>
  )
}
