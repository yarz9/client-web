import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AlertTriangle, Check, ImageOff, Loader2, LogOut, Package, RefreshCw, Search, Send, ShoppingCart, Star, X } from 'lucide-react'

import { Button, Container, inputClass } from '../components/ui'
import { money } from '../lib/cart'
import { Admin as AdminPanel } from './Admin'

type Status = 'Novo' | 'Potvrđeno' | 'U pripremi' | 'Poslano' | 'Isporučeno' | 'Otkazano'

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
}

type ManagedProduct = {
  id: number
  slug: string
  name: string
  price: number | null
  size: string | null
  category: string | null
  image: string | null
  short: string | null
  verificationStatus: 'awaiting_confirmation' | 'verified'
  available: boolean
  featured: boolean
  referencePrice: number | null
}

type Filter = 'all' | 'available' | 'out' | 'awaiting' | 'nophoto' | 'featured'
type Tab = 'overview' | 'products' | 'orders' | 'requests' | 'panel'

const statuses: Status[] = ['Novo', 'Potvrđeno', 'U pripremi', 'Poslano', 'Isporučeno', 'Otkazano']
const WEBHOOK_KEY = 'bioherbica:discord-webhook'

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: { ...(init.body instanceof FormData ? {} : { 'content-type': 'application/json' }), ...init.headers },
  })
  const body = await response.json().catch(() => ({})) as T & { error?: string }
  if (!response.ok) throw new Error(body.error ?? 'Zahtjev nije uspio.')
  return body
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('bs-BA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}

function Stat({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: 'warn' | 'good' | 'bad' }) {
  const toneClass = tone === 'warn'
    ? 'border-amber-300 bg-amber-50'
    : tone === 'bad'
      ? 'border-red-300 bg-red-50'
      : tone === 'good'
        ? 'border-olive/40 bg-[#eff0e8]'
        : 'border-line bg-white'
  return (
    <div className={`border p-4 ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-[.14em] text-olive">{label}</p>
      <p className="font-display mt-2 text-[30px] leading-none">{value}</p>
      {hint && <p className="mt-2 text-[10px] leading-relaxed text-muted">{hint}</p>}
    </div>
  )
}

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const toneClass = tone === 'good'
    ? 'border-olive/40 bg-[#eff0e8] text-olive-deep'
    : tone === 'warn'
      ? 'border-amber-300 bg-amber-50 text-amber-900'
      : tone === 'bad'
        ? 'border-red-300 bg-red-50 text-red-800'
        : 'border-line text-muted'
  return <span className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] ${toneClass}`}>{children}</span>
}

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [products, setProducts] = useState<ManagedProduct[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [priceDraft, setPriceDraft] = useState<Record<number, string>>({})
  const [webhook, setWebhook] = useState('')
  const [webhookDraft, setWebhookDraft] = useState('')
  const [requestKind, setRequestKind] = useState('Izmjena teksta')
  const [requestText, setRequestText] = useState('')
  const [sending, setSending] = useState(false)
  const [lastSent, setLastSent] = useState('')

  const loadAll = useCallback(async () => {
    setBusy(true)
    setError('')
    try {
      const [productBody, orderBody] = await Promise.all([
        api<{ results: ManagedProduct[] }>('/api/admin/products'),
        api<{ results: Order[] }>('/api/admin/orders'),
      ])
      setProducts(productBody.results ?? [])
      setOrders(orderBody.results ?? [])
      setAuthenticated(true)
    } catch (cause) {
      setAuthenticated(false)
      setError(cause instanceof Error ? cause.message : 'Podaci nisu dostupni.')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    try {
      const saved = window.localStorage.getItem(WEBHOOK_KEY)
      if (saved) { setWebhook(saved); setWebhookDraft(saved) }
    } catch {
      // Private mode without storage: the webhook can still be pasted for this session.
    }
    void (async () => {
      try {
        await api('/api/admin/session')
        if (active) await loadAll()
      } catch {
        // No session yet: show the login form.
      } finally {
        if (active) setChecking(false)
      }
    })()
    return () => { active = false }
  }, [loadAll])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      await api('/api/admin/session', { method: 'POST', body: JSON.stringify({ username: credentials.username, password: credentials.password }) })
      setCredentials({ username: '', password: '' })
      await loadAll()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Prijava nije uspjela.')
      setBusy(false)
    }
  }

  async function logout() {
    await api('/api/admin/session', { method: 'DELETE' }).catch(() => undefined)
    setAuthenticated(false); setProducts([]); setOrders([])
  }

  async function patchProduct(product: ManagedProduct, changes: Record<string, unknown>) {
    setError(''); setNotice('')
    try {
      await api(`/api/admin/products/${product.id}`, { method: 'PATCH', body: JSON.stringify(changes) })
      setNotice(`${product.name}: promjena je sačuvana.`)
      await loadAll()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Promjena nije sačuvana.')
    }
  }

  function toggleAvailable(product: ManagedProduct) {
    if (!product.available && (product.price === null || product.verificationStatus !== 'verified')) {
      setNotice('')
      setError(`„${product.name}“ mora imati potvrđenu cijenu i status „Potvrđeno“ prije nego ga pustite u prodaju.`)
      return
    }
    void patchProduct(product, { available: !product.available })
  }

  function savePrice(product: ManagedProduct) {
    const raw = (priceDraft[product.id] ?? '').trim()
    const parsed = raw === '' ? null : Number(raw)
    if (parsed !== null && (!Number.isFinite(parsed) || parsed < 0)) {
      setError('Cijena mora biti cijeli broj u KM.')
      return
    }
    void patchProduct(product, { price: parsed === null ? null : Math.round(parsed) })
    setPriceDraft(current => {
      const next = { ...current }
      delete next[product.id]
      return next
    })
  }

  async function updateOrderStatus(order: Order, status: Status) {
    setError(''); setNotice('')
    try {
      await api(`/api/admin/orders/${encodeURIComponent(order.reference)}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setNotice(`${order.reference}: status je ažuriran na „${status}“.`)
      await loadAll()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Status nije sačuvan.')
    }
  }

  async function updateDelivery(order: Order, charge: number) {
    setError(''); setNotice('')
    try {
      await api(`/api/admin/orders/${encodeURIComponent(order.reference)}`, { method: 'PATCH', body: JSON.stringify({ status: order.status, deliveryCharge: charge }) })
      setNotice(`${order.reference}: dostava je upisana.`)
      await loadAll()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Iznos dostave nije sačuvan.')
    }
  }

  function saveWebhook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = webhookDraft.trim()
    if (value && !/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//i.test(value)) {
      setError('Webhook URL treba da počinje sa https://discord.com/api/webhooks/')
      return
    }
    try {
      if (value) window.localStorage.setItem(WEBHOOK_KEY, value)
      else window.localStorage.removeItem(WEBHOOK_KEY)
    } catch {
      // Storage may be blocked; the value still works until the page is closed.
    }
    setWebhook(value); setWebhookDraft(value); setError('')
    setNotice(value ? 'Webhook je sačuvan u ovom pregledniku.' : 'Webhook je uklonjen.')
  }

  async function postToDiscord(title: string, text: string) {
    const url = webhook.trim()
    if (!url) throw new Error('Prvo sačuvajte Discord webhook URL.')
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: 'BioHerbica · zahtjevi',
        embeds: [{
          title,
          description: text.slice(0, 1800),
          color: 4894528,
          timestamp: new Date().toISOString(),
          footer: { text: 'Poslano iz admin panela' },
        }],
      }),
    })
    if (!response.ok) throw new Error(`Discord je odgovorio sa ${response.status}. Provjerite da webhook nije obrisan.`)
  }

  async function sendRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (requestText.trim().length < 3) {
      setError('Upišite šta treba promijeniti.')
      return
    }
    setSending(true); setError(''); setNotice('')
    try {
      const openOrders = orders.filter(order => order.status === 'Novo').length
      const text = `${requestText.trim()}\n\n— ${products.length} proizvoda u katalogu, ${openOrders} novih narudžbi, ${formatDate(new Date().toISOString())}`
      await postToDiscord(requestKind, text)
      setNotice('Zahtjev je poslan na Discord.')
      setLastSent(new Date().toISOString())
      setRequestText('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Zahtjev nije poslan.')
    } finally {
      setSending(false)
    }
  }

  async function sendTest() {
    setSending(true); setError(''); setNotice('')
    try {
      await postToDiscord('Testna poruka', 'Ako ovo vidite u Discordu, webhook radi.')
      setNotice('Testna poruka je poslana na Discord.')
      setLastSent(new Date().toISOString())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Test nije poslan.')
    } finally {
      setSending(false)
    }
  }

  const stats = useMemo(() => {
    const now = new Date()
    const monthOrders = orders.filter(order => {
      const date = new Date(order.createdAt)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    return {
      total: products.length,
      available: products.filter(product => product.available).length,
      out: products.filter(product => !product.available).length,
      awaiting: products.filter(product => product.verificationStatus !== 'verified').length,
      noPhoto: products.filter(product => !product.image).length,
      featured: products.filter(product => product.featured).length,
      newOrders: orders.filter(order => order.status === 'Novo').length,
      openOrders: orders.filter(order => order.status !== 'Isporučeno' && order.status !== 'Otkazano').length,
      monthOrders: monthOrders.length,
      monthValue: monthOrders.filter(order => order.status !== 'Otkazano').reduce((sum, order) => sum + (order.total ?? order.subtotal), 0),
    }
  }, [products, orders])

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter(product => {
      if (filter === 'available' && !product.available) return false
      if (filter === 'out' && product.available) return false
      if (filter === 'awaiting' && product.verificationStatus === 'verified') return false
      if (filter === 'nophoto' && product.image) return false
      if (filter === 'featured' && !product.featured) return false
      if (!needle) return true
      return `${product.name} ${product.slug} ${product.category ?? ''}`.toLowerCase().includes(needle)
    })
  }, [products, filter, query])

  if (checking) {
    return (
      <Container className="pb-24 pt-16">
        <p className="flex items-center gap-2 text-[12px] text-muted"><Loader2 className="size-4 animate-spin" /> Provjera prijave…</p>
      </Container>
    )
  }

  if (!authenticated) {
    return (
      <Container className="pb-24 pt-16">
        <div className="mx-auto max-w-md border border-line bg-white p-7 sm:p-10">
          <p className="text-[10px] uppercase tracking-[.18em] text-olive">BioHerbica · upravljanje</p>
          <h1 className="font-display mt-4 text-[43px] leading-none">Administratorska prijava</h1>
          <p className="mt-4 text-[12px] leading-relaxed text-muted">Prijavite se za pregled kataloga, stanja, narudžbi i zahtjeva za izmjene.</p>
          <form className="mt-6 flex flex-col gap-3" onSubmit={login}>
            <label className="flex flex-col gap-1 text-[11px]">Korisničko ime
              <input autoComplete="username" required value={credentials.username} onChange={event => setCredentials(current => ({ ...current, username: event.target.value }))} className={inputClass} placeholder="bioadmin" />
            </label>
            <label className="flex flex-col gap-1 text-[11px]">Lozinka
              <input type="password" autoComplete="current-password" required minLength={8} value={credentials.password} onChange={event => setCredentials(current => ({ ...current, password: event.target.value }))} className={inputClass} placeholder="Lozinka" />
            </label>
            <Button type="submit" loading={busy} className="w-full">Prijavite se</Button>
          </form>
          {error && <p role="alert" className="mt-4 text-[12px] text-red-700">{error}</p>}
        </div>
      </Container>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Pregled' },
    { key: 'products', label: `Proizvodi (${products.length})` },
    { key: 'orders', label: `Narudžbe (${orders.length})` },
    { key: 'requests', label: 'Zahtjevi' },
    { key: 'panel', label: 'Uređivanje' },
  ]

  const tabBar = (
    <nav aria-label="Administratorski odjeljci" className="flex flex-wrap gap-2 border-b border-line pb-4">
      {tabs.map(item => (
        <button
          key={item.key}
          type="button"
          aria-pressed={tab === item.key}
          onClick={() => setTab(item.key)}
          className={`min-h-10 border px-4 text-[12px] ${tab === item.key ? 'border-olive bg-olive-deep text-white' : 'border-line-strong text-muted hover:text-fg'}`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )

  if (tab === 'panel') {
    return (
      <div>
        <div className="mx-auto w-full max-w-[1280px] px-5 pt-8 sm:px-8">
          <button type="button" onClick={() => setTab('overview')} className="mb-4 inline-flex items-center gap-2 text-[12px] text-muted hover:text-fg">
            <X className="size-4" /> Natrag na pregled
          </button>
          {tabBar}
        </div>
        <AdminPanel />
      </div>
    )
  }

  return (
    <Container className="pb-24 pt-8 sm:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[.18em] text-olive">BioHerbica · nadzorna tabla</p>
          <h1 className="font-display mt-3 text-[45px] leading-none sm:text-[49px]">Pregled</h1>
          <p className="mt-3 text-[12px] text-muted">{formatDate(new Date().toISOString())} · prijavljeni ste kao administrator</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => void loadAll()} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Osvježi
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void logout()}><LogOut className="size-4" /> Odjava</Button>
        </div>
      </div>

      <div className="mt-5">{tabBar}</div>

      {error && <p role="alert" className="mt-5 border-l-2 border-red-700 bg-red-50 p-3 text-[12px] text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-5 border-l-2 border-olive bg-[#eff0e8] p-3 text-[12px] text-olive-deep">{notice}</p>}

      {tab === 'overview' && (
        <section className="mt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Ukupno proizvoda" value={stats.total} hint={`${stats.featured} istaknuto na naslovnoj`} />
            <Stat label="Dostupno" value={stats.available} tone="good" hint="Može se naručiti sa sajta" />
            <Stat label="Nije dostupno" value={stats.out} tone={stats.out > 0 ? 'warn' : undefined} hint="Skriveno iz prodaje dok se ne potvrdi" />
            <Stat label="Čeka potvrdu" value={stats.awaiting} tone={stats.awaiting > 0 ? 'warn' : undefined} hint="Nema potvrđenu cijenu ili opis" />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Nove narudžbe" value={stats.newOrders} tone={stats.newOrders > 0 ? 'bad' : undefined} hint="Status „Novo“, čekaju potvrdu" />
            <Stat label="Otvorene narudžbe" value={stats.openOrders} hint="Nisu isporučene ni otkazane" />
            <Stat label="Ovaj mjesec" value={stats.monthOrders} hint={`Vrijednost ${money(stats.monthValue)}`} />
            <Stat label="Bez fotografije" value={stats.noPhoto} tone={stats.noPhoto > 0 ? 'warn' : undefined} hint="Prikazuje se „Fotografija stiže“" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
            <div className="border border-line bg-white p-5 sm:p-6">
              <h2 className="font-display text-[27px]">Na šta obratiti pažnju</h2>
              <ul className="mt-4 flex flex-col gap-2">
                <li>
                  <button type="button" onClick={() => { setTab('orders'); }} className="flex w-full items-center justify-between gap-3 border border-line p-3 text-left text-[12px] hover:border-fg">
                    <span className="flex items-center gap-2"><ShoppingCart className="size-4 text-olive" /> Nove narudžbe koje čekaju potvrdu</span>
                    <Pill tone={stats.newOrders > 0 ? 'bad' : 'good'}>{stats.newOrders}</Pill>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setTab('products'); setFilter('nophoto') }} className="flex w-full items-center justify-between gap-3 border border-line p-3 text-left text-[12px] hover:border-fg">
                    <span className="flex items-center gap-2"><ImageOff className="size-4 text-olive" /> Proizvodi bez fotografije</span>
                    <Pill tone={stats.noPhoto > 0 ? 'warn' : 'good'}>{stats.noPhoto}</Pill>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setTab('products'); setFilter('awaiting') }} className="flex w-full items-center justify-between gap-3 border border-line p-3 text-left text-[12px] hover:border-fg">
                    <span className="flex items-center gap-2"><AlertTriangle className="size-4 text-olive" /> Proizvodi koji čekaju potvrdu podataka</span>
                    <Pill tone={stats.awaiting > 0 ? 'warn' : 'good'}>{stats.awaiting}</Pill>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setTab('products'); setFilter('out') }} className="flex w-full items-center justify-between gap-3 border border-line p-3 text-left text-[12px] hover:border-fg">
                    <span className="flex items-center gap-2"><Package className="size-4 text-olive" /> Proizvodi van prodaje</span>
                    <Pill tone={stats.out > 0 ? 'warn' : 'good'}>{stats.out}</Pill>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setTab('requests') }} className="flex w-full items-center justify-between gap-3 border border-line p-3 text-left text-[12px] hover:border-fg">
                    <span className="flex items-center gap-2"><Send className="size-4 text-olive" /> Zahtjev za izmjenu sajta</span>
                    <Pill tone={webhook ? 'good' : 'warn'}>{webhook ? 'Discord povezan' : 'Discord nije podešen'}</Pill>
                  </button>
                </li>
              </ul>
            </div>

            <div className="border border-line bg-white p-5 sm:p-6">
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-display text-[27px]">Zadnje narudžbe</h2>
                <button type="button" onClick={() => setTab('orders')} className="text-[11px] text-muted underline underline-offset-4 hover:text-fg">Sve</button>
              </div>
              {orders.length === 0 ? (
                <p className="mt-4 text-[12px] text-muted">Još nema narudžbi.</p>
              ) : (
                <ul className="mt-4 flex flex-col gap-2">
                  {orders.slice(0, 5).map(order => {
                    let customerName = ''
                    try { customerName = (JSON.parse(order.customerJson) as { name?: string }).name ?? '' } catch { customerName = '' }
                    return (
                      <li key={order.reference} className="flex items-center justify-between gap-3 border-b border-line pb-2 text-[11px]">
                        <span className="min-w-0 truncate">{order.reference} · {customerName || 'Kupac'}</span>
                        <span className="shrink-0 text-muted">{money(order.total ?? order.subtotal)}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {tab === 'products' && (
        <section className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Traži po nazivu, kategoriji ili slug-u" className={`${inputClass} pl-9`} />
            </div>
            {([['all', 'Svi'], ['available', 'Dostupni'], ['out', 'Van prodaje'], ['awaiting', 'Na potvrdi'], ['nophoto', 'Bez slike'], ['featured', 'Istaknuti']] as const).map(([key, label]) => (
              <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`min-h-10 border px-3 text-[11px] ${filter === key ? 'border-olive bg-olive-deep text-white' : 'border-line-strong text-muted hover:text-fg'}`}>
                {label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-muted">Prikazano {visibleProducts.length} od {products.length} proizvoda. Cijena se mijenja odmah, a dostupnost se ne može uključiti bez potvrđene cijene.</p>

          <ul className="mt-4 flex flex-col gap-2">
            {visibleProducts.map(product => {
              const draft = priceDraft[product.id]
              const priceValue = draft !== undefined ? draft : (product.price === null ? '' : String(product.price))
              const changed = draft !== undefined && draft !== (product.price === null ? '' : String(product.price))
              return (
                <li key={product.id} className="border border-line bg-white p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-medium">{product.name}</p>
                        {product.available ? <Pill tone="good"><Check className="size-3" /> Dostupan</Pill> : <Pill tone="warn">Van prodaje</Pill>}
                        {product.verificationStatus === 'verified' ? <Pill tone="good">Potvrđeno</Pill> : <Pill tone="warn">Na potvrdi</Pill>}
                        {product.featured && <Pill><Star className="size-3" /> Istaknut</Pill>}
                        {!product.image && <Pill tone="warn"><ImageOff className="size-3" /> Bez slike</Pill>}
                      </div>
                      <p className="mt-1 break-words text-[10px] text-muted">{product.category ?? 'Bez kategorije'} · {product.size ?? 'bez veličine'} · /{product.slug}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          aria-label={`Cijena za ${product.name}`}
                          value={priceValue}
                          onChange={event => setPriceDraft(current => ({ ...current, [product.id]: event.target.value }))}
                          className="h-10 w-24 border border-line-strong bg-bg px-2 text-[12px]"
                          placeholder="nema"
                        />
                        <span className="text-[10px] text-muted">KM</span>
                        <Button variant="secondary" size="sm" onClick={() => savePrice(product)} disabled={!changed}><Check className="size-4" /> Cijena</Button>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => toggleAvailable(product)}>
                        {product.available ? 'Sakrij iz prodaje' : 'Pusti u prodaju'}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => void patchProduct(product, { featured: !product.featured })}>
                        <Star className="size-4" /> {product.featured ? 'Skini sa naslovne' : 'Istakni'}
                      </Button>
                      {product.verificationStatus !== 'verified' && (
                        <Button variant="secondary" size="sm" onClick={() => void patchProduct(product, { verificationStatus: 'verified' })}>
                          <Check className="size-4" /> Potvrdi
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          {visibleProducts.length === 0 && <p className="mt-6 text-[12px] text-muted">Nema proizvoda za ovaj filter.</p>}
        </section>
      )}

      {tab === 'orders' && (
        <section className="mt-6">
          <p className="text-[11px] leading-relaxed text-muted">Kontakt i adresa kupaca vidljivi su samo u ovoj zaštićenoj sesiji. Dostava ostaje nepoznata dok je ne dogovorite sa kupcem.</p>
          {orders.length === 0 ? (
            <p className="mt-6 text-[12px] text-muted">Nema narudžbi za prikaz.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {orders.map(order => {
                let customer = { name: '', phone: '', city: '', address: '', note: '', email: '' }
                let items: { name: string; quantity: number; lineTotal: number }[] = []
                try { customer = { ...customer, ...(JSON.parse(order.customerJson) as typeof customer) } } catch { /* keep defaults */ }
                try { items = JSON.parse(order.itemsJson) as typeof items } catch { items = [] }
                return (
                  <li key={order.reference} className="border border-line bg-white p-4 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-[24px] leading-none">{order.reference}</p>
                        <p className="mt-1 text-[10px] text-muted">{formatDate(order.createdAt)} · {order.paymentMethod}</p>
                      </div>
                      <label className="text-[10px] text-muted">Status
                        <select value={order.status} onChange={event => void updateOrderStatus(order, event.target.value as Status)} className="ml-2 h-10 border border-line-strong bg-bg px-2 text-[11px] text-fg">
                          {statuses.map(status => <option key={status}>{status}</option>)}
                        </select>
                      </label>
                    </div>

                    <div className="mt-4 grid gap-4 border-t border-line pt-4 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-[.14em] text-olive">Kupac</p>
                        <p className="mt-2 break-words text-[12px] font-medium">{customer.name} · {customer.phone}</p>
                        <p className="mt-1 break-words text-[11px] text-muted">{customer.address}, {customer.city}</p>
                        {customer.email && <p className="mt-1 break-words text-[11px] text-muted">{customer.email}</p>}
                        {customer.note && <p className="mt-2 text-[11px] text-muted">Napomena: {customer.note}</p>}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[.14em] text-olive">Stavke</p>
                        {items.map((item, index) => (
                          <p key={`${order.reference}-${index}`} className="mt-1 flex justify-between gap-3 text-[11px]">
                            <span>{item.name} × {item.quantity}</span><span>{money(item.lineTotal)}</span>
                          </p>
                        ))}
                        <p className="mt-3 border-t border-line pt-2 text-[11px]">Međuzbir: <strong>{money(order.subtotal)}</strong></p>
                        <label className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted">Dostava (KM)
                          <input
                            aria-label={`Iznos dostave za ${order.reference}`}
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
                              if (Number.isFinite(parsed) && parsed >= 0 && parsed !== order.deliveryCharge) void updateDelivery(order, Math.round(parsed))
                            }}
                          />
                        </label>
                        <p className="mt-1 text-[11px] font-medium">{order.total === null ? 'Konačni iznos čeka potvrdu dostave' : `Ukupno: ${money(order.total)}`}</p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      {tab === 'requests' && (
        <section className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,.85fr)]">
          <form onSubmit={sendRequest} className="border border-line bg-white p-5 sm:p-6">
            <h2 className="font-display text-[27px]">Zatražite izmjenu</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">Zahtjev ide direktno na Discord i tamo dobijate odgovor. Što je opis precizniji (koji proizvod, koja cijena, koji tekst), brže je riješeno.</p>
            <div className="mt-4 grid gap-3">
              <label className="text-[11px]">Vrsta zahtjeva
                <select value={requestKind} onChange={event => setRequestKind(event.target.value)} className={`${inputClass} mt-1`}>
                  <option>Izmjena teksta</option>
                  <option>Novi proizvod</option>
                  <option>Cijena proizvoda</option>
                  <option>Fotografija</option>
                  <option>Problem na sajtu</option>
                  <option>Ostalo</option>
                </select>
              </label>
              <label className="text-[11px]">Šta treba uraditi
                <textarea required rows={5} value={requestText} onChange={event => setRequestText(event.target.value)} className={`${inputClass} mt-1 h-auto py-3`} placeholder="npr. Dodati proizvod Čaj od nane, 200 g, 9 KM, opis u prilogu…" />
              </label>
              <Button type="submit" loading={sending} className="w-fit"><Send className="size-4" /> Pošalji na Discord</Button>
              <p className="text-[10px] text-muted">{lastSent ? `Zadnje poslano: ${formatDate(lastSent)}` : 'Još nema poslanih zahtjeva iz ovog preglednika.'}</p>
            </div>
          </form>

          <div className="border border-line bg-white p-5 sm:p-6">
            <h2 className="font-display text-[27px]">Discord veza</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">Webhook se podešava jednom u ovom pregledniku i ne stoji u kodu sajta, pa ga niko sa strane ne može zloupotrijebiti.</p>
            <form onSubmit={saveWebhook} className="mt-4 grid gap-3">
              <label className="text-[11px]">Webhook URL
                <input value={webhookDraft} onChange={event => setWebhookDraft(event.target.value)} className={`${inputClass} mt-1`} placeholder="https://discord.com/api/webhooks/…" />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="secondary" size="sm">Sačuvaj webhook</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => void sendTest()} loading={sending}>Pošalji test</Button>
              </div>
              <p className="text-[10px] leading-relaxed text-muted">{webhook ? 'Webhook je podešen u ovom pregledniku.' : 'Webhook još nije podešen.'} Poruke idu u Discord kanal; odgovor pišete u Discordu.</p>
            </form>
          </div>
        </section>
      )}
    </Container>
  )
}
