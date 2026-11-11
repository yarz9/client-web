import { readFile, writeFile } from 'node:fs/promises'

const PATH = 'server/index.ts'
let source = await readFile(PATH, 'utf8')
const applied = []

function edit(name, find, replace, expected = 1) {
  const flags = find.flags.includes('g') ? find.flags : find.flags + 'g'
  const matches = source.match(new RegExp(find.source, flags)) ?? []
  if (matches.length === 0) throw new Error(`${name}: no match`)
  if (expected !== null && matches.length !== expected) throw new Error(`${name}: expected ${expected} match(es), found ${matches.length}`)
  source = source.replace(find, () => replace)
  applied.push(`${name} (${matches.length})`)
}

const HELPERS = `const dbPool = DATABASE_URL ? mysql.createPool(DATABASE_URL) : null

async function acquireConnection() {
  if (!dbPool) throw new Error('Baza podataka nije povezana.')
  return dbPool.getConnection()
}

const MAX_BODY_BYTES = 64 * 1024
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024

const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // discord.com ostaje dozvoljen dok se Discord obavještenje ne prebaci na server.
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://discord.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
}

function safeDecodePath(value: string): string | null {
  try { return decodeURIComponent(value) } catch { return null }
}

function sniffImage(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp'
  return null
}

function storedPhoneMatches(customerJson: string, phone: string) {
  try {
    const customer = JSON.parse(customerJson) as { phone?: unknown }
    const stored = String(customer.phone ?? '').replace(/\\D/g, '')
    return stored.length >= 6 && stored.endsWith(phone.slice(-6))
  } catch { return false }
}

const publicAttempts = new Map<string, { count: number; resetAt: number }>()

// Jednostavan klizni prozor za javne rute. Ključ je IP adresa koju je dodao proxy.
function takePublicSlot(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  if (publicAttempts.size > 5000) {
    for (const [entryKey, entry] of publicAttempts) if (entry.resetAt <= now) publicAttempts.delete(entryKey)
  }
  const current = publicAttempts.get(key)
  if (!current || current.resetAt <= now) {
    publicAttempts.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (current.count >= limit) return false
  current.count += 1
  return true
}

// Kupac dobija token uz potvrdu narudžbe, pa praćenje radi bez čuvanja ličnih podataka.
function trackTokenFor(reference: string) {
  const secret = sessionSecret()
  if (!secret) return ''
  return createHmac('sha256', secret).update('bioherbica-track:' + reference).digest('base64url').slice(0, 32)
}

const app = new Hono<{ Bindings: { db: SqlDb } }>()`

edit('helpers', /const app = new Hono<\{ Bindings: \{ db: SqlDb \} \}>\(\)/, HELPERS)

edit(
  'requestKey uses proxy IP',
  /function requestKey\(request: Request\) \{\s*return request\.headers\.get\('x-forwarded-for'\)\?\.split\(','\)\[0\]\?\.trim\(\) \|\| 'unknown'\s*\}/,
  `function requestKey(request: Request) {
  const chain = request.headers.get('x-forwarded-for')?.split(',').map((part) => part.trim()).filter(Boolean) ?? []
  return chain[chain.length - 1] ?? request.headers.get('x-real-ip')?.trim() ?? 'unknown'
}`,
)

edit(
  'no derived session key in production',
  /function sessionSecret\(\) \{\s*const configured = \(process\.env\.ADMIN_SESSION_SECRET \?\? ''\)\.trim\(\)\s*if \(configured\.length >= 32\) return configured/,
  `function sessionSecret() {
  const configured = (process.env.ADMIN_SESSION_SECRET ?? '').trim()
  if (configured.length >= 32) return configured
  if (process.env.NODE_ENV === 'production') return ''`,
)

edit('shorter admin session', /const ADMIN_SESSION_SECONDS = 8 \* 60 \* 60/, 'const ADMIN_SESSION_SECONDS = 4 * 60 * 60')

edit(
  'per-username login limit',
  /const \{ username, password \} = adminCredentials\(\)\s*const validLogin =/,
  `const submittedName = typeof body.username === 'string' ? body.username.trim().toLowerCase().slice(0, 128) : ''
  const userKey = 'user:' + (submittedName || 'unknown')
  const userAttempt = loginAttempts.get(userKey)
  if (userAttempt && userAttempt.count >= 10 && userAttempt.resetAt > now) return c.json({ error: 'Previše pokušaja. Sačekajte 15 minuta.' }, 429, { ...ADMIN_HEADERS, 'Retry-After': String(Math.ceil((userAttempt.resetAt - now) / 1000)) })
  const { username, password } = adminCredentials()
  const validLogin =`,
)

edit(
  'count failed logins per username',
  /current\.count \+= 1; loginAttempts\.set\(key, current\)/,
  `current.count += 1; loginAttempts.set(key, current)
    const userFailure = loginAttempts.get(userKey)
    const userNext = userFailure && userFailure.resetAt > now ? userFailure : { count: 0, resetAt: now + 15 * 60 * 1000 }
    userNext.count += 1; loginAttempts.set(userKey, userNext)`,
)

edit('clear both login counters', /loginAttempts\.delete\(key\)\s*const nonce = randomBytes\(24\)/, `loginAttempts.delete(key)
  loginAttempts.delete(userKey)
  const nonce = randomBytes(24)`)

edit(
  'database-free health probe',
  /app\.get\('\/api\/health', async \(c\) => \{/,
  `app.get('/api/healthz', (c) => c.json({ ok: true, service: 'bioherbica' }, 200, { 'cache-control': 'no-store' }))

app.get('/api/health', async (c) => {`,
)

edit(
  'limit public order submissions',
  /app\.post\('\/api\/orders', async \(c\) => \{\s*if \(!isSameOrigin\(c\.req\.raw\)\) return c\.json\(\{ error: 'Zahtjev nije poslan s ove stranice\.' \}, 403\)/,
  `app.post('/api/orders', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  if (!takePublicSlot('order:' + requestKey(c.req.raw), 5, 10 * 60 * 1000)) return c.json({ error: 'Previše zahtjeva. Pokušajte ponovo za nekoliko minuta.' }, 429, { 'Retry-After': '600' })`,
)

edit(
  'return tracking token with the order',
  /return c\.json\(\{ reference, subtotal, deliveryCharge: null, total: null, status: 'Novo', createdAt \}, 201\)/,
  "return c.json({ reference, subtotal, deliveryCharge: null, total: null, status: 'Novo', createdAt, trackToken: trackTokenFor(reference) }, 201)",
)

const TRACK_ROUTE = `app.post('/api/orders/track', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  if (!takePublicSlot('track:' + requestKey(c.req.raw), 20, 15 * 60 * 1000)) return c.json({ error: 'Previše provjera. Sačekajte 15 minuta.' }, 429, { 'Retry-After': '900' })
  let body: { reference?: unknown; phone?: unknown; token?: unknown }
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci za praćenje nisu ispravni.' }, 400) }
  const reference = typeof body.reference === 'string' ? body.reference.trim().toUpperCase() : ''
  if (!/^BH-[A-Z0-9]{8}$/.test(reference)) return c.json({ error: 'Referenca narudžbe nije validna.' }, 400)
  const phone = typeof body.phone === 'string' ? body.phone.replace(/\\D/g, '') : ''
  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const [rows] = await c.var.db.prepare('SELECT reference, CAST(customer_json AS CHAR) AS customerJson, CAST(items_json AS CHAR) AS itemsJson, subtotal, delivery_charge AS deliveryCharge, total, status, created_at AS createdAt, tracking_code AS trackingCode FROM orders WHERE reference = ?').execute([reference]) as unknown as [{ reference: string; customerJson: string; itemsJson: string; subtotal: number; deliveryCharge: number | null; total: number | null; status: OrderStatus; createdAt: string; trackingCode: string | null }[], unknown]
  const row = rows[0]
  const tokenValid = token.length > 0 && secureEqual(token, trackTokenFor(reference))
  const phoneValid = phone.length >= 6 && row ? storedPhoneMatches(row.customerJson, phone) : false
  if (!row || (!tokenValid && !phoneValid)) return c.json({ error: 'Narudžba nije pronađena ili podaci ne odgovaraju.' }, 404)
  let items: OrderItem[] = []
  try { const parsed = JSON.parse(row.itemsJson); if (Array.isArray(parsed)) items = parsed as OrderItem[] } catch { items = [] }
  return c.json({
    reference: row.reference,
    status: row.status,
    createdAt: row.createdAt,
    trackingCode: row.trackingCode ?? '',
    subtotal: row.subtotal,
    deliveryCharge: row.deliveryCharge,
    total: row.total,
    items: items.map((item) => ({ name: String(item?.name ?? ''), option: item?.option, quantity: Number(item?.quantity ?? 0), unitPrice: Number(item?.unitPrice ?? 0), lineTotal: Number(item?.lineTotal ?? 0) })),
  }, 200, { 'cache-control': 'no-store' })
})

app.get('/api/admin/orders', async (c) => {`

edit('public tracking endpoint', /app\.get\('\/api\/admin\/orders', async \(c\) => \{/, TRACK_ROUTE)

edit(
  'accept multipart uploads',
  /const contentType = c\.req\.header\('content-type'\) \?\? ''\s*if \(!\['image\/jpeg', 'image\/png', 'image\/webp'\]\.includes\(contentType\)\) return c\.json\(\{ error: 'Dozvoljene su JPG, PNG i WebP slike\.' \}, 415\)\s*/,
  '',
)

edit(
  'validate uploaded image bytes',
  /const file = form\.get\('file'\)\s*if \(!\(file instanceof File\) \|\| !file\.size \|\| file\.size > 5 \* 1024 \* 1024 \|\| file\.type !== contentType\) \{\s*return c\.json\(\{ error: 'Slika mora biti ispravna i manja od 5 MB\.' \}, 413\)\s*\}/,
  `const file = form.get('file')
  if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024) {
    return c.json({ error: 'Slika mora biti ispravna i manja od 5 MB.' }, 413)
  }
  const imageBytes = new Uint8Array(await file.arrayBuffer())
  const mimetype = sniffImage(imageBytes)
  if (!mimetype) return c.json({ error: 'Dozvoljene su JPG, PNG i WebP slike.' }, 415)`,
)

edit('store sniffed mime type', /\.execute\(\[key, contentType, await file\.arrayBuffer\(\)\]\)/, '.execute([key, mimetype, imageBytes])')

edit(
  'image routes decode safely',
  /const key = decodeURIComponent\(c\.req\.param\('key'\)\)/,
  `const decodedKey = safeDecodePath(c.req.param('key'))
  if (decodedKey === null) return c.json({ error: 'Naziv slike nije validan.' }, 400)
  const key = decodedKey`,
  null,
)

edit(
  'single page fallback decodes safely',
  /const url = new URL\(c\.req\.url\)\s*const path = decodeURIComponent\(url\.pathname\)/,
  `const url = new URL(c.req.url)
  const decoded = safeDecodePath(url.pathname)
  if (decoded === null) return c.json({ error: 'Stranica nije pronađena.' }, 400)
  const path = decoded`,
)

edit(
  'static files decode safely',
  /const serveStatic = async \(request: Request, response: import\('node:http'\)\.ServerResponse\) => \{\s*const url = new URL\(request\.url\)\s*const path = decodeURIComponent\(url\.pathname\)/,
  `const serveStatic = async (request: Request, response: import('node:http').ServerResponse) => {
  const url = new URL(request.url)
  const decodedPath = safeDecodePath(url.pathname)
  if (decodedPath === null) {
    response.statusCode = 400
    response.end('Bad request')
    return true
  }
  const path = decodedPath`,
)

edit(
  'cap request bodies',
  /const chunks: Buffer\[\] = \[\]\s*for await \(const chunk of request\) chunks\.push\(Buffer\.from\(chunk\)\)/,
  `const chunks: Buffer[] = []
  const bodyLimit = (request.url ?? '').startsWith('/api/admin/images') ? MAX_UPLOAD_BYTES : MAX_BODY_BYTES
  let receivedBytes = 0
  let bodyTooLarge = false
  for await (const chunk of request) {
    receivedBytes += chunk.length
    if (receivedBytes > bodyLimit) { bodyTooLarge = true; break }
    chunks.push(Buffer.from(chunk))
  }
  if (bodyTooLarge) {
    response.statusCode = 413
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({ error: 'Zahtjev je prevelik.' }))
    return
  }`,
)

edit(
  'security headers and error boundary',
  /const server = http\.createServer\(async \(request, response\) => \{/,
  `const server = http.createServer(async (request, response) => {
  for (const [headerName, headerValue] of Object.entries(SECURITY_HEADERS)) response.setHeader(headerName, headerValue)
  try {`,
)

edit('pool connection type', /let connection: mysql\.Connection \| undefined/, 'let connection: mysql.PoolConnection | undefined')

edit('use the pool', /connection \?\?= await mysql\.createConnection\(DATABASE_URL\)/, 'connection ??= await acquireConnection()')

edit(
  'release pooled connections',
  /async end\(\) \{ const current = connection; connection = undefined; await current\?\.end\(\)\.catch\(\(\) => \{\}\) \}/,
  'async end() { await Promise.resolve() }',
)

edit(
  'close the error boundary',
  /\} finally \{\s*await connection\?\.end\(\)\.catch\(\(\) => \{\}\)\s*\}\s*\}\)/,
  `} finally { await connection?.release() }
  } catch (error) {
    console.error('BioHerbica request failed:', error instanceof Error ? error.message : error)
    if (!response.headersSent) {
      response.statusCode = 500
      response.setHeader('content-type', 'application/json; charset=utf-8')
      response.end(JSON.stringify({ error: 'Zahtjev trenutno nije moguće obraditi.' }))
    }
  }
})`,
)

edit(
  'log unhandled rejections',
  /server\.listen\(port, '0\.0\.0\.0', \(\) => console\.log\(`BioHerbica listening on \$\{port\}`\)\)/,
  "server.listen(port, '0.0.0.0', () => console.log('BioHerbica listening on ' + port))\n\nprocess.on('unhandledRejection', (reason) => {\n  console.error('BioHerbica unhandled rejection:', reason instanceof Error ? reason.message : reason)\n})",
)

edit(
  'escape search wildcards',
  /const \[rows\] = await db\.prepare\('SELECT slug, name FROM products WHERE available = 1 AND \(LOWER\(name\) LIKE \? OR LOWER\(short\) LIKE \?\) LIMIT 12'\)\.execute\(\[`%\$\{q\}%`, `%\$\{q\}%`\]\)/,
  `const needle = '%' + q.replace(/[%_\\\\]/g, '') + '%'
  const [rows] = await db.prepare('SELECT slug, name FROM products WHERE available = 1 AND (LOWER(name) LIKE ? OR LOWER(short) LIKE ?) LIMIT 12').execute([needle, needle])`,
)

await writeFile(PATH, source, 'utf8')
console.log('Applied ' + applied.length + ' edits:')
for (const entry of applied) console.log(' - ' + entry)
