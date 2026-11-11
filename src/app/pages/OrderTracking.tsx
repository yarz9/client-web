import { ArrowLeft, Package, RefreshCw, Truck } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'

import { ButtonLink, Container, inputClass } from '../components/ui'
import { money } from '../lib/cart'
import { loadOrders, patchOrder, removeOrder, saveOrder, type SavedOrder } from '../lib/orders'

type TrackedItem = { name: string; option?: string; quantity: number; unitPrice: number; lineTotal: number }

type TrackedOrder = {
  reference: string
  status: string
  createdAt: string
  trackingCode: string
  trackToken?: string
  subtotal: number
  deliveryCharge: number | null
  total: number | null
  items: TrackedItem[]
}

// Statusi dolaze iz admin panela; ovdje se samo prevode u rečenicu koju kupac razumije.
const STATUS_NOTES: Record<string, string> = {
  Novo: 'Zahtjev je zaprimljen. BioHerbica potvrđuje dostupnost i cijenu dostave prije konačnog dogovora.',
  Potvrđeno: 'Narudžba je potvrđena. Slijedi priprema paketa.',
  'U pripremi': 'Paket se priprema za slanje.',
  Poslano: 'Paket je predan kurirskoj službi.',
  Isporučeno: 'Paket je isporučen.',
  Otkazano: 'Narudžba je otkazana. Za detalje kontaktirajte BioHerbicu.',
}

// Iste boje kao u admin panelu, da status izgleda jednako na obje strane.
const STATUS_STYLE: Record<string, string> = {
  Novo: 'border-amber-300 bg-amber-100 text-amber-900',
  'Potvrđeno': 'border-emerald-300 bg-emerald-50 text-emerald-800',
  'U pripremi': 'border-yellow-300 bg-yellow-50 text-yellow-800',
  Poslano: 'border-sky-300 bg-sky-50 text-sky-800',
  'Isporučeno': 'border-olive/40 bg-[#eff0e8] text-olive-deep',
  Otkazano: 'border-red-300 bg-red-50 text-red-800',
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('bs-BA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}

function fromSaved(order: SavedOrder): TrackedOrder {
  return {
    reference: order.reference,
    status: order.status,
    createdAt: order.createdAt,
    trackingCode: '',
    subtotal: order.subtotal,
    deliveryCharge: null,
    total: null,
    items: order.items.map(item => ({ name: item.name, option: item.option, quantity: item.quantity, unitPrice: item.unitPrice, lineTotal: item.unitPrice * item.quantity })),
  }
}

// Vraća null kada narudžba ne postoji (obrisana) ili podaci ne odgovaraju.
async function requestTracking(reference: string, credentials: { token?: string; phone?: string }) {
  const response = await fetch('/api/orders/track', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reference, ...credentials }),
  })
  if (response.status === 404) return null
  const body = await response.json() as TrackedOrder & { error?: string }
  if (!response.ok) throw new Error(body.error ?? 'Praćenje trenutno nije dostupno.')
  return body
}

function OrderCard({ order }: { order: TrackedOrder }) {
  const badge = STATUS_STYLE[order.status] ?? 'border-line-strong bg-surface text-muted'
  return (
    <li className={'border border-line bg-surface p-5 sm:p-6 border-l-4 ' + (order.status === 'Otkazano' ? 'border-l-red-600' : order.status === 'Isporučeno' ? 'border-l-olive' : order.status === 'Poslano' ? 'border-l-sky-600' : order.status === 'Novo' ? 'border-l-amber-500' : 'border-l-emerald-600')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-[24px] leading-none">{order.reference}</p>
          <p className="mt-2 text-[12px] text-muted">{formatDate(order.createdAt)}</p>
        </div>
        <span className={'inline-flex items-center border px-2 py-1 text-[11px] uppercase tracking-[.12em] ' + badge}>{order.status}</span>
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-muted">{STATUS_NOTES[order.status] ?? 'Status potvrđuje BioHerbica.'}</p>
      {order.trackingCode ? (
        <p className="mt-3 flex items-center gap-2 border border-line bg-bg px-3 py-2 text-[12px]">
          <Truck className="size-4 shrink-0 text-olive" />
          <span className="text-muted">Kod praćenja pošiljke:</span>
          <strong className="select-all break-all text-fg">{order.trackingCode}</strong>
        </p>
      ) : null}
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {order.items.map((item, index) => (
          <li key={item.name + '-' + (item.option ?? '') + '-' + index} className="flex justify-between gap-4 py-2 text-[12px]">
            <span>{item.name}{item.option ? ' · ' + item.option : ''} × {item.quantity}</span>
            <span className="shrink-0 tabular-nums">{money(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between text-[12px]">
        <span className="text-muted">Međuzbir proizvoda</span>
        <span className="tabular-nums">{money(order.subtotal)}</span>
      </div>
      {order.deliveryCharge !== null ? (
        <div className="mt-1 flex justify-between text-[12px]">
          <span className="text-muted">Dostava</span>
          <span className="tabular-nums">{money(order.deliveryCharge)}</span>
        </div>
      ) : null}
      {order.total !== null ? (
        <div className="mt-1 flex justify-between text-[12px] font-medium">
          <span>Ukupno</span>
          <span className="tabular-nums">{money(order.total)}</span>
        </div>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-faint">Dostava i ukupan iznos potvrđuju se naknadno, plaćanje je pouzećem.</p>
      )}
    </li>
  )
}

export function OrderTracking() {
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [live, setLive] = useState<Record<string, TrackedOrder>>({})
  const [checking, setChecking] = useState(true)
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [phoneTarget, setPhoneTarget] = useState('')
  const [phone, setPhone] = useState('')
  const [manualReference, setManualReference] = useState('')
  const [manualPhone, setManualPhone] = useState('')
  const [manualError, setManualError] = useState('')
  const [manualBusy, setManualBusy] = useState(false)

  // Usporedi lokalni snimak sa serverom: status se osvježi, a obrisane narudžbe nestaju.
  const sync = useCallback(async () => {
    setChecking(true)
    setNotice('')
    const saved = loadOrders()
    const nextLive: Record<string, TrackedOrder> = {}
    const gone: string[] = []
    let remoteError = ''
    for (const order of saved) {
      if (!order.trackToken) continue
      try {
        const tracked = await requestTracking(order.reference, { token: order.trackToken })
        if (!tracked) { gone.push(order.reference); continue }
        nextLive[order.reference] = tracked
        if (tracked.status !== order.status) patchOrder(order.reference, { status: tracked.status })
      } catch (cause) {
        remoteError = cause instanceof Error ? cause.message : 'Status trenutno nije moguće provjeriti.'
        nextLive[order.reference] = fromSaved(order)
      }
    }
    for (const reference of gone) removeOrder(reference)
    setLive(nextLive)
    setOrders(loadOrders())
    if (remoteError) setNotice(remoteError)
    else if (gone.length > 0) setNotice('Narudžbe koje više nisu dostupne uklonjene su iz ovog pregleda.')
    setChecking(false)
  }, [])

  useEffect(() => { void sync() }, [sync])

  async function verifyWithPhone(event: FormEvent) {
    event.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (!pendingPhone || digits.length < 6) { setNotice('Unesite broj telefona s narudžbe.'); return }
    try {
      const tracked = await requestTracking(pendingPhone, { phone: digits })
      if (!tracked) { setNotice('Broj telefona se ne poklapa s tom narudžbom.'); return }
      setLive(current => ({ ...current, [tracked.reference]: tracked }))
      patchOrder(tracked.reference, { status: tracked.status, trackToken: tracked.trackToken || undefined })
      setOrders(loadOrders())
      setPhoneTarget('')
      setPhone('')
      setNotice('')
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Provjera nije uspjela.')
    }
  }

  async function lookup(event: FormEvent) {
    event.preventDefault()
    const reference = manualReference.trim().toUpperCase()
    const digits = manualPhone.replace(/\D/g, '')
    if (!reference || digits.length < 6) { setManualError('Unesite referencu i broj telefona s narudžbe.'); return }
    setManualBusy(true)
    setManualError('')
    try {
      const tracked = await requestTracking(reference, { phone: digits })
      if (!tracked) { setManualError('Narudžba nije pronađena ili se telefon ne poklapa.'); return }
      setLive(current => ({ ...current, [tracked.reference]: tracked }))
      if (!loadOrders().some(order => order.reference === tracked.reference)) {
        saveOrder({
          reference: tracked.reference,
          createdAt: tracked.createdAt,
          items: tracked.items.map(item => ({ slug: '', name: item.name, option: item.option, quantity: item.quantity, unitPrice: item.unitPrice })),
          subtotal: tracked.subtotal,
          status: tracked.status,
          trackToken: tracked.trackToken,
        })
        setOrders(loadOrders())
      }
      setManualReference('')
      setManualPhone('')
    } catch (cause) {
      setManualError(cause instanceof Error ? cause.message : 'Provjera nije uspjela.')
    } finally {
      setManualBusy(false)
    }
  }

  const pendingPhone = phoneTarget || orders.find(order => !order.trackToken)?.reference || ''
  const needle = query.trim().toLowerCase()
  const visible = (needle ? orders.filter(order => order.reference.toLowerCase().includes(needle)) : orders)
    .map(order => live[order.reference] ?? fromSaved(order))

  return (
    <Container className="pb-20 pt-10 sm:pt-14">
      <Link to="/shop" className="inline-flex min-h-11 items-center gap-2 text-[12px] text-muted hover:text-olive">
        <ArrowLeft className="size-4" /> Katalog
      </Link>
      <p className="mt-6 text-[11px] uppercase tracking-[.18em] text-olive">BioHerbica · praćenje</p>
      <h1 className="font-display mt-3 text-[43px] leading-none sm:text-[58px]">Praćenje narudžbe</h1>
      <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-muted">
        Status se provjerava kod BioHerbice pri svakom otvaranju ove stranice, pa ovdje vidite ono što je admin panel posljednje postavio. Referencu u formatu BH-XXXXXXXX dobijate odmah nakon slanja.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void sync()} disabled={checking} className="inline-flex min-h-11 items-center gap-2 border border-line-strong bg-surface px-4 text-[12px] text-fg disabled:opacity-60">
          <RefreshCw className={'size-4 ' + (checking ? 'animate-spin' : '')} /> {checking ? 'Provjerava se…' : 'Provjeri ponovo'}
        </button>
        {notice ? <p className="text-[12px] text-muted" role="status">{notice}</p> : null}
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 max-w-xl border border-line bg-surface p-6">
          <Package className="size-6 text-faint" />
          <p className="font-display mt-4 text-[26px] leading-tight">Još nema sačuvanih zahtjeva</p>
          <p className="mt-2 text-[12px] leading-relaxed text-muted">
            Kada pošaljete zahtjev, potvrda s referencom ostaje na ovom uređaju. Narudžbu poslanu s drugog uređaja pronađite ispod pomoću reference i broja telefona.
          </p>
          <ButtonLink to="/shop" className="mt-5 rounded-[2px]">Pogledajte katalog</ButtonLink>
        </div>
      ) : (
        <>
          <div className="mt-8 max-w-sm">
            <label className="flex flex-col gap-1 text-[12px] text-muted">
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

      {pendingPhone ? (
        <form onSubmit={verifyWithPhone} className="mt-8 max-w-md border border-line bg-surface p-5">
          <p className="text-[13px] font-medium">Potvrdite narudžbu {pendingPhone}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">Ova narudžba je sačuvana bez tokena za praćenje. Unesite telefon s narudžbe da biste vidjeli stvarni status.</p>
          <input className={inputClass + ' mt-3'} value={phone} onChange={event => setPhone(event.target.value)} placeholder="Broj telefona" inputMode="tel" autoComplete="tel" />
          <div className="mt-3 flex gap-2">
            <button type="submit" className="min-h-11 border border-olive-deep bg-olive-deep px-4 text-[12px] text-white">Provjeri status</button>
            <button type="button" onClick={() => { setPhoneTarget(''); setPhone('') }} className="min-h-11 border border-line-strong bg-surface px-4 text-[12px]">Odustani</button>
          </div>
        </form>
      ) : null}

      {orders.length > 0 ? (
        <form onSubmit={lookup} className="mt-10 max-w-md border border-line bg-surface p-5">
          <p className="text-[13px] font-medium">Narudžba s drugog uređaja</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">Unesite referencu i broj telefona s narudžbe. Iz sigurnosnih razloga prikazujemo samo status i stavke.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input className={inputClass} value={manualReference} onChange={event => setManualReference(event.target.value)} placeholder="BH-AB12CD34" autoComplete="off" />
            <input className={inputClass} value={manualPhone} onChange={event => setManualPhone(event.target.value)} placeholder="Broj telefona" inputMode="tel" autoComplete="tel" />
          </div>
          {manualError ? <p className="mt-2 text-[12px] text-accent" role="alert">{manualError}</p> : null}
          <button type="submit" disabled={manualBusy} className="mt-3 min-h-11 border border-olive-deep bg-olive-deep px-4 text-[12px] text-white disabled:opacity-60">{manualBusy ? 'Provjerava se…' : 'Prikaži narudžbu'}</button>
        </form>
      ) : null}

      <p className="mt-8 max-w-xl text-[11px] leading-relaxed text-faint">
        Sajt je u izradi: cijene, dostava i dostupnost još se potvrđuju. Ako je admin narudžbu obrisao, ona se više ne prikazuje ni na ovoj stranici.
      </p>
    </Container>
  )
}
