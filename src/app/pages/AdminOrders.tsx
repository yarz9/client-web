import { Loader2, Mail, Search, Send, Trash2, Truck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button, inputClass } from '../components/ui'
import { money } from '../lib/cart'

type Status = 'Novo' | 'Potvrdeno' | 'U pripremi' | 'Poslano' | 'Isporuceno' | 'Otkazano'

type Order = {
  reference: string
  customerJson: string
  itemsJson: string
  subtotal: number
  deliveryCharge: number | null
  total: number | null
  paymentMethod: string
  status: Status
  createdAt: string
  trackingCode: string | null
  trackingSentAt: string | null
}

type Customer = { name: string; phone: string; city: string; address: string; note: string; email: string }
type Item = { name: string; quantity: number; lineTotal: number }
type FilterKey = 'all' | 'new' | 'progress' | 'sent' | 'done' | 'cancelled'

const STATUSES: Status[] = ['Novo', 'Potvrdeno', 'U pripremi', 'Poslano', 'Isporuceno', 'Otkazano']

const STATUS_STYLE: Record<Status, { edge: string; badge: string }> = {
  Novo: { edge: 'border-l-amber-500', badge: 'border-amber-300 bg-amber-100 text-amber-900' },
  Potvrdeno: { edge: 'border-l-emerald-600', badge: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  'U pripremi': { edge: 'border-l-yellow-500', badge: 'border-yellow-300 bg-yellow-50 text-yellow-800' },
  Poslano: { edge: 'border-l-sky-600', badge: 'border-sky-300 bg-sky-50 text-sky-800' },
  Isporuceno: { edge: 'border-l-olive', badge: 'border-olive/40 bg-[#eff0e8] text-olive-deep' },
  Otkazano: { edge: 'border-l-red-600', badge: 'border-red-300 bg-red-50 text-red-800' },
}

const FILTERS: { key: FilterKey; label: string; match: (status: Status) => boolean }[] = [
  { key: 'all', label: 'Sve', match: () => true },
  { key: 'new', label: 'Nove', match: status => status === 'Novo' },
  { key: 'progress', label: 'U obradi', match: status => status === 'Potvrdeno' || status === 'U pripremi' },
  { key: 'sent', label: 'Poslano', match: status => status === 'Poslano' },
  { key: 'done', label: 'Isporuceno', match: status => status === 'Isporuceno' },
  { key: 'cancelled', label: 'Otkazano', match: status => status === 'Otkazano' },
]

function describe(cause: unknown) {
  return cause instanceof Error ? cause.message : 'nepoznata greska'
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', ...init.headers },
  })
  const body = await response.json().catch(() => ({})) as T & { error?: string }
  if (!response.ok) throw new Error(body.error ?? 'Greska ' + response.status + '.')
  return body
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('bs-BA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}

function readOrder(order: Order) {
  const empty: Customer = { name: '', phone: '', city: '', address: '', note: '', email: '' }
  let customer: Customer = empty
  try { customer = { ...empty, ...(JSON.parse(order.customerJson) as Partial<Customer>) } } catch { customer = empty }
  let items: Item[] = []
  try { items = JSON.parse(order.itemsJson) as Item[] } catch { items = [] }
  return { customer, items }
}

function mailtoHref(reference: string, customer: Customer, code: string) {
  const subject = 'BioHerbica - pracenje narudzbe ' + reference
  const body = [
    'Postovani ' + (customer.name || 'kupce') + ',',
    '',
    'Vasa narudzba ' + reference + ' je predata posti.',
    'Kod za pracenje posiljke: ' + code,
    '',
    'BioHerbica',
  ].join('\n')
  return 'mailto:' + encodeURIComponent(customer.email) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [query, setQuery] = useState('')
  const [mailPanel, setMailPanel] = useState<string | null>(null)
  const [codeDraft, setCodeDraft] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api<{ results: Order[] }>('/api/admin/orders')
      setOrders(result.results ?? [])
      setError('')
    } catch (cause) {
      setError(describe(cause))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const counts = useMemo(() => {
    const result: Record<FilterKey, number> = { all: orders.length, new: 0, progress: 0, sent: 0, done: 0, cancelled: 0 }
    for (const order of orders) {
      for (const entry of FILTERS) {
        if (entry.key !== 'all' && entry.match(order.status)) result[entry.key] += 1
      }
    }
    return result
  }, [orders])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const active = FILTERS.find(entry => entry.key === filter)
    return orders.filter(order => {
      if (active && !active.match(order.status)) return false
      if (!needle) return true
      const { customer } = readOrder(order)
      const haystack = [order.reference, customer.name, customer.phone, customer.email, customer.city].join(' ').toLowerCase()
      return haystack.includes(needle)
    })
  }, [orders, filter, query])

  async function updateStatus(order: Order, status: Status) {
    setBusy(order.reference); setError(''); setNotice('')
    try {
      await api('/api/admin/orders/' + encodeURIComponent(order.reference), { method: 'PATCH', body: JSON.stringify({ status }) })
      setNotice(order.reference + ': status je sada "' + status + '".')
      await load()
    } catch (cause) {
      setError(describe(cause))
    } finally {
      setBusy('')
    }
  }

  async function saveDelivery(order: Order, charge: number) {
    setBusy(order.reference); setError(''); setNotice('')
    try {
      await api('/api/admin/orders/' + encodeURIComponent(order.reference), { method: 'PATCH', body: JSON.stringify({ status: order.status, deliveryCharge: charge }) })
      setNotice(order.reference + ': dostava je upisana.')
      await load()
    } catch (cause) {
      setError(describe(cause))
    } finally {
      setBusy('')
    }
  }

  async function saveCode(order: Order) {
    const code = (codeDraft[order.reference] ?? order.trackingCode ?? '').trim()
    setBusy(order.reference); setError(''); setNotice('')
    try {
      await api('/api/admin/orders/' + encodeURIComponent(order.reference), { method: 'PATCH', body: JSON.stringify({ status: order.status, trackingCode: code }) })
      setNotice(order.reference + ': kod pracenja je sacuvan.')
      await load()
    } catch (cause) {
      setError(describe(cause))
    } finally {
      setBusy('')
    }
  }

  async function sendEmail(order: Order) {
    const code = (codeDraft[order.reference] ?? order.trackingCode ?? '').trim()
    if (!code) { setError('Unesite kod pracenja koji ste dobili od poste.'); return }
    setBusy(order.reference); setError(''); setNotice('')
    try {
      const result = await api<{ sentTo: string }>('/api/admin/orders/' + encodeURIComponent(order.reference) + '/email', { method: 'POST', body: JSON.stringify({ trackingCode: code }) })
      setNotice('Email s kodom pracenja poslan je na ' + result.sentTo + '.')
      await load()
    } catch (cause) {
      setError(describe(cause))
    } finally {
      setBusy('')
    }
  }

  async function remove(order: Order) {
    if (!window.confirm('Obrisati narudzbu ' + order.reference + '? Ova radnja se ne moze ponistiti.')) return
    setBusy(order.reference); setError(''); setNotice('')
    try {
      await api('/api/admin/orders/' + encodeURIComponent(order.reference), { method: 'DELETE' })
      setNotice(order.reference + ': narudzba je obrisana.')
      await load()
    } catch (cause) {
      setError(describe(cause))
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[27px] leading-none">Narudzbe</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">Kontakt i adresa kupaca vidljivi su samo u ovoj zasticenoj sesiji. Status mijenjajte kad god se promijeni stanje posiljke.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          {loading ? <><Loader2 className="size-4 animate-spin" /> Ucitavanje</> : <>{orders.length} narudzbi ukupno</>}
        </div>
      </div>

      {error && <p role="alert" className="mt-4 border-l-2 border-red-700 bg-red-50 p-3 text-[12px] text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-4 border-l-2 border-olive bg-[#eff0e8] p-3 text-[12px] text-olive-deep">{notice}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map(entry => (
          <button
            key={entry.key}
            type="button"
            aria-pressed={filter === entry.key}
            onClick={() => setFilter(entry.key)}
            className={'min-h-10 border px-3 text-[11px] ' + (filter === entry.key ? 'border-olive bg-olive-deep text-white' : 'border-line-strong text-muted hover:text-fg')}
          >
            {entry.label} ({counts[entry.key]})
          </button>
        ))}
      </div>

      <div className="relative mt-3 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Trazi po referenci, imenu, telefonu ili emailu" className={inputClass + ' pl-9'} />
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 text-[12px] text-muted">{orders.length === 0 ? 'Jos nema narudzbi.' : 'Nema narudzbi za ovaj filter.'}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {visible.map(order => {
            const { customer, items } = readOrder(order)
            const style = STATUS_STYLE[order.status]
            const code = codeDraft[order.reference] ?? order.trackingCode ?? ''
            const working = busy === order.reference
            return (
              <li key={order.reference} className={'border border-line border-l-4 bg-white p-4 sm:p-5 ' + style.edge}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[24px] leading-none">{order.reference}</p>
                      <span className={'inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] ' + style.badge}>{order.status}</span>
                      {order.trackingCode && <span className="inline-flex items-center gap-1 border border-line px-2 py-0.5 text-[10px] text-muted"><Truck className="size-3" /> {order.trackingCode}</span>}
                    </div>
                    <p className="mt-1 text-[10px] text-muted">{formatDate(order.createdAt)} - {order.paymentMethod}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-[10px] text-muted">Status
                      <select
                        value={order.status}
                        disabled={working}
                        onChange={event => void updateStatus(order, event.target.value as Status)}
                        className="ml-2 h-10 border border-line-strong bg-bg px-2 text-[11px] text-fg"
                      >
                        {STATUSES.map(status => <option key={status}>{status}</option>)}
                      </select>
                    </label>
                    {order.status === 'Otkazano' && (
                      <button
                        type="button"
                        onClick={() => void remove(order)}
                        disabled={working}
                        title={'Obrisi narudzbu ' + order.reference}
                        aria-label={'Obrisi narudzbu ' + order.reference}
                        className="grid size-10 place-items-center border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 border-t border-line pt-4 md:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[.14em] text-olive">Kupac</p>
                    <p className="mt-2 break-words text-[12px] font-medium">{customer.name} - {customer.phone}</p>
                    <p className="mt-1 break-words text-[11px] text-muted">{customer.address}, {customer.city}</p>
                    {customer.email ? <p className="mt-1 break-words text-[11px] text-muted">{customer.email}</p> : <p className="mt-1 text-[11px] text-muted">Kupac nije ostavio email.</p>}
                    {customer.note && <p className="mt-2 text-[11px] text-muted">Napomena: {customer.note}</p>}

                    <div className="mt-3 border-t border-line pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setMailPanel(mailPanel === order.reference ? null : order.reference)}
                          disabled={!customer.email}
                        >
                          <Mail className="size-4" /> Posalji email pracenja narudzbe
                        </Button>
                      </div>
                      {!customer.email && <p className="mt-2 text-[10px] text-muted">Dugme se aktivira kada narudzba ima email kupca.</p>}
                      {mailPanel === order.reference && customer.email && (
                        <div className="mt-3 border border-line bg-bg p-3">
                          <p className="text-[10px] uppercase tracking-[.14em] text-olive">Kod pracenja posiljke</p>
                          <p className="mt-1 text-[10px] leading-relaxed text-muted">Upisite kod koji ste dobili od poste. Kod se cuva uz narudzbu i ide u email kupcu.</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <input
                              value={code}
                              onChange={event => setCodeDraft(current => ({ ...current, [order.reference]: event.target.value }))}
                              placeholder="npr. RR123456789BA"
                              className="h-10 min-w-0 flex-1 border border-line-strong bg-white px-2 text-[11px]"
                            />
                            <Button variant="secondary" size="sm" onClick={() => void saveCode(order)} disabled={working}><Check className="size-4" /> Sacuvaj kod</Button>
                            <Button size="sm" onClick={() => void sendEmail(order)} loading={working} disabled={!code.trim()}><Send className="size-4" /> Posalji email</Button>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[10px] text-muted">{order.trackingSentAt ? 'Email poslan: ' + formatDate(order.trackingSentAt) : 'Email jos nije poslan.'}</p>
                            <a href={mailtoHref(order.reference, customer, code)} className="text-[10px] text-muted underline underline-offset-4 hover:text-fg">Posalji iz svog mejla</a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[.14em] text-olive">Stavke</p>
                    {items.map((item, index) => (
                      <p key={order.reference + '-' + index} className="mt-1 flex justify-between gap-3 text-[11px]">
                        <span>{item.name} x {item.quantity}</span><span>{money(item.lineTotal)}</span>
                      </p>
                    ))}
                    <p className="mt-3 border-t border-line pt-2 text-[11px]">Meduzbir: <strong>{money(order.subtotal)}</strong></p>
                    <label className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted">Dostava (KM)
                      <input
                        aria-label={'Iznos dostave za ' + order.reference}
                        type="number"
                        min="0"
                        max="10000"
                        step="1"
                        defaultValue={order.deliveryCharge ?? ''}
                        placeholder="Dogovori s kupcem"
                        className="h-10 w-32 border border-line-strong bg-bg px-2 text-[11px]"
                        onBlur={event => {
                          const value = event.currentTarget.value.trim()
                          if (!value) return
                          const parsed = Number(value)
                          if (Number.isFinite(parsed) && parsed >= 0 && parsed !== order.deliveryCharge) void saveDelivery(order, Math.round(parsed))
                        }}
                      />
                    </label>
                    <p className="mt-1 text-[11px] font-medium">{order.total === null ? 'Konacni iznos ceka potvrdu dostave' : 'Ukupno: ' + money(order.total)}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
