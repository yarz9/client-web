import { Hono } from 'hono'
import mysql from 'mysql2/promise'
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Local development convenience: read an ignored .env next to the project root.
// Real environment variables, such as the ones Railway injects, always win.
try {
  const envFile = await readFile(resolve(__dirname, '..', '.env'), 'utf8')
  for (const line of envFile.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line)
    if (!match || process.env[match[1]] !== undefined) continue
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
} catch {
  // No .env file: rely on the hosting platform's environment variables.
}

// Railway's MySQL service can expose a ready-made URL or only separate MYSQL* parts,
// so accept whichever is present instead of insisting on a single variable name.
function resolveDatabaseUrl() {
  for (const candidate of [process.env.DATABASE_URL, process.env.MYSQL_URL, process.env.DATABASE_PRIVATE_URL, process.env.MYSQL_PUBLIC_URL]) {
    if (candidate && candidate.trim()) return candidate.trim()
  }
  const { MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE } = process.env
  if (!MYSQLHOST || !MYSQLUSER || !MYSQLDATABASE) return ''
  const identity = MYSQLPASSWORD ? `${encodeURIComponent(MYSQLUSER)}:${encodeURIComponent(MYSQLPASSWORD)}` : encodeURIComponent(MYSQLUSER)
  return `mysql://${identity}@${MYSQLHOST}:${MYSQLPORT ?? '3306'}/${MYSQLDATABASE}`
}

const DATABASE_URL = resolveDatabaseUrl()

const STATIC_ROOT = resolve(__dirname, '..', 'dist', 'client')
const ADMIN_SESSION_COOKIE = 'bioherbica_admin'
const ADMIN_SESSION_SECONDS = 8 * 60 * 60
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function secureEqual(left: string, right: string) {
  const leftDigest = createHmac('sha256', 'bioherbica-admin-check').update(left).digest()
  const rightDigest = createHmac('sha256', 'bioherbica-admin-check').update(right).digest()
  return timingSafeEqual(leftDigest, rightDigest) && left.length === right.length
}

function sessionSignature(payload: string) {
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET ?? '').update(payload).digest('base64url')
}

function adminCredentials() {
  return {
    username: (process.env.ADMIN_USERNAME ?? '').trim(),
    password: process.env.ADMIN_PASSWORD ?? '',
    secret: process.env.ADMIN_SESSION_SECRET ?? '',
  }
}

function adminConfigured() {
  const { username, password, secret } = adminCredentials()
  return username.length >= 3 && password.length >= 8 && secret.length >= 32
}

function hasAdminSession(request: Request) {
  if (!adminConfigured()) return false
  const cookie = request.headers.get('cookie') ?? ''
  const token = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))?.slice(ADMIN_SESSION_COOKIE.length + 1)
  if (!token) return false
  const [nonce, expiration, signature] = token.split('.')
  if (!nonce || !Number.isSafeInteger(Number(expiration)) || String(Number(expiration)) !== expiration || !signature) return false
  const payload = `${nonce}.${expiration}`
  if (!secureEqual(signature, sessionSignature(payload))) return false
  const expiresAt = Number(expiration)
  if (expiresAt <= Date.now() || expiresAt - Date.now() > ADMIN_SESSION_SECONDS * 1000) return false
  return true
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  const forwardedHost = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '').split(',')[0].trim()
  const forwardedProto = (request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.replace(':', '')).split(',')[0].trim()
  try { return new URL(origin).origin === `${forwardedProto}://${forwardedHost}` } catch { return false }
}

function sessionCookie(value: string, maxAge: number, request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim()
  const secure = process.env.NODE_ENV === 'production' || forwardedProto === 'https' ? '; Secure' : ''
  return `${ADMIN_SESSION_COOKIE}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`
}

function pruneSessions() {
  const now = Date.now()
  for (const [key, attempt] of loginAttempts) if (attempt.resetAt <= now) loginAttempts.delete(key)
}


type OrderStatus = 'Novo' | 'Potvrđeno' | 'U pripremi' | 'Poslano' | 'Isporučeno' | 'Otkazano'
type OrderItem = { slug: string; name: string; quantity: number; unitPrice: number; lineTotal: number }
type Customer = { name: string; phone: string; city: string; address: string; note?: string; email?: string }
type Order = {
  reference: string
  customerJson: string
  itemsJson: string
  subtotal: number
  deliveryCharge: number | null
  total: number | null
  paymentMethod: string
  status: OrderStatus
  createdAt: string
}
type ProductRow = {
  id: number
  slug: string
  name: string
  price: number | null
  size: string | null
  category: string | null
  image: string | null
  short: string | null
  description: string | null
  details: string[]
  verificationStatus: 'awaiting_confirmation' | 'verified'
  available: boolean
  featured: boolean
  referencePrice: number | null
  sortOrder: number
  createdAt: string
}

const STATUSES: OrderStatus[] = ['Novo', 'Potvrđeno', 'U pripremi', 'Poslano', 'Isporučeno', 'Otkazano']
const IMAGE_KEY_RE = /^[a-zA-Z0-9][a-zA-Z0-9/_-]{0,180}\.(?:jpg|jpeg|png|webp)$/i
const PRODUCT_SELECT = 'SELECT id, slug, name, price, size, category, image, short, description, details, verification_status AS verificationStatus, available, featured, reference_price AS referencePrice, sort_order AS sortOrder, created_at AS createdAt FROM products'
const ADMIN_HEADERS = {
  'Cache-Control': 'private, no-store',
}

declare module 'hono' {
  interface ContextVariableMap {
    db: SqlDb
  }
}

type SqlDb = {
  query(sql: string, params?: unknown[]): Promise<any>
  prepare(sql: string): { execute(params?: unknown[]): Promise<any> }
  end(): Promise<void>
}

const app = new Hono<{ Bindings: { db: SqlDb } }>()

// Hono only fills `c.var` from `c.set()`, so expose the per-request database handle here.
app.use('*', async (c, next) => {
  c.set('db', c.env.db)
  await next()
})

app.onError((error, c) => {
  console.error('BioHerbica backend request failed:', error.name, error.message)
  try {
    if (c.var.db) {
      c.var.db.end().catch(() => {})
    }
  } catch {}
  return c.json({ error: 'Zahtjev trenutno nije moguće obraditi.' }, 500)
})

function adminFor(c: { req: { raw: Request } }) {
  return hasAdminSession(c.req.raw)
}

function requestKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

app.get('/api/admin/session', (c) => {
  if (!adminFor(c)) return c.json({ error: 'Prijava je istekla.' }, 401, ADMIN_HEADERS)
  return c.json({ ok: true }, 200, ADMIN_HEADERS)
})

app.post('/api/admin/session', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403, ADMIN_HEADERS)
  if (!adminConfigured()) return c.json({ error: 'Administratorski pristup nije konfigurisan.' }, 503, ADMIN_HEADERS)
  pruneSessions()
  const key = requestKey(c.req.raw)
  const now = Date.now()
  const attempt = loginAttempts.get(key)
  if (attempt && attempt.count >= 8 && attempt.resetAt > now) return c.json({ error: 'Previše pokušaja. Sačekajte 15 minuta.' }, 429, { ...ADMIN_HEADERS, 'Retry-After': String(Math.ceil((attempt.resetAt - now) / 1000)) })
  let body: { username?: unknown; password?: unknown }
  try { body = await c.req.json() } catch { return c.json({ error: 'Unesite korisničko ime i lozinku.' }, 400, ADMIN_HEADERS) }
  const { username, password } = adminCredentials()
  const validLogin = typeof body.username === 'string' && typeof body.password === 'string' && body.username.length <= 128 && body.password.length <= 256 && secureEqual(body.username.trim(), username) && secureEqual(body.password, password)
  if (!validLogin) {
    const current = attempt && attempt.resetAt > now ? attempt : { count: 0, resetAt: now + 15 * 60 * 1000 }
    current.count += 1; loginAttempts.set(key, current)
    return c.json({ error: 'Korisničko ime ili lozinka nisu ispravni.' }, 401, ADMIN_HEADERS)
  }
  loginAttempts.delete(key)
  const nonce = randomBytes(24).toString('base64url')
  const expiresAt = now + ADMIN_SESSION_SECONDS * 1000
  const payload = `${nonce}.${expiresAt}`
  const token = `${payload}.${sessionSignature(payload)}`
  return c.json({ ok: true }, 200, { ...ADMIN_HEADERS, 'Set-Cookie': sessionCookie(token, ADMIN_SESSION_SECONDS, c.req.raw) })
})

app.delete('/api/admin/session', (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403, ADMIN_HEADERS)
  return c.json({ ok: true }, 200, { ...ADMIN_HEADERS, 'Set-Cookie': sessionCookie('', 0, c.req.raw) })
})

app.get('/api/admin/products', async (c) => {
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)
  const [rows] = await c.var.db.prepare(`${PRODUCT_SELECT} ORDER BY sort_order ASC, id ASC`).execute() as unknown as [mysql.RowDataPacket[], unknown]
  return c.json({ results: rows.map(rowToProduct) }, 200, ADMIN_HEADERS)
})

app.get('/api/health', async (c) => {
  try {
    await c.var.db.query('SELECT 1')
    return c.json({ ok: true, database: true })
  } catch {
    return c.json({ ok: false, database: false }, 503)
  }
})

app.post('/api/orders', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  const db = c.var.db as unknown as SqlDb
  let body: { customer?: Customer; items?: { id: string; quantity: number }[]; paymentMethod?: string }
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci narudžbe nisu ispravni.' }, 400) }

  const customer = body.customer
  if (!customer || !validString(customer.name, 3, 120) || !validString(customer.phone, 6, 40) || !validString(customer.city, 2, 100) || !validString(customer.address, 3, 240) || (customer.note !== undefined && (typeof customer.note !== 'string' || customer.note.length > 500)) || (customer.email !== undefined && customer.email !== '' && (typeof customer.email !== 'string' || customer.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)))) {
    return c.json({ error: 'Provjerite ime, telefon, grad i adresu za dostavu.' }, 400)
  }

  if (body.paymentMethod !== undefined && body.paymentMethod !== 'pouzece') {
    return c.json({ error: 'Dostupno je samo plaćanje pouzećem.' }, 400)
  }

  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) {
    return c.json({ error: 'Korpa je prazna ili sadrži previše stavki.' }, 400)
  }

  const lines: { product: ProductRow; quantity: number }[] = []
  for (const item of body.items) {
    if (!item || typeof item.id !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) {
      return c.json({ error: 'Provjerite proizvode i količine u korpi.' }, 400)
    }
    const [productRows] = await db.prepare('SELECT id, slug, name, price, available, verification_status AS verificationStatus FROM products WHERE slug = ?').execute([item.id]) as unknown as [ProductRow[], unknown]
    const productRow = productRows[0]
    if (!productRow || !productRow.available || productRow.price == null || productRow.verificationStatus !== 'verified') {
      return c.json({ error: 'Jedan ili više proizvoda još nisu dostupni za naručivanje.' }, 409)
    }
    lines.push({ product: productRow as ProductRow, quantity: item.quantity })
  }

  const subtotal = lines.reduce((sum, line) => sum + (line.product.price ?? 0) * line.quantity, 0)
  if (!Number.isSafeInteger(subtotal) || subtotal > 100000000) return c.json({ error: 'Ukupan iznos narudžbe nije validan.' }, 400)
  const reference = `BH-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  const createdAt = new Date().toISOString()

  const record: {
    reference: string
    customer: Customer
    items: OrderItem[]
    subtotal: number
    paymentMethod: string
    status: OrderStatus
    createdAt: string
  } = {
    reference,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      city: customer.city.trim(),
      address: customer.address.trim(),
      note: customer.note?.trim() ?? '',
      email: customer.email?.trim() ?? '',
    },
    items: lines.map(({ product, quantity }) => ({
      slug: product.slug,
      name: product.name,
      quantity,
      unitPrice: product.price!,
      lineTotal: (product.price ?? 0) * quantity,
    })),
    subtotal,
    paymentMethod: 'Plaćanje pouzećem',
    status: 'Novo',
    createdAt,
  }

  await db.prepare('INSERT INTO orders (reference, customer_json, items_json, subtotal, delivery_charge, total, payment_method, status, created_at) VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?)').execute([
    reference,
    JSON.stringify(record.customer),
    JSON.stringify(record.items),
    subtotal,
    record.paymentMethod,
    record.status,
    createdAt,
  ])

  return c.json({ reference, subtotal, deliveryCharge: null, total: null, status: 'Novo', createdAt }, 201)
})

app.get('/api/admin/orders', async (c) => {
  if (!adminFor(c)) {
    return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)
  }
  const db = c.var.db as unknown as SqlDb
  const [rows] = await db.prepare('SELECT reference, CAST(customer_json AS CHAR) AS customerJson, CAST(items_json AS CHAR) AS itemsJson, subtotal, delivery_charge AS deliveryCharge, total, payment_method AS paymentMethod, status, created_at AS createdAt FROM orders ORDER BY created_at DESC LIMIT 250').execute() as Order[][]
  return c.json({ results: rows }, 200, ADMIN_HEADERS)
})

app.patch('/api/admin/orders/:reference', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  if (!adminFor(c)) {
    return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)
  }
  const db = c.var.db as unknown as SqlDb
  const reference = c.req.param('reference')
  if (!/^BH-[A-Z0-9]{8}$/.test(reference)) return c.json({ error: 'Referenca narudžbe nije validna.' }, 400)

  let body: { status?: OrderStatus; deliveryCharge?: number | null }
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400) }

  if (!STATUSES.includes(body.status as OrderStatus)) {
    return c.json({ error: 'Status narudžbe nije validan.' }, 400)
  }
  if (body.deliveryCharge !== null && body.deliveryCharge !== undefined && (!Number.isSafeInteger(body.deliveryCharge) || body.deliveryCharge < 0 || body.deliveryCharge > 10000)) {
    return c.json({ error: 'Iznos dostave mora biti unesen u cijelim KM.' }, 400)
  }

  let result: mysql.ResultSetHeader
  if (body.deliveryCharge === undefined) {
    result = await db.prepare('UPDATE orders SET status = ? WHERE reference = ?').execute([body.status, reference])
  } else {
    const delta = body.deliveryCharge
    result = await db.prepare('UPDATE orders SET status = ?, delivery_charge = ?, total = subtotal + ? WHERE reference = ?').execute([body.status, delta, delta, reference])
  }

  if (!result.affectedRows) {
    return c.json({ error: 'Narudžba nije pronađena.' }, 404)
  }

  return c.json({ ok: true })
})

app.get('/api/admin/images/:key{.+}', async (c) => {
  const key = decodeURIComponent(c.req.param('key'))
  if (!IMAGE_KEY_RE.test(key)) return c.json({ error: 'Naziv slike nije validan.' }, 400)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  const [rows] = await db.prepare('SELECT data, mimetype FROM product_images WHERE keyname = ?').execute([key]) as unknown as { data: Buffer; mimetype: string }[][]
  if (!rows.length) return c.json({ error: 'Slika nije pronađena.' }, 404)

  const row = rows[0]
  const buf = Buffer.from(row.data)
  return new Response(buf, {
    headers: {
      'content-type': row.mimetype ?? 'application/octet-stream',
      ...ADMIN_HEADERS,
    },
  })
})

app.post('/api/admin/images/:key{.+}', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  const key = decodeURIComponent(c.req.param('key'))
  if (!IMAGE_KEY_RE.test(key)) return c.json({ error: 'Naziv slike nije validan.' }, 400)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)

  const contentType = c.req.header('content-type') ?? ''
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) return c.json({ error: 'Dozvoljene su JPG, PNG i WebP slike.' }, 415)

  let form: FormData
  try { form = await c.req.formData() } catch { return c.json({ error: 'Datoteka fotografije nije ispravna.' }, 400) }

  const file = form.get('file')
  if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 || file.type !== contentType) {
    return c.json({ error: 'Slika mora biti ispravna i manja od 5 MB.' }, 413)
  }

  const db = c.var.db
  await db.prepare('INSERT INTO product_images (keyname, mimetype, data, created_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE mimetype = VALUES(mimetype), data = VALUES(data), created_at = NOW()').execute([key, contentType, await file.arrayBuffer()])

  return c.json({ ok: true, key })
})

app.delete('/api/admin/images/:key{.+}', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  const key = decodeURIComponent(c.req.param('key'))
  if (!IMAGE_KEY_RE.test(key)) return c.json({ error: 'Naziv slike nije validan.' }, 400)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  const [result] = await db.prepare('DELETE FROM product_images WHERE keyname = ?').execute([key]) as unknown as [mysql.ResultSetHeader, unknown]
  if (!result.affectedRows) return c.json({ error: 'Slika nije pronađena.' }, 404)

  return c.json({ ok: true })
})

app.get('/api/images/:key{.+}', async (c) => {
  const key = decodeURIComponent(c.req.param('key'))
  if (!IMAGE_KEY_RE.test(key)) return c.json({ error: 'Naziv slike nije validan.' }, 400)
  const [rows] = await c.var.db.prepare('SELECT data, mimetype FROM product_images WHERE keyname = ?').execute([key]) as unknown as [{ data: Buffer; mimetype: string }[], unknown]
  if (!rows.length) return c.json({ error: 'Slika nije pronađena.' }, 404)
  return new Response(Buffer.from(rows[0].data), { headers: { 'content-type': rows[0].mimetype, 'cache-control': 'public, max-age=3600' } })
})

app.get('/api/products', async (c) => {
  const db = c.var.db
  const [rows] = await db.prepare(`${PRODUCT_SELECT} ORDER BY sort_order ASC, id ASC`).execute() as unknown as [mysql.RowDataPacket[], unknown]
  return c.json({ results: rows.map(rowToProduct) }, 200)
})

app.get('/api/featured-products', async (c) => {
  const db = c.var.db
  const [rows] = await db.prepare(`${PRODUCT_SELECT} WHERE featured = 1 ORDER BY sort_order ASC, id ASC`).execute() as unknown as [mysql.RowDataPacket[], unknown]
  return c.json({ results: rows.map(rowToProduct) }, 200)
})

app.get('/api/images/:key{.+}', async (c) => {
  const key = decodeURIComponent(c.req.param('key'))
  if (!IMAGE_KEY_RE.test(key)) return c.json({ error: 'Naziv slike nije validan.' }, 400)
  const [rows] = await c.var.db.prepare('SELECT data, mimetype FROM product_images WHERE keyname = ?').execute([key]) as unknown as [{ data: Buffer; mimetype: string }[], unknown]
  if (!rows.length) return c.json({ error: 'Slika nije pronađena.' }, 404)
  return new Response(Buffer.from(rows[0].data), { headers: { 'content-type': rows[0].mimetype, 'cache-control': 'public, max-age=3600' } })
})

app.post('/api/admin/products', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  let body: Partial<ProductRow>
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400) }
  if (typeof body.slug !== 'string' || typeof body.name !== 'string' || !Array.isArray(body.details ?? [])) return c.json({ error: 'Unesite ispravne podatke o proizvodu.' }, 400)
  if (body.category !== undefined && body.category !== null && typeof body.category !== 'string') return c.json({ error: 'Kategorija proizvoda nije validna.' }, 400)
  if (body.image !== undefined && body.image !== null && (typeof body.image !== 'string' || body.image.length > 500 || !(body.image.startsWith('/api/images/') || /^https:\/\//i.test(body.image)))) return c.json({ error: 'Putanja fotografije nije validna.' }, 400)
  for (const [value, max, label] of [[body.size, 120, 'Veličina'], [body.short, 240, 'Kratki opis'], [body.description, 12000, 'Opis']] as const) if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > max)) return c.json({ error: `${label} je predugačak ili nije validan.` }, 400)
  if (body.details && body.details.some(detail => typeof detail !== 'string' || detail.length > 500)) return c.json({ error: 'Detalji proizvoda nisu validni.' }, 400)
  if (body.referencePrice !== undefined && body.referencePrice !== null && (!Number.isSafeInteger(body.referencePrice) || body.referencePrice < 0 || body.referencePrice > 1000000)) return c.json({ error: 'Referentna cijena nije validna.' }, 400)
  if (body.sortOrder !== undefined && (!Number.isSafeInteger(body.sortOrder) || body.sortOrder < 0 || body.sortOrder > 100000)) return c.json({ error: 'Redoslijed prikaza nije validan.' }, 400)
  if (body.category) {
    const [categoryRows] = await db.prepare('SELECT keyname FROM categories WHERE keyname = ?').execute([body.category]) as unknown as [{ keyname: string }[], unknown]
    if (!categoryRows.length) return c.json({ error: 'Odabrana kategorija ne postoji.' }, 400)
  }

  if (!body.slug || !/^[a-z0-9](?:[a-z0-9_-]{0,180}[a-z0-9])?$/.test(body.slug)) {
    return c.json({ error: 'Potreban je valjani naziv (slug) proizvoda.' }, 400)
  }
  if (!body.name || body.name.trim().length < 3 || body.name.length > 200) {
    return c.json({ error: 'Naziv proizvoda mora imati od 3 do 200 znakova.' }, 400)
  }

  const [existingRows] = await db.prepare('SELECT id FROM products WHERE slug = ?').execute([body.slug]) as unknown as [{ id: number }[], unknown]
  if (existingRows.length) return c.json({ error: 'Proizvod s ovim nazivom već postoji.' }, 409)

  if (body.price !== undefined && body.price !== null && (!Number.isSafeInteger(body.price) || body.price < 0 || body.price > 1000000)) return c.json({ error: 'Cijena mora biti cijeli iznos u KM.' }, 400)
  if (body.verificationStatus !== undefined && !['awaiting_confirmation', 'verified'].includes(body.verificationStatus)) return c.json({ error: 'Status provjere proizvoda nije validan.' }, 400)
  if (body.available && (body.price == null || body.verificationStatus !== 'verified')) return c.json({ error: 'Proizvod bez potvrđene cijene i verifikacije ne može biti dostupan.' }, 400)

  await db.prepare('INSERT INTO products (slug, name, price, size, category, image, short, description, details, verification_status, available, featured, reference_price, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').execute([
    body.slug,
    body.name.trim(),
    body.price ?? null,
    body.size ?? null,
    body.category ?? null,
    body.image ?? null,
    body.short ?? null,
    body.description ?? null,
    JSON.stringify(Array.isArray(body.details) ? body.details : []),
    body.verificationStatus ?? 'awaiting_confirmation',
    body.available ? 1 : 0,
    body.featured ? 1 : 0,
    body.referencePrice ?? null,
    body.sortOrder ?? 0,
  ])

  return c.json({ ok: true }, 201)
})

app.patch('/api/admin/products/:id', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Identifikator proizvoda nije validan.' }, 400)

  let body: Partial<ProductRow>
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400) }
  if (body.slug !== undefined && (typeof body.slug !== 'string' || !/^[a-z0-9](?:[a-z0-9_-]{0,180}[a-z0-9])?$/.test(body.slug))) {
    return c.json({ error: 'Potreban je valjani naziv (slug) proizvoda.' }, 400)
  }
  if (body.details !== undefined && (!Array.isArray(body.details) || body.details.length > 50 || body.details.some(detail => typeof detail !== 'string' || detail.length > 500))) return c.json({ error: 'Detalji proizvoda nisu validni.' }, 400)
  if (body.category !== undefined && body.category !== null && typeof body.category !== 'string') return c.json({ error: 'Kategorija proizvoda nije validna.' }, 400)
  if (body.image !== undefined && body.image !== null && (typeof body.image !== 'string' || body.image.length > 500 || !(body.image.startsWith('/api/images/') || /^https:\/\//i.test(body.image)))) return c.json({ error: 'Putanja fotografije nije validna.' }, 400)
  for (const [value, max, label] of [[body.size, 120, 'Veličina'], [body.short, 240, 'Kratki opis'], [body.description, 12000, 'Opis']] as const) if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > max)) return c.json({ error: `${label} je predugačak ili nije validan.` }, 400)
  if (body.referencePrice !== undefined && body.referencePrice !== null && (!Number.isSafeInteger(body.referencePrice) || body.referencePrice < 0 || body.referencePrice > 1000000)) return c.json({ error: 'Referentna cijena nije validna.' }, 400)
  if (body.sortOrder !== undefined && (!Number.isSafeInteger(body.sortOrder) || body.sortOrder < 0 || body.sortOrder > 100000)) return c.json({ error: 'Redoslijed prikaza nije validan.' }, 400)
  const [existingRows] = await db.prepare('SELECT id, slug, price, verification_status AS verificationStatus, available FROM products WHERE id = ?').execute([id]) as unknown as [{ id: number; slug: string; price: number | null; verificationStatus: ProductRow['verificationStatus']; available: number | boolean }[], unknown]
  const existing = existingRows[0]
  if (!existing) return c.json({ error: 'Proizvod nije pronađen.' }, 404)
  if (body.slug && body.slug !== existing.slug) {
    const [conflictRows] = await db.prepare('SELECT id FROM products WHERE slug = ? AND id != ?').execute([body.slug, id]) as unknown as [{ id: number }[], unknown]
    if (conflictRows.length) return c.json({ error: 'Proizvod s ovim nazivom već postoji.' }, 409)
  }
  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length < 3 || body.name.length > 200)) return c.json({ error: 'Naziv proizvoda mora imati od 3 do 200 znakova.' }, 400)
  if (body.price !== undefined && body.price !== null && (!Number.isSafeInteger(body.price) || body.price < 0 || body.price > 1000000)) return c.json({ error: 'Cijena mora biti cijeli iznos u KM.' }, 400)
  if (body.verificationStatus !== undefined && !['awaiting_confirmation', 'verified'].includes(body.verificationStatus)) return c.json({ error: 'Status provjere proizvoda nije validan.' }, 400)
  if ((body.available ?? Boolean(existing.available)) && ((body.price === undefined ? existing.price : body.price) === null || (body.verificationStatus ?? existing.verificationStatus) !== 'verified')) return c.json({ error: 'Proizvod bez potvrđene cijene i verifikacije ne može biti dostupan.' }, 400)

  if (body.category) {
    const [categoryRows] = await db.prepare('SELECT keyname FROM categories WHERE keyname = ?').execute([body.category]) as unknown as [{ keyname: string }[], unknown]
    if (!categoryRows.length) return c.json({ error: 'Odabrana kategorija ne postoji.' }, 400)
  }
  await db.prepare(`UPDATE products SET
    slug = IF(?, ?, slug),
    name = IF(?, ?, name),
    price = IF(?, ?, price),
    size = IF(?, ?, size),
    category = IF(?, ?, category),
    image = IF(?, ?, image),
    short = IF(?, ?, short),
    description = IF(?, ?, description),
    details = IF(?, ?, details),
    verification_status = IF(?, ?, verification_status),
    available = IF(?, ?, available),
    featured = IF(?, ?, featured),
    reference_price = IF(?, ?, reference_price),
    sort_order = IF(?, ?, sort_order)
  WHERE id = ?`).execute([
    body.slug !== undefined, body.slug ?? null,
    body.name !== undefined, body.name?.trim() ?? null,
    body.price !== undefined, body.price ?? null,
    body.size !== undefined, body.size ?? null,
    body.category !== undefined, body.category ?? null,
    body.image !== undefined, body.image ?? null,
    body.short !== undefined, body.short ?? null,
    body.description !== undefined, body.description ?? null,
    body.details !== undefined, JSON.stringify(Array.isArray(body.details) ? body.details : []),
    body.verificationStatus !== undefined, body.verificationStatus ?? null,
    body.available !== undefined, body.available ? 1 : 0,
    body.featured !== undefined, body.featured ? 1 : 0,
    body.referencePrice !== undefined, body.referencePrice ?? null,
    body.sortOrder !== undefined, body.sortOrder ?? null,
    id,
  ])

  return c.json({ ok: true })
})

app.delete('/api/admin/products/:id', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Identifikator proizvoda nije validan.' }, 400)

  const result = await db.prepare('DELETE FROM products WHERE id = ?').execute([id])
  if (!result.affectedRows) return c.json({ error: 'Proizvod nije pronađen.' }, 404)

  return c.json({ ok: true })
})

app.get('/api/categories', async (c) => {
  const db = c.var.db
  const [rows] = await db.prepare('SELECT keyname AS key, label, blurb, number, sort_order AS sortOrder FROM categories ORDER BY sort_order ASC, keyname ASC').execute() as unknown as { key: string; label: string; blurb: string | null; number: string | null; sortOrder: number }[][]
  return c.json({ results: rows }, 200)
})

app.get('/api/policies', async (c) => {
  const [rows] = await c.var.db.prepare('SELECT keyname AS key, title, content, sort_order AS sortOrder FROM store_policies ORDER BY sort_order ASC, keyname ASC').execute() as unknown as [{ key: string; title: string; content: string; sortOrder: number }[], unknown]
  return c.json({ results: rows }, 200, { 'cache-control': 'public, max-age=60' })
})

app.get('/api/admin/policies', async (c) => {
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)
  const [rows] = await c.var.db.prepare('SELECT keyname AS key, title, content, sort_order AS sortOrder FROM store_policies ORDER BY sort_order ASC, keyname ASC').execute() as unknown as [{ key: string; title: string; content: string; sortOrder: number }[], unknown]
  return c.json({ results: rows }, 200, ADMIN_HEADERS)
})

app.patch('/api/admin/policies/:key', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403, ADMIN_HEADERS)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)
  const key = c.req.param('key')
  if (!/^[a-z][a-z0-9_-]{0,39}$/.test(key)) return c.json({ error: 'Oznaka pravila nije validna.' }, 400, ADMIN_HEADERS)
  let body: { title?: unknown; content?: unknown }
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400, ADMIN_HEADERS) }
  if (typeof body.title !== 'string' || body.title.trim().length < 2 || body.title.length > 200 || typeof body.content !== 'string' || body.content.trim().length < 10 || body.content.length > 10000) return c.json({ error: 'Unesite naslov i sadržaj pravila.' }, 400, ADMIN_HEADERS)
  const [result] = await c.var.db.prepare('UPDATE store_policies SET title = ?, content = ? WHERE keyname = ?').execute([body.title.trim(), body.content.trim(), key]) as unknown as [mysql.ResultSetHeader, unknown]
  if (!result.affectedRows) return c.json({ error: 'Pravilo nije pronađeno.' }, 404, ADMIN_HEADERS)
  return c.json({ ok: true }, 200, ADMIN_HEADERS)
})

app.post('/api/admin/categories', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  let body: { key: string; label: string; blurb?: string | null; number?: string | null; sortOrder?: number }
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400) }

  if (typeof body.key !== 'string' || typeof body.label !== 'string' || !body.key || !/^[a-z0-9](?:[a-z0-9_-]{0,180}[a-z0-9])?$/.test(body.key)) {
    return c.json({ error: 'Potreban je valjani naziv (slug) kategorije.' }, 400)
  }
  if (!body.label || body.label.trim().length < 2 || body.label.length > 200) {
    return c.json({ error: 'Potreban je naziv kategorije.' }, 400)
  }
  if ((body.blurb != null && (typeof body.blurb !== 'string' || body.blurb.length > 255)) || (body.number != null && (typeof body.number !== 'string' || body.number.length > 20)) || (body.sortOrder !== undefined && (!Number.isSafeInteger(body.sortOrder) || body.sortOrder < 0 || body.sortOrder > 100000))) return c.json({ error: 'Detalji kategorije nisu validni.' }, 400)

  const [existingRows] = await db.prepare('SELECT keyname FROM categories WHERE keyname = ?').execute([body.key]) as unknown as [{ keyname: string }[], unknown]
  if (existingRows.length) return c.json({ error: 'Kategorija s ovim nazivom već postoji.' }, 409)

  await db.prepare('INSERT INTO categories (keyname, label, blurb, number, sort_order) VALUES (?, ?, ?, ?, ?)').execute([
    body.key,
    body.label.trim(),
    body.blurb ?? null,
    body.number ?? null,
    body.sortOrder ?? 0,
  ])

  return c.json({ ok: true }, 201)
})

app.patch('/api/admin/categories/:key', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  const key = c.req.param('key')
  if (!/^[a-z0-9](?:[a-z0-9_-]{0,180}[a-z0-9])?$/.test(key)) return c.json({ error: 'Identifikator kategorije nije validan.' }, 400)

  let body: Partial<{ label: string; blurb: string | null; number: string | null; sortOrder: number }>
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400) }
  if (body.label !== undefined && (typeof body.label !== 'string' || body.label.trim().length < 2 || body.label.length > 200)) return c.json({ error: 'Potreban je validan naziv kategorije.' }, 400)
  if ((body.blurb !== undefined && body.blurb !== null && (typeof body.blurb !== 'string' || body.blurb.length > 255)) || (body.number !== undefined && body.number !== null && (typeof body.number !== 'string' || body.number.length > 20)) || (body.sortOrder !== undefined && (!Number.isSafeInteger(body.sortOrder) || body.sortOrder < 0 || body.sortOrder > 100000))) return c.json({ error: 'Detalji kategorije nisu validni.' }, 400)

  const stmt = db.prepare('SELECT id FROM categories WHERE keyname = ?')
  const [existingRows] = await (stmt.execute([key]) as unknown) as [{ id: number }[], unknown]
  if (!existingRows.length) return c.json({ error: 'Kategorija nije pronađena.' }, 404)

  await db.prepare('UPDATE categories SET label = IF(?, ?, label), blurb = IF(?, ?, blurb), number = IF(?, ?, number), sort_order = IF(?, ?, sort_order) WHERE keyname = ?').execute([
    body.label !== undefined, body.label?.trim() ?? null,
    body.blurb !== undefined, body.blurb,
    body.number !== undefined, body.number,
    body.sortOrder !== undefined, body.sortOrder ?? null,
    key,
  ])

  return c.json({ ok: true })
})

app.delete('/api/admin/categories/:key', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  const key = c.req.param('key')
  if (!/^[a-z0-9](?:[a-z0-9_-]{0,180}[a-z0-9])?$/.test(key)) return c.json({ error: 'Identifikator kategorije nije validan.' }, 400)

  const stmt = db.prepare('SELECT id FROM categories WHERE keyname = ?')
  const [existingRows] = await (stmt.execute([key]) as unknown) as [{ id: number }[], unknown]
  if (!existingRows.length) return c.json({ error: 'Kategorija nije pronađena.' }, 404)

  await db.prepare('UPDATE products SET category = NULL WHERE category = ?').execute([key])
  const result = await db.prepare('DELETE FROM categories WHERE keyname = ?').execute([key])
  if (!result.affectedRows) return c.json({ error: 'Kategorija nije obrisana.' }, 404)

  return c.json({ ok: true })
})

app.get('/api/search-suggestions', async (c) => {
  const q = (c.req.query('q') ?? '').trim().toLowerCase()
  if (!q || q.length < 2) return c.json({ results: [] }, 200)

  const db = c.var.db
  const [rows] = await db.prepare('SELECT slug, name FROM products WHERE available = 1 AND (LOWER(name) LIKE ? OR LOWER(short) LIKE ?) LIMIT 12').execute([`%${q}%`, `%${q}%`]) as unknown as { slug: string; name: string }[][]
  return c.json({ results: rows.map((r: { slug: string; name: string }) => ({ slug: r.slug, name: r.name })) }, 200)
})

function baseUrlFor(c: { req: { header: (name: string) => string | undefined; url: string } }) {
  if (c.req.header('x-forwarded-proto')) {
    return `${c.req.header('x-forwarded-proto')}://${c.req.header('host')}`.replace(/[/]+$/, '')
  }
  return c.req.url.split('?')[0].replace(/[/]+$/, '')
}

app.get('*', async (c) => {
  const url = new URL(c.req.url)
  const path = decodeURIComponent(url.pathname)

  if (path === '/' || path.endsWith('.html')) {
    const index = join(STATIC_ROOT, 'index.html')
    let contents: Buffer
    try { contents = await readFile(index) } catch { return c.json({ error: 'Stranica nije pronađena.' }, 404) }
    const html = contents.toString('utf8').replace('<script type="module" crossorigin src="/assets/index-O9Ne7CiZ.js"></script>', `<script type="module" crossorigin src="/assets/index-O9Ne7CiZ.js" data-base="${baseUrlFor(c)}"></script>`)
    return new Response(html, {
      headers: { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' },
    })
  }

  const filePath = join(STATIC_ROOT, path)
  let stats: { isFile(): boolean } | null = null
  try { stats = await stat(filePath) } catch {}
  if (!stats || !stats.isFile()) {
    const index = join(STATIC_ROOT, 'index.html')
    let contents: Buffer
    try { contents = await readFile(index) } catch { return c.json({ error: 'Stranica nije pronađena.' }, 404) }
    const html = contents.toString('utf8').replace('<script type="module" crossorigin src="/assets/index-O9Ne7CiZ.js"></script>', `<script type="module" crossorigin src="/assets/index-O9Ne7CiZ.js" data-base="${baseUrlFor(c)}"></script>`)
    return new Response(html, {
      headers: { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' },
    })
  }

  const ext = extname(path).toLowerCase()
  const type = ext === '.css' ? 'text/css' : ext === '.js' ? 'application/javascript' : ext === '.svg' ? 'image/svg+xml' : ext === '.woff' ? 'font/woff' : ext === '.woff2' ? 'font/woff2' : ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'application/octet-stream'
  const contents = await readFile(filePath)
  return new Response(contents, {
    headers: {
      'Content-Type': type,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    },
  })
})

const port = Number(process.env.PORT ?? 3000)
const http = await import('node:http')
const serveStatic = async (request: Request, response: import('node:http').ServerResponse) => {
  const url = new URL(request.url)
  const path = decodeURIComponent(url.pathname)
  if (request.method !== 'GET' && request.method !== 'HEAD') return false
  if (url.pathname.startsWith('/api/')) return false

  const resolvedCandidate = resolve(STATIC_ROOT, `.${path}`)
  const isInsideRoot = resolvedCandidate === STATIC_ROOT || resolvedCandidate.startsWith(`${STATIC_ROOT}${sep}`)
  if (!isInsideRoot) return false
  const candidate = resolvedCandidate
  let isFile = false
  try { isFile = (await stat(candidate)).isFile() } catch {}
  const filePath = isFile ? candidate : join(STATIC_ROOT, 'index.html')
  try {
    const file = await readFile(filePath)
    const extension = extname(filePath).toLowerCase()
    const mime = extension === '.html' ? 'text/html; charset=utf-8' : extension === '.css' ? 'text/css' : extension === '.js' ? 'application/javascript' : extension === '.svg' ? 'image/svg+xml' : extension === '.woff2' ? 'font/woff2' : extension === '.woff' ? 'font/woff' : extension === '.png' ? 'image/png' : extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : extension === '.webp' ? 'image/webp' : 'application/octet-stream'
    response.statusCode = 200
    response.setHeader('content-type', mime)
    response.setHeader('cache-control', extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable')
    response.end(request.method === 'HEAD' ? undefined : file)
    return true
  } catch {
    return false
  }
}

const server = http.createServer(async (request, response) => {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.from(chunk))
  const requestUrl = `http://${request.headers.host ?? 'localhost'}${request.url ?? '/'}`
  const body = chunks.length ? Buffer.concat(chunks) : undefined
  const apiRequest = new Request(requestUrl, {
    method: request.method,
    headers: request.headers as HeadersInit,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : body,
  })
  const isApiRequest = new URL(requestUrl).pathname.startsWith('/api/')
  if (!isApiRequest) {
    if (await serveStatic(apiRequest, response)) return
    response.statusCode = 404
    response.end('Not found')
    return
  }

  if (!DATABASE_URL) {
    response.statusCode = 503
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({ error: 'Baza podataka nije povezana. Dodajte varijablu DATABASE_URL na Railway servis, ili povežite MySQL servis kao referencu.' }))
    return
  }

  let connection: mysql.Connection | undefined
  const openConnection = async () => {
    connection ??= await mysql.createConnection(DATABASE_URL)
    return connection
  }
  // Opened on first query so the admin login and other database-free routes still work
  // while the database is starting up or briefly unavailable.
  const db: SqlDb = {
    async query(sql, params) { return (await openConnection()).query(sql, params as never) },
    prepare(sql) {
      return { async execute(params) { return (await openConnection()).execute(sql, params as never) } }
    },
    async end() { const current = connection; connection = undefined; await current?.end().catch(() => {}) },
  }
  try {
    const result = await app.fetch(apiRequest, { db } as never)
    response.statusCode = result.status
    result.headers.forEach((value, key) => response.setHeader(key, value))
    response.end(Buffer.from(await result.arrayBuffer()))
  } catch (error) {
    console.error('Railway request failed:', error instanceof Error ? error.message : error)
    response.statusCode = 503
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({ error: 'Servis trenutno nije dostupan.' }))
  } finally {
    await connection?.end().catch(() => {})
  }
})

server.listen(port, '0.0.0.0', () => console.log(`BioHerbica listening on ${port}`))

function validString(value: unknown, min: number, max: number): value is string {
  return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max
}

function rowToProduct(row: mysql.RowDataPacket): ProductRow {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    price: row.price == null ? null : Number(row.price),
    size: row.size == null ? null : String(row.size),
    category: row.category == null ? null : String(row.category),
    image: row.image == null ? null : String(row.image),
    short: row.short == null ? null : String(row.short),
    description: row.description == null ? null : String(row.description),
    details: Array.isArray(row.details) ? row.details.map(String) : row.details == null ? [] : JSON.parse(String(row.details)),
    verificationStatus: String(row.verificationStatus ?? row.verification_status) as ProductRow['verificationStatus'],
    available: Boolean(row.available),
    featured: Boolean(row.featured),
    referencePrice: (row.referencePrice ?? row.reference_price) == null ? null : Number(row.referencePrice ?? row.reference_price),
    sortOrder: Number(row.sortOrder ?? row.sort_order),
    createdAt: String(row.createdAt ?? row.created_at),
  }
}
