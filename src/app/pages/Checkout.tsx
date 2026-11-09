import { Check } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useParams } from 'react-router'

import { OrderSentDialog } from '../components/OrderSentDialog'
import { Button, ButtonLink, Container, inputClass } from '../components/ui'
import { useCatalog } from '../lib/catalog'
import { linePrice, money, useCart } from '../lib/cart'
import { loadOrder, saveOrder, type SavedOrder } from '../lib/orders'

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={className}><span className="mb-1.5 block text-[13px] font-medium">{label}</span>{children}</label>
}

type PricedItem = { option?: string; product: { price: number | null; options?: { label: string; price: number }[] } }
const itemUnitPrice = (item: PricedItem) => linePrice({ ...item.product, options: item.product.options } as never, item.option)

type OrderSummaryState = {
  reference: string
  customer: { name: string; phone: string; city: string; address: string; email: string }
  items: { slug: string; option?: string; quantity: number; product: { name: string; price: number | null; options?: { label: string; price: number }[] } }[]
  subtotal: number
}

export function Checkout() {
  const cart = useCart()
  const { loading: catalogLoading } = useCatalog()
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', note: '', email: '' })
  const [confirmed, setConfirmed] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle')
  const [error, setError] = useState('')
  const [sent, setSent] = useState<{ reference: string } | null>(null)
  const catalogReady = !catalogLoading && cart.items.length > 0 && cart.items.every(item => item.product.available && item.product.verificationStatus === 'verified' && itemUnitPrice(item) !== null)

  // Korpa se prazni čim server potvrdi upis, pa se pop up prikazuje prije preusmjeravanja.
  if (sent) return <Container className="pb-24 pt-16"><OrderSentDialog reference={sent.reference} /></Container>
  if (catalogLoading) return <Container className="pb-16 pt-16"><p className="font-display text-[30px]">Učitava se katalog…</p></Container>
  if (cart.items.length === 0) return <Navigate to="/shop" replace />
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: event.target.value })

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!confirmed || !catalogReady) return
    setState('sending'); setError('')
    try {
      const response = await fetch('/api/orders', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customer: form, items: cart.items.map((item) => ({ id: item.slug, option: item.option, quantity: item.quantity })), paymentMethod: 'pouzece' }) })
      const body = await response.json() as { reference?: string; error?: string; subtotal?: number }
      if (!response.ok || !body.reference) throw new Error(body.error ?? 'Narudžbu trenutno nije moguće sačuvati.')
      // Potvrda se pamti lokalno da se ne izgubi na osvježavanje stranice ili povratak na sajt.
      saveOrder({
        reference: body.reference,
        createdAt: new Date().toISOString(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        items: cart.items.map(item => ({ slug: item.slug, name: item.product.name, option: item.option, quantity: item.quantity, unitPrice: itemUnitPrice(item) ?? 0 })),
        subtotal: body.subtotal ?? cart.subtotal,
        status: 'Novo',
      })
      cart.clear()
      setSent({ reference: body.reference })
    } catch (cause) { setState('error'); setError(cause instanceof Error ? cause.message : 'Narudžbu trenutno nije moguće poslati.') }
    finally { setState(current => current === 'sending' ? 'idle' : current) }
  }

  return <Container className="pb-16 pt-10 sm:pt-14">
    <p className="text-[10px] uppercase tracking-[.18em] text-olive">BioHerbica · siguran zahtjev za narudžbu</p><h1 className="font-display mt-3 text-[47px] leading-none sm:text-[62px]">Vaša narudžba</h1>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-16">
      <div>
        {!catalogReady && <div className="mb-6 border-l-2 border-olive bg-[#eff0e8] px-4 py-3 text-[11px] leading-relaxed text-olive-deep"><strong>Razvojni katalog — naručivanje još nije aktivno.</strong> Cijene, dostupnost i uslovi dostave čekaju potvrdu vlasnice. Nijedan proizvod trenutno nije dostupan za kupovinu.</div>}
        <form onSubmit={submit} className="flex flex-col gap-7">
          <fieldset disabled={!catalogReady} className={`flex flex-col gap-7 ${!catalogReady ? 'opacity-65' : ''}`}><section><h2 className="text-[15px] font-medium">Kontakt i adresa za dostavu</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Ime i prezime"><input required minLength={3} autoComplete="name" className={inputClass} value={form.name} onChange={set('name')}/></Field><Field label="Broj telefona"><input required type="tel" minLength={6} autoComplete="tel" className={inputClass} value={form.phone} onChange={set('phone')}/></Field><Field label="Grad"><input required autoComplete="address-level2" className={inputClass} value={form.city} onChange={set('city')}/></Field><Field label="Ulica i kućni broj"><input required autoComplete="street-address" className={inputClass} value={form.address} onChange={set('address')}/></Field><Field label="Napomena za dostavu (opcionalno)" className="sm:col-span-2"><textarea rows={3} className={`${inputClass} h-auto py-3`} value={form.note} onChange={set('note')}/></Field><Field label="Email (opcionalno)" className="sm:col-span-2"><input type="email" autoComplete="email" className={inputClass} value={form.email} onChange={set('email')}/></Field></div></section><section><h2 className="text-[15px] font-medium">Način plaćanja</h2><div className="mt-3 border border-olive/30 bg-[#eff0e8] p-4"><p className="text-[13px] font-medium text-olive-deep">Plaćanje pouzećem</p><p className="mt-1 text-[11px] leading-relaxed text-muted">Plaćanje prilikom preuzimanja. Ne prikupljamo podatke s platnih kartica.</p></div></section><label className="flex cursor-pointer items-start gap-3 text-[11px] leading-relaxed text-muted"><input required type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-0.5 accent-[#657458]"/><span>Potvrđujem da su podaci tačni i želim poslati zahtjev. Dostupnost i cijenu dostave BioHerbica potvrđuje prije konačne potvrde.</span></label>{state === 'error' && <p role="alert" className="text-[13px] text-accent">{error}</p>}<Button type="submit" size="lg" loading={state === 'sending'} disabled={!confirmed} className="w-full rounded-[2px] sm:w-auto">Pošaljite zahtjev za narudžbu</Button></fieldset>
        </form>
        {!catalogReady && <p className="mt-4 text-[11px] text-muted">Obrazac će se aktivirati kada BioHerbica potvrdi cijene i dostupnost proizvoda.</p>}
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start"><div className="border border-line bg-surface p-6"><h2 className="text-[15px] font-medium">Pregled zahtjeva</h2><ul className="mt-4 divide-y divide-line">{cart.items.map(item => { const unitPrice = itemUnitPrice(item); return <li key={`${item.slug}-${item.option ?? ''}`} className="flex items-center gap-4 py-3"><span className="image-frame relative size-14 shrink-0 bg-blue-wash"><span className="grid size-full place-items-center font-display text-[22px] text-olive/40">{item.product.name.slice(0,1)}</span><span className="absolute -right-1 -top-1 grid min-w-5 place-items-center bg-olive-deep px-1 text-[10px] text-white">{item.quantity}</span></span><span className="min-w-0 flex-1 text-[12px]">{item.product.name}{item.option ? ` · ${item.option}` : ''}</span><span className="text-right text-[10px]">{unitPrice !== null ? money(unitPrice * item.quantity) : 'Cijena čeka potvrdu'}</span></li> })}</ul><div className="mt-4 border-t border-line pt-4"><div className="flex justify-between text-[12px]"><span className="text-muted">Međuzbir proizvoda</span><span>{money(cart.subtotal)}</span></div><p className="mt-3 text-[11px] font-medium">Konačan iznos nije određen</p><p className="mt-1 text-[10px] leading-relaxed text-muted">Dostava nije potvrđena ni uključena.</p></div></div></aside>
    </div>
  </Container>
}

type DisplayRow = { key: string; label: string; quantity: number; total: number | null }

export function OrderConfirmed() {
  const { reference: routeReference } = useParams()
  const { state } = useLocation() as { state?: OrderSummaryState }
  const [saved, setSaved] = useState<SavedOrder | null>(null)
  const [checked, setChecked] = useState(false)

  // Nakon osvježavanja ruta nema stanje, pa se potvrda traži među zahtjevima sačuvanim na uređaju.
  useEffect(() => {
    if (!state && routeReference) setSaved(loadOrder(routeReference) ?? null)
    setChecked(true)
  }, [routeReference, state])

  if (!checked) return <Container className="pb-16 pt-16"><p className="font-display text-[30px]">Učitava se potvrda…</p></Container>

  const reference = state?.reference ?? saved?.reference ?? routeReference ?? ''
  const name = state?.customer.name ?? saved?.name ?? ''
  const subtotal = state?.subtotal ?? saved?.subtotal ?? 0
  const rows: DisplayRow[] = state
    ? state.items.map(item => {
        const unitPrice = itemUnitPrice(item)
        return { key: `${item.slug}-${item.option ?? ''}`, label: `${item.product.name}${item.option ? ` · ${item.option}` : ''}`, quantity: item.quantity, total: unitPrice === null ? null : unitPrice * item.quantity }
      })
    : (saved?.items ?? []).map(item => ({ key: `${item.slug}-${item.option ?? ''}`, label: `${item.name}${item.option ? ` · ${item.option}` : ''}`, quantity: item.quantity, total: item.unitPrice * item.quantity }))
  const found = Boolean(state || saved)

  return <Container className="pt-16 sm:pt-24"><div className="mx-auto max-w-md text-center">
    <span className="mx-auto grid size-14 place-items-center bg-olive-deep text-white"><Check className="size-6"/></span>
    <h1 className="font-display mt-6 text-[43px] leading-[1.02] sm:text-[58px]">{found ? 'Zahtjev je zaprimljen' : 'Nema potvrđene narudžbe'}</h1>
    {found ? <>
      <p className="mt-4 text-[13px] text-muted">Referenca zahtjeva: <strong className="text-fg">{reference}</strong></p>
      <p className="mt-3 text-[12px] leading-relaxed text-muted">Hvala, {name}. Plaćanje je pouzećem. BioHerbica potvrđuje dostupnost i cijenu dostave prije dogovora o konačnom iznosu. Ovo još nije prihvaćena narudžba.</p>
      <p className="mt-3 text-[11px] leading-relaxed text-faint">Referenca je sačuvana na ovom uređaju, pa se ova potvrda može ponovo otvoriti i kasnije.</p>
      <div className="mt-6 border-y border-line py-4 text-left">
        <p className="text-[10px] uppercase tracking-[.14em] text-olive">Vaš zahtjev</p>
        {rows.map(row => <div key={row.key} className="mt-3 flex justify-between gap-4 text-[11px]"><span>{row.label} × {row.quantity}</span><span>{row.total !== null ? money(row.total) : 'Cijena čeka potvrdu'}</span></div>)}
        <p className="mt-4 border-t border-line pt-3 text-[11px]">Međuzbir proizvoda: {money(subtotal)}</p>
        <p className="mt-2 text-[10px] text-muted">Dostava i ukupan iznos potvrđuju se naknadno.</p>
      </div>
      <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <ButtonLink to="/track" className="w-full rounded-[2px] sm:w-auto">Pratite status narudžbe</ButtonLink>
        <ButtonLink to="/shop" variant="secondary" className="w-full rounded-[2px] sm:w-auto">Povratak na katalog</ButtonLink>
      </div>
    </> : <>
      <p className="mt-4 text-[13px] text-muted">Ova potvrda se prikazuje samo nakon što je server uspješno sačuvao narudžbu, ili za zahtjeve sačuvane na ovom uređaju.</p>
      <p className="mt-3 text-[12px] leading-relaxed text-muted">Ako ste narudžbu poslali s drugog uređaja, otvorite praćenje i provjerite referencu iz poruke BioHerbice.</p>
      <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <ButtonLink to="/track" className="w-full rounded-[2px] sm:w-auto">Praćenje narudžbe</ButtonLink>
        <ButtonLink to="/shop" variant="secondary" className="w-full rounded-[2px] sm:w-auto">Povratak na katalog</ButtonLink>
      </div>
    </>}
  </div></Container>
}
