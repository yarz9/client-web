import { useEffect, useState, type FormEvent } from 'react'
import { Button, Container, inputClass } from '../components/ui'
import { money } from '../lib/cart'
import { useCatalog } from '../lib/catalog'
import { categories as defaultCategories, type Product, type VerificationStatus } from '../../data/products'

type Status = 'Novo' | 'Potvrđeno' | 'U pripremi' | 'Poslano' | 'Isporučeno' | 'Otkazano'
type Order = { reference: string; customerJson: string; itemsJson: string; subtotal: number; deliveryCharge: number | null; total: number | null; paymentMethod: string; status: Status; createdAt: string }
type CategoryRecord = { key: string; label: string; blurb: string | null; number: string | null; sortOrder: number }
type PolicyRecord = { key: string; title: string; content: string; sortOrder: number }
type ManagedProduct = Product & { id: number; sortOrder?: number }
type ProductForm = { slug: string; name: string; price: string; size: string; category: string; image: string; short: string; description: string; details: string; verificationStatus: VerificationStatus; available: boolean; featured: boolean }
const statuses: Status[] = ['Novo', 'Potvrđeno', 'U pripremi', 'Poslano', 'Isporučeno', 'Otkazano']
const blankProduct = (): ProductForm => ({ slug: '', name: '', price: '', size: '', category: '', image: '', short: '', description: '', details: '', verificationStatus: 'awaiting_confirmation', available: false, featured: false })

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { ...init, credentials: 'same-origin', headers: { ...(init.body instanceof FormData ? {} : { 'content-type': 'application/json' }), ...init.headers } })
  const body = await response.json().catch(() => ({})) as T & { error?: string }
  if (!response.ok) throw new Error(body.error ?? 'Zahtjev nije uspio.')
  return body
}

export function Admin() {
  const catalog = useCatalog()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<ManagedProduct[]>([])
  const [categoryRows, setCategoryRows] = useState<CategoryRecord[]>([])
  const [policyRows, setPolicyRows] = useState<PolicyRecord[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [section, setSection] = useState<'orders' | 'products' | 'categories' | 'policies'>('orders')
  const [productForm, setProductForm] = useState<ProductForm>(blankProduct)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [categoryForm, setCategoryForm] = useState({ key: '', label: '', blurb: '', number: '' })
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null)

  async function loadAll() {
    setBusy(true); setError('')
    try {
      const [orderBody, productBody, categoryBody, policyBody] = await Promise.all([
        api<{ results: Order[] }>('/api/admin/orders'),
        api<{ results: ManagedProduct[] }>('/api/admin/products'),
        api<{ results: CategoryRecord[] }>('/api/categories'),
        api<{ results: PolicyRecord[] }>('/api/admin/policies'),
      ])
      setOrders(orderBody.results); setProducts(productBody.results); setCategoryRows(categoryBody.results); setPolicyRows(policyBody.results); setAuthenticated(true)
    } catch (cause) {
      setAuthenticated(false)
      setError(cause instanceof Error ? cause.message : 'Podaci nisu dostupni.')
    } finally { setBusy(false) }
  }

  useEffect(() => {
    let active = true
    void api('/api/admin/session').then(() => { if (active) void loadAll() }).catch(() => undefined)
    return () => { active = false }
  }, [])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      await api('/api/admin/session', { method: 'POST', body: JSON.stringify({ code: adminCode }) })
      setAdminCode(''); await loadAll()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Prijava nije uspjela.'); setBusy(false) }
  }

  async function logout() {
    await api('/api/admin/session', { method: 'DELETE' }).catch(() => undefined)
    setAuthenticated(false); setOrders([]); setProducts([]); setCategoryRows([]); setPolicyRows([])
  }

  async function updateOrder(order: Order, status: Status, deliveryCharge?: number) {
    try {
      await api(`/api/admin/orders/${encodeURIComponent(order.reference)}`, { method: 'PATCH', body: JSON.stringify(deliveryCharge === undefined ? { status } : { status, deliveryCharge }) })
      await loadAll()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Promjena nije sačuvana.') }
  }

  function startEditing(product: ManagedProduct) {
    setEditingId(product.id)
    setProductForm({ slug: product.slug, name: product.name, price: product.price === null ? '' : String(product.price), size: product.size ?? '', category: product.category ?? '', image: product.image ?? '', short: product.short ?? '', description: product.description ?? '', details: product.details.join('\n'), verificationStatus: product.verificationStatus, available: product.available, featured: Boolean(product.featured) })
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    const data = { ...productForm, price: productForm.price === '' ? null : Number(productForm.price), details: productForm.details.split('\n').map(line => line.trim()).filter(Boolean), available: productForm.available && productForm.verificationStatus === 'verified' && productForm.price !== '' }
    try {
      await api(editingId ? `/api/admin/products/${editingId}` : '/api/admin/products', { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify(data) })
      setProductForm(blankProduct()); setEditingId(null); setNotice('Proizvod je sačuvan.'); await catalog.refresh(); await loadAll()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Proizvod nije sačuvan.') } finally { setBusy(false) }
  }

  async function deleteProduct(product: ManagedProduct) {
    if (!window.confirm(`Obrisati proizvod „${product.name}“?`)) return
    try { await api(`/api/admin/products/${product.id}`, { method: 'DELETE' }); setNotice('Proizvod je obrisan.'); await catalog.refresh(); await loadAll() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Proizvod nije obrisan.') }
  }

  async function savePolicy(policy: PolicyRecord) {
    setError(''); setNotice('')
    try {
      await api(`/api/admin/policies/${encodeURIComponent(policy.key)}`, { method: 'PATCH', body: JSON.stringify({ title: policy.title, content: policy.content }) })
      setNotice('Tekst je sačuvan.'); await loadAll()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Tekst nije sačuvan.') }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('')
    try {
      await api(editingCategoryKey ? `/api/admin/categories/${encodeURIComponent(editingCategoryKey)}` : '/api/admin/categories', { method: editingCategoryKey ? 'PATCH' : 'POST', body: JSON.stringify({ ...categoryForm, sortOrder: categoryRows.length }) })
      setCategoryForm({ key: '', label: '', blurb: '', number: '' }); setEditingCategoryKey(null); setNotice('Kategorija je sačuvana.'); await catalog.refresh(); await loadAll()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Kategorija nije sačuvana.') }
  }

  async function deleteCategory(category: CategoryRecord) {
    if (!window.confirm(`Obrisati kategoriju „${category.label}“? Proizvodi će ostati bez kategorije.`)) return
    try { await api(`/api/admin/categories/${encodeURIComponent(category.key)}`, { method: 'DELETE' }); setNotice('Kategorija je obrisana.'); await catalog.refresh(); await loadAll() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Kategorija nije obrisana.') }
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const name = `proizvod-${Date.now()}.${extension}`
    const form = new FormData(); form.set('file', file)
    try {
      const response = await fetch(`/api/admin/images/${encodeURIComponent(name)}`, { method: 'POST', credentials: 'same-origin', body: form })
      const body = await response.json() as { error?: string }
      if (!response.ok) throw new Error(body.error ?? 'Fotografija nije sačuvana.')
      setProductForm(current => ({ ...current, image: `/api/images/${name}` })); setNotice(`Fotografija je sačuvana (${name}); spremite proizvod da primijenite promjenu.`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Fotografija nije sačuvana.') }
    finally { event.currentTarget.value = '' }
  }

  if (!authenticated) return <Container className="pb-24 pt-16"><div className="mx-auto max-w-md border border-line bg-white p-7 sm:p-10"><p className="text-[10px] uppercase tracking-[.18em] text-olive">BioHerbica · upravljanje</p><h1 className="font-display mt-4 text-[43px] leading-none">Administratorska prijava</h1><p className="mt-4 text-[12px] leading-relaxed text-muted">Pristupite upravljanju katalogom i narudžbama sigurnom administratorskom sesijom.</p><form className="mt-6 flex flex-col gap-3" onSubmit={login}><input type="password" autoComplete="current-password" required minLength={12} value={adminCode} onChange={event => setAdminCode(event.target.value)} className={inputClass} aria-label="Administratorska lozinka" placeholder="Administratorska lozinka"/><Button type="submit" loading={busy} className="w-full">Prijavite se</Button></form>{error && <p role="alert" className="mt-4 text-[12px] text-accent">{error}</p>}</div></Container>

  return <Container className="pb-24 pt-10 sm:pt-12">
    <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6"><div><p className="text-[10px] uppercase tracking-[.18em] text-olive">Samo za vlasnicu</p><h1 className="font-display mt-3 text-[45px] sm:text-[49px]">Upravljanje</h1></div><div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => void loadAll()} disabled={busy}>{busy ? 'Učitava se…' : 'Osvježi'}</Button><Button variant="secondary" size="sm" onClick={() => void logout()}>Odjava</Button></div></div>
    <nav aria-label="Administratorski odjeljci" className="mt-5 flex flex-wrap gap-2 border-b border-line pb-4">{([['orders', 'Narudžbe'], ['products', 'Proizvodi'], ['categories', 'Kategorije'], ['policies', 'Uslovi i privatnost']] as const).map(([key, label]) => <button key={key} type="button" aria-pressed={section === key} onClick={() => setSection(key)} className={`min-h-10 border px-4 text-[12px] ${section === key ? 'border-olive bg-olive-deep text-white' : 'border-line-strong text-muted hover:text-fg'}`}>{label}{key === 'orders' ? ` (${orders.length})` : key === 'products' ? ` (${products.length})` : ''}</button>)}</nav>
    {error && <p role="alert" className="mt-5 border-l-2 border-red-700 bg-red-50 p-3 text-[12px] text-red-800">{error}</p>}{notice && <p role="status" className="mt-5 border-l-2 border-olive bg-[#eff0e8] p-3 text-[12px] text-olive-deep">{notice}</p>}

    {section === 'orders' && <section aria-label="Narudžbe"><p className="mt-5 text-[11px] leading-relaxed text-muted">Kontakt i adresa kupaca prikazuju se samo u ovoj zaštićenoj sesiji. Dostava ostaje nepoznata dok je ne dogovorite.</p>{orders.length === 0 ? <div className="py-16 text-center"><p className="font-display text-[31px]">{busy ? 'Učitavanje narudžbi…' : 'Nema narudžbi za prikaz.'}</p></div> : <ul className="mt-6 flex flex-col gap-4">{orders.map(order => { const customer = JSON.parse(order.customerJson) as { name: string; phone: string; city: string; address: string; note?: string; email?: string }; const items = JSON.parse(order.itemsJson) as { name: string; quantity: number; unitPrice: number; lineTotal: number }[]; return <li key={order.reference} className="border border-line bg-white p-4 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-display text-[26px]">{order.reference}</p><p className="mt-1 text-[10px] text-muted">{new Intl.DateTimeFormat('bs-BA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))} · {order.paymentMethod}</p></div><label className="text-[10px] text-muted">Status<select value={order.status} onChange={event => void updateOrder(order, event.target.value as Status)} className="ml-2 h-10 max-w-full border border-line-strong bg-bg px-2 text-[11px] text-fg">{statuses.map(status => <option key={status}>{status}</option>)}</select></label></div><div className="mt-5 grid gap-5 border-t border-line pt-5 md:grid-cols-2"><div><p className="text-[10px] uppercase tracking-[.14em] text-olive">Kupac i dostava</p><p className="mt-2 break-words text-[12px] font-medium">{customer.name} · {customer.phone}</p><p className="mt-1 break-words text-[11px] text-muted">{customer.address}, {customer.city}</p>{customer.email && <p className="mt-1 break-words text-[11px] text-muted">{customer.email}</p>}{customer.note && <p className="mt-2 text-[11px] text-muted">Napomena: {customer.note}</p>}</div><div><p className="text-[10px] uppercase tracking-[.14em] text-olive">Proizvodi</p>{items.map((item, index) => <p key={`${item.name}-${index}`} className="mt-2 flex justify-between gap-3 text-[11px]"><span>{item.name} × {item.quantity} · {money(item.unitPrice)} / kom.</span><span>{money(item.lineTotal)}</span></p>)}<p className="mt-3 border-t border-line pt-3 text-[11px]">Međuzbir: <strong>{money(order.subtotal)}</strong></p><label className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted">Dostava (KM)<input aria-label="Iznos dostave u KM" type="number" min="0" max="10000" step="1" defaultValue={order.deliveryCharge ?? ''} placeholder="Potvrdi s kupcem" className="h-10 w-full max-w-[190px] border border-line-strong bg-bg px-3 text-[11px] sm:w-40" onBlur={event => { const value = event.currentTarget.value.trim(); if (value && Number(value) !== order.deliveryCharge) void updateOrder(order, order.status, Number(value)) }}/></label><p className="mt-2 text-[12px] font-medium">{order.total === null ? 'Konačni iznos čeka potvrdu dostave' : `Ukupno: ${money(order.total)}`}</p></div></div></li> })}</ul>}</section>}

    {section === 'products' && <section className="mt-6 grid items-start gap-8 xl:grid-cols-[minmax(300px,.8fr)_minmax(0,1.2fr)]"><form onSubmit={saveProduct} className="border border-line bg-white p-5 sm:p-6"><p className="text-[10px] uppercase tracking-[.18em] text-olive">{editingId ? 'Uredite proizvod' : 'Novi unos'}</p><h2 className="font-display mt-2 text-[30px]">{editingId ? 'Izmjena proizvoda' : 'Dodajte proizvod'}</h2><p className="mt-2 text-[11px] leading-relaxed text-muted">Svaki novi proizvod ostaje neprovjeren i nedostupan dok ga vlasnica ne potvrdi.</p><div className="mt-5 grid gap-3"><label className="text-[11px]">Naziv<input required minLength={3} value={productForm.name} onChange={event => setProductForm({ ...productForm, name: event.target.value })} className={`${inputClass} mt-1`} /></label><label className="text-[11px]">URL oznaka (slug)<input required pattern="[a-z0-9](?:[a-z0-9_-]{0,180}[a-z0-9])?" value={productForm.slug} onChange={event => setProductForm({ ...productForm, slug: event.target.value })} className={`${inputClass} mt-1`} /></label><div className="grid grid-cols-2 gap-3"><label className="text-[11px]">Cijena (KM)<input type="number" min="0" step="1" value={productForm.price} onChange={event => setProductForm({ ...productForm, price: event.target.value })} className={`${inputClass} mt-1`} placeholder="Nepotvrđena" /></label><label className="text-[11px]">Veličina<input value={productForm.size} onChange={event => setProductForm({ ...productForm, size: event.target.value })} className={`${inputClass} mt-1`} /></label></div><label className="text-[11px]">Kategorija<select value={productForm.category} onChange={event => setProductForm({ ...productForm, category: event.target.value })} className={`${inputClass} mt-1`}><option value="">Bez kategorije</option>{categoryRows.map(category => <option key={category.key} value={category.key}>{category.label}</option>)}{categoryRows.length === 0 && defaultCategories.map(category => <option key={category.key} value={category.key}>{category.label}</option>)}</select></label><label className="text-[11px]">Kratki opis<input value={productForm.short} onChange={event => setProductForm({ ...productForm, short: event.target.value })} className={`${inputClass} mt-1`} /></label><label className="text-[11px]">Opis<textarea rows={3} value={productForm.description} onChange={event => setProductForm({ ...productForm, description: event.target.value })} className={`${inputClass} mt-1 h-auto py-3`} /></label><label className="text-[11px]">Detalji (svaki u svom redu)<textarea rows={3} value={productForm.details} onChange={event => setProductForm({ ...productForm, details: event.target.value })} className={`${inputClass} mt-1 h-auto py-3`} /></label><label className="text-[11px]">Putanja fotografije<input value={productForm.image} onChange={event => setProductForm({ ...productForm, image: event.target.value })} className={`${inputClass} mt-1`} placeholder="/api/admin/images/naziv.jpg" /></label><label className="text-[11px]">Dodajte fotografiju<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block max-w-full text-[11px]" onChange={uploadImage}/></label><label className="text-[11px]">Verifikacija<select value={productForm.verificationStatus} onChange={event => setProductForm({ ...productForm, verificationStatus: event.target.value as VerificationStatus })} className={`${inputClass} mt-1`}><option value="awaiting_confirmation">Čeka potvrdu</option><option value="verified">Potvrđeno</option></select></label><label className="flex min-h-10 items-center gap-3 text-[12px]"><input type="checkbox" checked={productForm.available} disabled={productForm.verificationStatus !== 'verified' || productForm.price === ''} onChange={event => setProductForm({ ...productForm, available: event.target.checked })} />Dostupan za naručivanje</label><label className="flex min-h-10 items-center gap-3 text-[12px]"><input type="checkbox" checked={productForm.featured} onChange={event => setProductForm({ ...productForm, featured: event.target.checked })} />Istaknut na naslovnoj</label></div><div className="mt-5 flex flex-wrap gap-2"><Button type="submit" loading={busy}>{editingId ? 'Sačuvajte izmjene' : 'Dodajte proizvod'}</Button>{editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setProductForm(blankProduct()) }}>Odustani</Button>}</div></form><div><h2 className="font-display text-[30px]">Katalog ({products.length})</h2><ul className="mt-4 flex flex-col gap-3">{products.map(product => <li key={product.id} className="flex flex-col gap-3 border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="break-words text-[13px] font-medium">{product.name}</p><p className="mt-1 text-[10px] text-muted">{product.category ?? 'Bez kategorije'} · {product.price === null ? 'Cijena nije unesena' : money(product.price)} · {product.verificationStatus === 'verified' ? 'Potvrđeno' : 'Čeka potvrdu'} · {product.available ? 'Dostupan' : 'Nije dostupan'}</p></div><div className="flex shrink-0 flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => startEditing(product)}>Uredi</Button><Button variant="secondary" size="sm" onClick={() => void deleteProduct(product)}>Obriši</Button></div></li>)}</ul></div></section>}

    {section === 'policies' && <section className="mt-6"><div className="max-w-3xl"><p className="text-[12px] leading-relaxed text-muted">Uredite razvojne tekstove o prodavcu, dostavi, privatnosti i uslovima. Prije javne prodaje zatražite odobrenje BioHerbice i lokalnu pravnu provjeru.</p></div><div className="mt-6 grid gap-4">{policyRows.map(policy => <fieldset key={policy.key} className="border border-line bg-white p-5 sm:p-6"><legend className="sr-only">{policy.title}</legend><div className="grid gap-3"><label className="text-[11px]">Naslov<input value={policy.title} onChange={event => setPolicyRows(rows => rows.map(row => row.key === policy.key ? { ...row, title: event.target.value } : row))} className={`${inputClass} mt-1`} /></label><label className="text-[11px]">Tekst<textarea rows={5} value={policy.content} onChange={event => setPolicyRows(rows => rows.map(row => row.key === policy.key ? { ...row, content: event.target.value } : row))} className={`${inputClass} mt-1 h-auto py-3`} /></label><Button type="button" variant="secondary" size="sm" className="w-fit" onClick={() => void savePolicy(policy)}>Sačuvajte tekst</Button></div></fieldset>)}</div></section>}

    {section === 'categories' && <section className="mt-6 grid items-start gap-8 md:grid-cols-[minmax(280px,.75fr)_minmax(0,1.25fr)]"><form onSubmit={saveCategory} className="border border-line bg-white p-5 sm:p-6"><p className="text-[10px] uppercase tracking-[.18em] text-olive">{editingCategoryKey ? 'Uređivanje' : 'Novi unos'}</p><h2 className="font-display mt-2 text-[30px]">{editingCategoryKey ? 'Uredite kategoriju' : 'Dodajte kategoriju'}</h2><div className="mt-5 grid gap-3"><label className="text-[11px]">Naziv<input required minLength={2} value={categoryForm.label} onChange={event => setCategoryForm({ ...categoryForm, label: event.target.value })} className={`${inputClass} mt-1`} /></label><label className="text-[11px]">URL oznaka<input required disabled={Boolean(editingCategoryKey)} pattern="[a-z0-9](?:[a-z0-9_-]{0,180}[a-z0-9])?" value={categoryForm.key} onChange={event => setCategoryForm({ ...categoryForm, key: event.target.value })} className={`${inputClass} mt-1 disabled:opacity-60`} placeholder="npr. ulja-za-tijelo" /></label><label className="text-[11px]">Kratki opis<input value={categoryForm.blurb} onChange={event => setCategoryForm({ ...categoryForm, blurb: event.target.value })} className={`${inputClass} mt-1`} /></label><label className="text-[11px]">Broj za prikaz<input value={categoryForm.number} onChange={event => setCategoryForm({ ...categoryForm, number: event.target.value })} className={`${inputClass} mt-1`} placeholder="08" /></label></div><div className="mt-5 flex flex-wrap gap-2"><Button type="submit">{editingCategoryKey ? 'Sačuvajte izmjene' : 'Dodajte kategoriju'}</Button>{editingCategoryKey && <Button variant="secondary" onClick={() => { setEditingCategoryKey(null); setCategoryForm({ key: '', label: '', blurb: '', number: '' }) }}>Odustani</Button>}</div></form><div><h2 className="font-display text-[30px]">Kategorije ({categoryRows.length})</h2><ul className="mt-4 flex flex-col gap-2">{categoryRows.map(category => <li key={category.key} className="flex min-w-0 items-center justify-between gap-4 border border-line bg-white p-4"><div className="min-w-0"><p className="break-words text-[13px] font-medium">{category.label}</p><p className="mt-1 text-[10px] text-muted">{category.key}{category.blurb ? ` · ${category.blurb}` : ''}</p></div><div className="flex shrink-0 gap-2"><Button variant="secondary" size="sm" onClick={() => { setEditingCategoryKey(category.key); setCategoryForm({ key: category.key, label: category.label, blurb: category.blurb ?? '', number: category.number ?? '' }) }}>Uredi</Button><Button variant="secondary" size="sm" onClick={() => void deleteCategory(category)}>Obriši</Button></div></li>)}</ul></div></section>}
  </Container>
}
