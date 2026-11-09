import { ArrowLeft, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { ButtonLink, Container, inputClass } from '../components/ui'
import { money } from '../lib/cart'
import { loadOrders, type SavedOrder } from '../lib/orders'

// Statusi dolaze iz admin panela. Ovdje se samo prevode u rečenicu koju kupac razumije.
const STATUS_NOTES: Record<string, string> = {
  Novo: 'Zahtjev je zaprimljen. BioHerbica potvrđuje dostupnost i cijenu dostave prije konačnog dogovora.',
  Potvrđeno: 'Narudžba je potvrđena. Slijedi priprema paketa.',
  'U pripremi': 'Paket se priprema za slanje.',
  Poslano: 'Paket je predan kurirskoj službi.',
  Isporučeno: 'Paket je isporučen.',
  Otkazano: 'Narudžba je otkazana. Za detalje kontaktirajte BioHerbicu.',
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('bs-BA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}

function OrderCard({ order }: { order: SavedOrder }) {
  return (
    <li className="border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-[24px] leading-none">{order.reference}</p>
          <p className="mt-2 text-[11px] text-muted">{formatDate(order.createdAt)}</p>
        </div>
        <span className="border border-olive/40 bg-[#eff0e8] px-2 py-1 text-[10px] uppercase tracking-[.12em] text-olive-deep">{order.status}</span>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-muted">{STATUS_NOTES[order.status] ?? 'Status potvrđuje BioHerbica.'}</p>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {order.items.map(item => (
          <li key={`${item.slug}-${item.option ?? ''}`} className="flex justify-between gap-4 py-2 text-[11px]">
            <span>{item.name}{item.option ? ` · ${item.option}` : ''} × {item.quantity}</span>
            <span className="shrink-0 tabular-nums">{money(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between text-[11px]">
        <span className="text-muted">Međuzbir proizvoda</span>
        <span className="tabular-nums">{money(order.subtotal)}</span>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-faint">Dostava i ukupan iznos potvrđuju se naknadno, plaćanje je pouzećem.</p>
    </li>
  )
}

export function OrderTracking() {
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    setOrders(loadOrders())
  }, [])

  const needle = query.trim().toLowerCase()
  const visible = needle ? orders.filter(order => order.reference.toLowerCase().includes(needle)) : orders

  return (
    <Container className="pb-20 pt-10 sm:pt-14">
      <Link to="/shop" className="inline-flex min-h-11 items-center gap-2 text-[12px] text-muted hover:text-olive">
        <ArrowLeft className="size-4" /> Katalog
      </Link>
      <p className="mt-6 text-[10px] uppercase tracking-[.18em] text-olive">BioHerbica · praćenje</p>
      <h1 className="font-display mt-3 text-[43px] leading-none sm:text-[58px]">Praćenje narudžbe</h1>
      <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-muted">
        Ovdje se prikazuju zahtjevi poslani iz ovog preglednika. Referencu u formatu BH-XXXXXXXX dobijate odmah nakon slanja i ona ostaje sačuvana na ovom uređaju.
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 max-w-xl border border-line bg-surface p-6">
          <Package className="size-6 text-faint" />
          <p className="font-display mt-4 text-[26px] leading-tight">Još nema sačuvanih zahtjeva</p>
          <p className="mt-2 text-[12px] leading-relaxed text-muted">
            Kada pošaljete zahtjev za narudžbu, potvrda s referencom ostaje na ovoj stranici i nakon zatvaranja preglednika. Ako ste narudžbu poslali s drugog uređaja, referencu provjerite u poruci koju ste dobili od BioHerbice.
          </p>
          <ButtonLink to="/shop" className="mt-5 rounded-[2px]">Pogledajte katalog</ButtonLink>
        </div>
      ) : (
        <>
          <div className="mt-8 max-w-sm">
            <label className="flex flex-col gap-1 text-[11px] text-muted">
              Pronađite referencu
              <input className={inputClass} value={query} onChange={event => setQuery(event.target.value)} placeholder="BH-AB12CD34" autoComplete="off" />
            </label>
          </div>
          {visible.length === 0 ? (
            <p className="mt-6 text-[12px] text-muted">Nema zahtjeva s tom referencom na ovom uređaju.</p>
          ) : (
            <ul className="mt-6 flex max-w-2xl flex-col gap-4">
              {visible.map(order => <OrderCard key={order.reference} order={order} />)}
            </ul>
          )}
        </>
      )}

      <p className="mt-8 max-w-xl text-[10px] leading-relaxed text-faint">
        Sajt je u izradi: cijene, dostava i dostupnost još se potvrđuju. Status narudžbe mijenja BioHerbica nakon provjere, a ovdje prikazani status je posljednji zabilježen pri slanju zahtjeva.
      </p>
    </Container>
  )
}
