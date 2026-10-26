import { createFreebuffAuth, isSameOriginRequest } from '@freebuff/auth'
import { Hono } from 'hono'
import type { FreebuffAuth } from '@freebuff/auth'
import { products } from '../data/products'

type OrderStatus = 'Novo' | 'Potvrđeno' | 'U pripremi' | 'Poslano' | 'Isporučeno' | 'Otkazano'
type OrderItem = { id: string; quantity: number }
type Customer = { name: string; phone: string; city: string; address: string; note?: string; email?: string }
type Env = { ASSETS: Fetcher; DB: D1Database; PRODUCT_IMAGES: R2Bucket; FREEBUFF_CLIENT_ID: string; FREEBUFF_ISSUER: string; APP_ORIGIN: string; ADMIN_USER_ID?: string }

const app = new Hono<{ Bindings: Env }>()
app.onError((error, c) => {
  console.error('BioHerbica Worker request failed:', error.name, error.message)
  return c.json({ error: 'Zahtjev trenutno nije moguće obraditi.' }, 500)
})
const statuses: OrderStatus[] = ['Novo', 'Potvrđeno', 'U pripremi', 'Poslano', 'Isporučeno', 'Otkazano']
const validString = (value: unknown, min: number, max: number): value is string => typeof value === 'string' && value.trim().length >= min && value.trim().length <= max
let auth: FreebuffAuth | undefined

app.get('/api/health', (c) => c.json({ ok: true }))

app.post('/api/orders', async (c) => {
  if (!isSameOriginRequest(c.req.raw, c.env.APP_ORIGIN)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  let order: { customer?: Customer; items?: OrderItem[]; paymentMethod?: string }
  try { order = await c.req.json() } catch { return c.json({ error: 'Podaci narudžbe nisu ispravni.' }, 400) }
  const customer = order.customer
  if (!customer || !validString(customer.name, 3, 120) || !validString(customer.phone, 6, 40) || !validString(customer.city, 2, 100) || !validString(customer.address, 3, 240) || (customer.note !== undefined && (typeof customer.note !== 'string' || customer.note.length > 500)) || (customer.email !== undefined && customer.email !== '' && (typeof customer.email !== 'string' || customer.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)))) return c.json({ error: 'Provjerite ime, telefon, grad i adresu za dostavu.' }, 400)
  if (order.paymentMethod !== undefined && order.paymentMethod !== 'pouzece') return c.json({ error: 'Dostupno je samo plaćanje pouzećem.' }, 400)
  if (!Array.isArray(order.items) || order.items.length < 1 || order.items.length > 30) return c.json({ error: 'Korpa je prazna ili sadrži previše stavki.' }, 400)
  const lines: { product: (typeof products)[number]; quantity: number }[] = []
  for (const item of order.items) {
    if (!item || typeof item.id !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) return c.json({ error: 'Provjerite proizvode i količine u korpi.' }, 400)
    const product = products.find((candidate) => candidate.slug === item.id)
    if (!product || !product.available || product.price === null || product.verificationStatus !== 'verified') return c.json({ error: 'Jedan ili više proizvoda još nisu dostupni za naručivanje.' }, 409)
    lines.push({ product, quantity: item.quantity })
  }
  const subtotal = lines.reduce((sum, line) => sum + (line.product.price ?? 0) * line.quantity, 0)
  const reference = `BH-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  const createdAt = new Date().toISOString()
  const record = { reference, customer: { ...customer, name: customer.name.trim(), phone: customer.phone.trim(), city: customer.city.trim(), address: customer.address.trim(), note: customer.note?.trim() ?? '', email: customer.email?.trim() ?? '' }, items: lines.map(({ product, quantity }) => ({ slug: product.slug, name: product.name, quantity, unitPrice: product.price!, lineTotal: (product.price ?? 0) * quantity })), subtotal, paymentMethod: 'Plaćanje pouzećem', status: 'Novo' as OrderStatus, createdAt }
  try { await c.env.DB.prepare('INSERT INTO orders (reference, customer_json, items_json, subtotal, delivery_charge, total, payment_method, status, created_at) VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?)').bind(reference, JSON.stringify(record.customer), JSON.stringify(record.items), subtotal, record.paymentMethod, record.status, createdAt).run() }
  catch { return c.json({ error: 'Narudžbu trenutno nije moguće sačuvati. Pokušajte ponovo ili kontaktirajte BioHerbicu.' }, 503) }
  return c.json({ reference, subtotal, deliveryCharge: null, total: null, status: 'Novo', createdAt }, 201)
})

function hasAdminAccess(userId: string | undefined, env: Env) { return Boolean(env.ADMIN_USER_ID && userId && userId === env.ADMIN_USER_ID) }

app.get('/api/admin/orders', async (c) => {
  const user = await auth!.getUser(c.req.raw)
  if (!hasAdminAccess(user?.sub, c.env)) return c.json({ error: 'Pristup nije odobren.' }, user ? 403 : 401, { 'Cache-Control': 'private, no-store' })
  const orders = await c.env.DB.prepare('SELECT reference, customer_json AS customerJson, items_json AS itemsJson, subtotal, delivery_charge AS deliveryCharge, total, payment_method AS paymentMethod, status, created_at AS createdAt FROM orders ORDER BY created_at DESC LIMIT 250').all()
  return c.json({ results: orders.results ?? [] }, 200, { 'Cache-Control': 'private, no-store' })
})

app.patch('/api/admin/orders/:reference', async (c) => {
  if (!isSameOriginRequest(c.req.raw, c.env.APP_ORIGIN)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  const user = await auth!.getUser(c.req.raw)
  if (!user) return c.json({ error: 'Prijava je obavezna.' }, 401)
  if (!hasAdminAccess(user.sub, c.env)) return c.json({ error: 'Pristup nije odobren.' }, 403)
  let body: { status?: OrderStatus; deliveryCharge?: number | null }
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400) }
  if (!statuses.includes(body.status as OrderStatus)) return c.json({ error: 'Status narudžbe nije validan.' }, 400)
  if (body.deliveryCharge !== null && body.deliveryCharge !== undefined && (!Number.isSafeInteger(body.deliveryCharge) || body.deliveryCharge < 0 || body.deliveryCharge > 10000)) return c.json({ error: 'Iznos dostave mora biti unesen u cijelim KM.' }, 400)
  const result = body.deliveryCharge === undefined ? await c.env.DB.prepare('UPDATE orders SET status = ? WHERE reference = ?').bind(body.status, c.req.param('reference')).run() : await c.env.DB.prepare('UPDATE orders SET status = ?, delivery_charge = ?, total = subtotal + ? WHERE reference = ?').bind(body.status, body.deliveryCharge, body.deliveryCharge, c.req.param('reference')).run()
  if (!result.meta.changes) return c.json({ error: 'Narudžba nije pronađena.' }, 404)
  return c.json({ ok: true })
})

app.get('/api/admin/images/:key{.+}', async (c) => {
  const user = await auth!.getUser(c.req.raw)
  if (!hasAdminAccess(user?.sub, c.env)) return c.json({ error: 'Pristup nije odobren.' }, user ? 403 : 401, { 'Cache-Control': 'private, no-store' })
  const key = decodeURIComponent(c.req.param('key'))
  if (!/^[a-zA-Z0-9][a-zA-Z0-9/_-]{0,180}\.(?:jpg|jpeg|png|webp)$/i.test(key)) return c.json({ error: 'Naziv slike nije validan.' }, 400)
  const object = await c.env.PRODUCT_IMAGES.get(key)
  if (!object) return c.json({ error: 'Slika nije pronađena.' }, 404)
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream', 'cache-control': 'private, no-store', 'content-length': String(object.size) } })
})

app.post('/api/admin/images/:key{.+}', async (c) => {
  if (!isSameOriginRequest(c.req.raw, c.env.APP_ORIGIN)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  const user = await auth!.getUser(c.req.raw)
  if (!user) return c.json({ error: 'Prijava je obavezna.' }, 401)
  if (!hasAdminAccess(user.sub, c.env)) return c.json({ error: 'Pristup nije odobren.' }, 403)
  const key = decodeURIComponent(c.req.param('key'))
  if (!/^[a-zA-Z0-9][a-zA-Z0-9/_-]{0,180}\.(?:jpg|jpeg|png|webp)$/i.test(key)) return c.json({ error: 'Naziv slike nije validan.' }, 400)
  const contentType = c.req.header('content-type') ?? ''
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) return c.json({ error: 'Dozvoljene su JPG, PNG i WebP slike.' }, 415)
  let form: FormData
  try { form = await c.req.formData() } catch { return c.json({ error: 'Datoteka fotografije nije ispravna.' }, 400) }
  const file = form.get('file')
  if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 || file.type !== contentType) return c.json({ error: 'Slika mora biti ispravna i manja od 5 MB.' }, 413)
  await c.env.PRODUCT_IMAGES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType } })
  return c.json({ ok: true, key })
})

app.delete('/api/admin/images/:key{.+}', async (c) => {
  if (!isSameOriginRequest(c.req.raw, c.env.APP_ORIGIN)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  const user = await auth!.getUser(c.req.raw)
  if (!user) return c.json({ error: 'Prijava je obavezna.' }, 401)
  if (!hasAdminAccess(user.sub, c.env)) return c.json({ error: 'Pristup nije odobren.' }, 403)
  await c.env.PRODUCT_IMAGES.delete(decodeURIComponent(c.req.param('key')))
  return c.json({ ok: true })
})

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

let wrapped: ReturnType<FreebuffAuth['wrap']> | undefined
let wrappedOrigin = ''
let wrappedClientId = ''
const worker: ExportedHandler<Env> = {
  fetch(request: Request, env: Env) {
    const allowInsecureLocalhost = env.APP_ORIGIN.startsWith('http://localhost:') || env.APP_ORIGIN.startsWith('http://127.0.0.1:')
    if (!auth || wrappedOrigin !== env.APP_ORIGIN || wrappedClientId !== env.FREEBUFF_CLIENT_ID) {
      wrappedOrigin = env.APP_ORIGIN
      wrappedClientId = env.FREEBUFF_CLIENT_ID
      auth = createFreebuffAuth({ clientId: env.FREEBUFF_CLIENT_ID, issuer: env.FREEBUFF_ISSUER, baseUrl: env.APP_ORIGIN, ...(allowInsecureLocalhost ? { allowInsecureLocalhost: true } : {}) })
      const instance = auth
      wrapped = instance.wrap((incoming: Request, ..._rest: unknown[]) => app.fetch(incoming, env))
    }
    return wrapped!(request)
  },
}

export default worker
