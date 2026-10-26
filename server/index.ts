import { Hono } from 'hono'
import mysql from 'mysql2/promise'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STATIC_ROOT = join(__dirname, '..', 'dist', 'client')


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
const ADMIN_CODE = (process.env.ADMIN_CODE ?? '').trim()
const IMAGE_KEY_RE = /^[a-zA-Z0-9][a-zA-Z0-9/_-]{0,180}\.(?:jpg|jpeg|png|webp)$/i
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

const app = new Hono()

app.onError((error, c) => {
  console.error('BioHerbica backend request failed:', error.name, error.message)
  try {
    if (c.var.db) {
      c.var.db.end().catch(() => {})
    }
  } catch {}
  return c.json({ error: 'Zahtjev trenutno nije moguće obraditi.' }, 500)
})

function adminFor(c: { req: { header: (name: string) => string | undefined } }) {
  const admin = c.req.header('x-bioherbica-admin')
  return admin && admin === ADMIN_CODE ? admin : null
}


app.get('/api/health', async (c) => {
  try {
    await c.var.db.query('SELECT 1')
    return c.json({ ok: true, database: true })
  } catch {
    return c.json({ ok: false, database: false }, 503)
  }
})

app.post('/api/orders', async (c) => {
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
    }            const [productRows] = await db.prepare('SELECT id, slug, name, price, available, verification_status AS verificationStatus FROM products WHERE slug = ?').execute([item.id]) as unknown as ProductRow[][]
    const productRow = productRows[0] as ProductRow | undefined
    if (!productRow || !productRow.available || productRow.price == null || productRow.verificationStatus !== 'verified') {
      return c.json({ error: 'Jedan ili više proizvoda još nisu dostupni za naručivanje.' }, 409)
    }
    lines.push({ product: productRow as ProductRow, quantity: item.quantity })
  }

  const subtotal = lines.reduce((sum, line) => sum + (line.product.price ?? 0) * line.quantity, 0)
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
    return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)
  }
  const db = c.var.db as unknown as SqlDb
  const [rows] = await db.prepare('SELECT reference, customer_json AS customerJson, items_json AS itemsJson, subtotal, delivery_charge AS deliveryCharge, total, payment_method AS paymentMethod, status, created_at AS createdAt FROM orders ORDER BY created_at DESC LIMIT 250').execute() as Order[][]
  return c.json({ results: rows }, 200, ADMIN_HEADERS)
})

app.patch('/api/admin/orders/:reference', async (c) => {
  if (!adminFor(c)) {
    return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)
  }
  const db = c.var.db as unknown as SqlDb
  const reference = c.req.param('reference')

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
  if (!adminFor(c)) return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)

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
  const key = decodeURIComponent(c.req.param('key'))
  if (!IMAGE_KEY_RE.test(key)) return c.json({ error: 'Naziv slike nije validan.' }, 400)
  if (!adminFor(c)) return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)

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
  const key = decodeURIComponent(c.req.param('key'))
  if (!IMAGE_KEY_RE.test(key)) return c.json({ error: 'Naziv slike nije validan.' }, 400)
  if (!adminFor(c)) return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  const [rows] = await db.prepare('DELETE FROM product_images WHERE keyname = ?').execute([key]) as unknown as { keyname: string }[][]
  if (!rows.length) return c.json({ error: 'Slika nije pronađena.' }, 404)

  return c.json({ ok: true })
})

app.get('/api/admin/products', async (c) => {
  if (!adminFor(c)) return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  const [rows] = await db.prepare('SELECT id, slug, name, price, size, category, image, short, description, details, verification_status AS verificationStatus, available, featured, reference_price AS referencePrice, sort_order AS sortOrder, created_at AS createdAt FROM products ORDER BY sort_order ASC, id ASC').execute() as unknown as mysql.RowDataPacket[][]
  return c.json({ results: rows.map(rowToProduct) }, 200, ADMIN_HEADERS)
})

app.get('/api/products', async (c) => {
  const db = c.var.db
  const [rows] = await db.prepare('SELECT id, slug, name, price, size, category, image, short, description, details, verification_status AS verificationStatus, available, featured, reference_price AS referencePrice, sort_order AS sortOrder, created_at AS createdAt FROM products ORDER BY sort_order ASC, id ASC').execute() as unknown as mysql.RowDataPacket[][]
  return c.json({ results: rows.map(rowToProduct) }, 200)
})

app.get('/api/featured-products', async (c) => {
  const db = c.var.db
  const [rows] = await db.prepare('SELECT id, slug, name, price, size, category, image, short, description, details, verification_status AS verificationStatus, available, featured, reference_price AS referencePrice, sort_order AS sortOrder, created_at AS createdAt FROM products WHERE featured = 1 ORDER BY sort_order ASC, id ASC').execute() as unknown as mysql.RowDataPacket[][]
  return c.json({ results: rows.map(rowToProduct) }, 200)
})

app.post('/api/admin/products', async (c) => {
  if (!adminFor(c)) return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  let body: Partial<ProductRow>
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400) }

  if (!body.slug || !/^[a-z0-9](?:[a-z0-9_-]{0,180}[a-z0-9])?$/.test(body.slug)) {
    return c.json({ error: 'Potreban je valjani naziv (slug) proizvoda.' }, 400)
  }
  if (!body.name || body.name.trim().length < 3) {
    return c.json({ error: 'Potreban je naziv proizvoda.' }, 400)
  }

  const stmt = db.prepare('SELECT id FROM products WHERE slug = ?')
  const [existingRows] = await db.prepare('SELECT id FROM products WHERE slug = ?').execute([body.slug]) as unknown as [{ id: number }[], unknown]
  if (existingRows.length) return c.json({ error: 'Proizvod s ovim nazivom već postoji.' }, 409)

  await db.prepare('INSERT INTO products (slug, name, price, size, category, image, short, description, details, verification_status, available, featured, reference_price, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').execute([
    body.slug,
    body.name,
    body.price ?? null,
    body.size ?? null,
    body.category ?? null,
    body.image ?? null,
    body.short ?? null,
    body.description ?? null,
    body.details ?? null,
    body.verificationStatus ?? 'awaiting_confirmation',
    body.available ? 1 : 0,
    body.featured ? 1 : 0,
    body.referencePrice ?? null,
    body.sortOrder ?? 0,
  ])

  return c.json({ ok: true }, 201)
})

app.patch('/api/admin/products/:id', async (c) => {
  if (!adminFor(c)) return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Identifikator proizvoda nije validan.' }, 400)

  let body: Partial<ProductRow>
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400) }

  if (body.slug && !/^[a-z0-9](?:[a-z0-9_-]{0,180}[a-z0-9])?$/.test(body.slug)) {
    return c.json({ error: 'Potreban je valjani naziv (slug) proizvoda.' }, 400)
  }
  if (body.slug) {
  const stmt = db.prepare('SELECT id FROM products WHERE slug = ? AND id != ?')
  const [conflictRows] = await db.prepare('SELECT id FROM products WHERE slug = ? AND id != ?').execute([body.slug, id]) as unknown as [{ id: number }[], unknown]
  if (conflictRows.length) return c.json({ error: 'Proizvod s ovim nazivom već postoji.' }, 409)
  }

  await db.prepare(`UPDATE products SET
    slug = IFNULL(?, slug),
    name = IFNULL(?, name),
    price = ?,
    size = IFNULL(?, size),
    category = IFNULL(?, category),
    image = IFNULL(?, image),
    short = IFNULL(?, short),
    description = IFNULL(?, description),
    details = IFNULL(?, details),
    verification_status = IFNULL(?, verification_status),
    available = IFNULL(?, available),
    featured = IFNULL(?, featured),
    reference_price = ?,
    sort_order = IFNULL(?, sort_order)
  WHERE id = ?`).execute([
    body.slug ?? null,
    body.name ?? null,
    body.price ?? null,
    body.size ?? null,
    body.category ?? null,
    body.image ?? null,
    body.short ?? null,
    body.description ?? null,
    body.details ?? null,
    body.verificationStatus ?? null,
    body.available !== undefined ? (body.available ? 1 : 0) : null,
    body.featured !== undefined ? (body.featured ? 1 : 0) : null,
    body.referencePrice ?? null,
    body.sortOrder ?? null,
    id,
  ])

  return c.json({ ok: true })
})

app.delete('/api/admin/products/:id', async (c) => {
  if (!adminFor(c)) return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Identifikator proizvoda nije validan.' }, 400)

  await db.prepare(`UPDATE orders SET items_json = JSON_SET(items_json, '$[*].deleted', 1) WHERE JSON_SEARCH(items_json, 'one', ?) IS NOT NULL`).execute([id])
  const result = await db.prepare('DELETE FROM products WHERE id = ?').execute([id])
  if (!result.affectedRows) return c.json({ error: 'Proizvod nije pronađen.' }, 404)

  return c.json({ ok: true })
})

app.get('/api/categories', async (c) => {
  const db = c.var.db
  const [rows] = await db.prepare('SELECT keyname AS key, label, blurb, number, sort_order AS sortOrder FROM categories ORDER BY sort_order ASC, keyname ASC').execute() as unknown as { key: string; label: string; blurb: string | null; number: string | null; sortOrder: number }[][]
  return c.json({ results: rows }, 200)
})

app.post('/api/admin/categories', async (c) => {
  if (!adminFor(c)) return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  let body: { key: string; label: string; blurb?: string; number?: string; sortOrder?: number }
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400) }

  if (!body.key || !/^[a-z0-9](?:[a-z0-9_-]{0,180}[a-z0-9])?$/.test(body.key)) {
    return c.json({ error: 'Potreban je valjani naziv (slug) kategorije.' }, 400)
  }
  if (!body.label || body.label.trim().length < 2) {
    return c.json({ error: 'Potreban je naziv kategorije.' }, 400)
  }

  const stmt = db.prepare('SELECT id FROM categories WHERE keyname = ?')
  const [existingRows] = await db.prepare('SELECT id FROM categories WHERE keyname = ?').execute([body.key]) as unknown as [{ id: number }[], unknown]
  if (existingRows.length) return c.json({ error: 'Kategorija s ovim nazivom već postoji.' }, 409)

  await db.prepare('INSERT INTO categories (keyname, label, blurb, number, sort_order) VALUES (?, ?, ?, ?, ?)').execute([
    body.key,
    body.label,
    body.blurb ?? null,
    body.number ?? null,
    body.sortOrder ?? 0,
  ])

  return c.json({ ok: true }, 201)
})

app.patch('/api/admin/categories/:key', async (c) => {
  if (!adminFor(c)) return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)

  const db = c.var.db
  const key = c.req.param('key')
  if (!/^[a-z0-9](?:[a-z0-9_-]{0,180}[a-z0-9])?$/.test(key)) return c.json({ error: 'Identifikator kategorije nije validan.' }, 400)

  let body: Partial<{ label: string; blurb: string | null; number: string | null; sortOrder: number }>
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400) }

  const stmt = db.prepare('SELECT id FROM categories WHERE keyname = ?')
  const [existingRows] = await (stmt.execute([key]) as unknown) as [{ id: number }[], unknown]
  if (!existingRows.length) return c.json({ error: 'Kategorija nije pronađena.' }, 404)

  await db.prepare('UPDATE categories SET label = IFNULL(?, label), blurb = ?, number = ?, sort_order = IFNULL(?, sort_order) WHERE keyname = ?').execute([
    body.label ?? null,
    body.blurb ?? null,
    body.number ?? null,
    body.sortOrder ?? null,
    key,
  ])

  return c.json({ ok: true })
})

app.delete('/api/admin/categories/:key', async (c) => {
  if (!adminFor(c)) return c.json({ error: 'Pin nije odobren.' }, 401, ADMIN_HEADERS)

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

  const candidate = join(STATIC_ROOT, path)
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

  if (!process.env.DATABASE_URL) {
    response.statusCode = 503
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({ error: 'DATABASE_URL nije konfigurisan.' }))
    return
  }

  let connection: mysql.Connection | undefined
  try {
    connection = await mysql.createConnection(process.env.DATABASE_URL)
    const result = await app.fetch(apiRequest, { Variables: { db: connection } as never })
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
    verificationStatus: String(row.verification_status) as ProductRow['verificationStatus'],
    available: Boolean(row.available),
    featured: Boolean(row.featured),
    referencePrice: row.reference_price == null ? null : Number(row.reference_price),
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
  }
}
