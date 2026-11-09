import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'

const SERVER = 'server/index.ts'
const SCHEMA = 'server/schema.ts'
const DASHBOARD = 'src/app/pages/AdminDashboard.tsx'
const WORKFLOW = '.github/workflows/admin-patch.yml'

function read(path) { return readFileSync(path, 'utf8') }
function save(path, content) { writeFileSync(path, content) }

function replaceOnce(source, from, to, label) {
  const first = source.indexOf(from)
  if (first === -1) throw new Error(label + ': anchor nije pronaden')
  if (source.indexOf(from, first + from.length) !== -1) throw new Error(label + ': anchor nije jedinstven')
  return source.slice(0, first) + to + source.slice(first + from.length)
}

function insertBefore(source, anchor, text, label) {
  const index = source.indexOf(anchor)
  if (index === -1) throw new Error(label + ': anchor nije pronaden')
  return source.slice(0, index) + text + source.slice(index)
}

function cutSection(source, start, end, label, replacement = '') {
  const startIndex = source.indexOf(start)
  if (startIndex === -1) throw new Error(label + ': pocetak nije pronaden')
  const endIndex = source.indexOf(end, startIndex + start.length)
  if (endIndex === -1) throw new Error(label + ': kraj nije pronaden')
  return source.slice(0, startIndex) + replacement + source.slice(endIndex)
}

const ORDER_UPDATE_TAIL = `  if (body.trackingCode !== undefined && body.trackingCode !== null && (typeof body.trackingCode !== 'string' || body.trackingCode.trim().length > 60)) {
    return c.json({ error: 'Kod pracenja moze imati najvise 60 znakova.' }, 400)
  }

  // mysql2 resolves execute() with [rows, fields]; the header has to be unpacked.
  const [existingRows] = await db.prepare('SELECT reference FROM orders WHERE reference = ?').execute([reference]) as unknown as [{ reference: string }[], unknown]
  if (!existingRows.length) {
    return c.json({ error: 'Narudzba ' + reference + ' nije pronadena.' }, 404)
  }

  if (body.deliveryCharge === undefined) {
    await db.prepare('UPDATE orders SET status = ? WHERE reference = ?').execute([body.status, reference])
  } else {
    const delta = body.deliveryCharge
    await db.prepare('UPDATE orders SET status = ?, delivery_charge = ?, total = subtotal + ? WHERE reference = ?').execute([body.status, delta, delta, reference])
  }

  if (body.trackingCode !== undefined) {
    await db.prepare('UPDATE orders SET tracking_code = ? WHERE reference = ?').execute([body.trackingCode ? body.trackingCode.trim() : null, reference])
  }

  return c.json({ ok: true })
})

`

const ORDER_EXTRA_ROUTES = `app.delete('/api/admin/orders/:reference', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)
  const db = c.var.db as unknown as SqlDb
  const reference = c.req.param('reference')
  if (!/^BH-[A-Z0-9]{8}$/.test(reference)) return c.json({ error: 'Referenca narudzbe nije validna.' }, 400)

  const [rows] = await db.prepare('SELECT status FROM orders WHERE reference = ?').execute([reference]) as unknown as [{ status: OrderStatus }[], unknown]
  const row = rows[0]
  if (!row) return c.json({ error: 'Narudzba ' + reference + ' nije pronadena.' }, 404)
  if (row.status !== 'Otkazano') return c.json({ error: 'Narudzbu ' + reference + ' mozete obrisati samo kada je otkazana.' }, 409)

  await db.prepare('DELETE FROM orders WHERE reference = ?').execute([reference])
  return c.json({ ok: true })
})

app.post('/api/admin/orders/:reference/email', async (c) => {
  if (!isSameOrigin(c.req.raw)) return c.json({ error: 'Zahtjev nije poslan s ove stranice.' }, 403)
  if (!adminFor(c)) return c.json({ error: 'Prijava nije odobrena.' }, 401, ADMIN_HEADERS)
  const db = c.var.db as unknown as SqlDb
  const reference = c.req.param('reference')
  if (!/^BH-[A-Z0-9]{8}$/.test(reference)) return c.json({ error: 'Referenca narudzbe nije validna.' }, 400)

  let body: { trackingCode?: unknown }
  try { body = await c.req.json() } catch { return c.json({ error: 'Podaci nisu ispravni.' }, 400) }
  const trackingCode = typeof body.trackingCode === 'string' ? body.trackingCode.trim() : ''
  if (!trackingCode || trackingCode.length > 60) return c.json({ error: 'Unesite kod pracenja posiljke.' }, 400)

  const [rows] = await db.prepare('SELECT CAST(customer_json AS CHAR) AS customerJson FROM orders WHERE reference = ?').execute([reference]) as unknown as [{ customerJson: string }[], unknown]
  const row = rows[0]
  if (!row) return c.json({ error: 'Narudzba ' + reference + ' nije pronadena.' }, 404)

  let customer: { name?: string; email?: string } = {}
  try { customer = JSON.parse(row.customerJson) as typeof customer } catch { customer = {} }
  const email = (customer.email ?? '').trim()
  if (!email) return c.json({ error: 'Narudzba ' + reference + ' nema email kupca.' }, 400)

  const apiKey = (process.env.RESEND_API_KEY ?? '').trim()
  const from = (process.env.ORDER_EMAIL_FROM ?? '').trim()
  if (!apiKey || !from) {
    return c.json({ error: 'Slanje emaila nije podeseno. Postavite RESEND_API_KEY i ORDER_EMAIL_FROM na Railway servisu.' }, 503)
  }

  const text = [
    'Postovani ' + (customer.name ?? 'kupce') + ',',
    '',
    'Vasa narudzba ' + reference + ' je predata posti.',
    'Kod za pracenje posiljke: ' + trackingCode,
    '',
    'Status narudzbe: ' + baseUrlFor(c) + '/track',
    '',
    'BioHerbica',
  ].join('\\n')

  let delivered = false
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: [email], subject: 'BioHerbica - pracenje narudzbe ' + reference, text }),
    })
    delivered = response.ok
    if (!delivered) console.error('Resend rejected the tracking email:', response.status, await response.text().catch(() => ''))
  } catch (error) {
    console.error('Tracking email failed:', error instanceof Error ? error.message : error)
  }

  if (!delivered) return c.json({ error: 'Email nije poslan. Provjerite RESEND_API_KEY i adresu posiljaoca.' }, 502)

  const sentAt = new Date().toISOString()
  await db.prepare('UPDATE orders SET tracking_code = ?, tracking_sent_at = ? WHERE reference = ?').execute([trackingCode, sentAt, reference])
  return c.json({ ok: true, sentTo: email, sentAt })
})

`

let server = read(SERVER)

server = replaceOnce(
  server,
  'status, created_at AS createdAt FROM orders ORDER BY created_at DESC LIMIT 250',
  'status, created_at AS createdAt, tracking_code AS trackingCode, tracking_sent_at AS trackingSentAt FROM orders ORDER BY created_at DESC LIMIT 250',
  'server: lista narudzbi vraca kod pracenja'
)

server = replaceOnce(
  server,
  'let body: { status?: OrderStatus; deliveryCharge?: number | null }',
  'let body: { status?: OrderStatus; deliveryCharge?: number | null; trackingCode?: string | null }',
  'server: tijelo zahtjeva prima trackingCode'
)

server = cutSection(
  server,
  '  let result: mysql.ResultSetHeader',
  "app.get('/api/admin/images/:key{.+}', async (c) => {",
  'server: promjena statusa',
  ORDER_UPDATE_TAIL
)

server = insertBefore(server, "app.get('/api/admin/images/:key{.+}', async (c) => {", ORDER_EXTRA_ROUTES, 'server: brisanje i email')

if (server.includes('let result: mysql.ResultSetHeader')) throw new Error('server: stari kod nije uklonjen')
if (!server.includes('tracking_code AS trackingCode')) throw new Error('server: lista nije dopunjena')
if (!server.includes("app.delete('/api/admin/orders/:reference'")) throw new Error('server: ruta za brisanje nije dodata')
if (!server.includes('api.resend.com')) throw new Error('server: slanje emaila nije dodato')
save(SERVER, server)
console.log('server/index.ts je dopunjen')

let schema = read(SCHEMA)

schema = replaceOnce(
  schema,
  '    created_at DATETIME NOT NULL,\n    INDEX orders_created_at_idx (created_at)',
  '    created_at DATETIME NOT NULL,\n    tracking_code VARCHAR(60) NULL,\n    tracking_sent_at VARCHAR(40) NULL,\n    INDEX orders_created_at_idx (created_at)',
  'schema: nove kolone'
)

const MIGRATION = `    // Postal tracking codes are added after the parcel leaves the store.
    for (const column of ['tracking_code', 'tracking_sent_at']) {
      await run('add orders.' + column, async () => {
        const [rows] = await db.query<mysql.RowDataPacket[]>(
          "SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = ?",
          [column]
        )
        if (Number(rows[0]?.count ?? 0) > 0) return
        const definition = column === 'tracking_code' ? 'VARCHAR(60) NULL' : 'VARCHAR(40) NULL'
        await db.query('ALTER TABLE orders ADD COLUMN ' + column + ' ' + definition + ' AFTER created_at')
      })
    }

`

schema = insertBefore(schema, "    if (created.has('categories')) {", MIGRATION, 'schema: migracija')
save(SCHEMA, schema)
console.log('server/schema.ts je dopunjen')

let dashboard = read(DASHBOARD)

dashboard = replaceOnce(
  dashboard,
  "import { Admin as AdminPanel } from './Admin'",
  "import { Admin as AdminPanel } from './Admin'\nimport { AdminOrders } from './AdminOrders'",
  'dashboard: uvoz komponente'
)

dashboard = replaceOnce(
  dashboard,
  "const statuses: Status[] = ['Novo', 'Potvrdeno', 'U pripremi', 'Poslano', 'Isporuceno', 'Otkazano']",
  '',
  'dashboard: uklanjanje liste statusa'
)

dashboard = cutSection(
  dashboard,
  '  async function updateOrderStatus',
  '  function saveWebhook',
  'dashboard: uklanjanje starih akcija narudzbi'
)

dashboard = cutSection(
  dashboard,
  "      {tab === 'orders' && (",
  "      {tab === 'requests' && (",
  'dashboard: zamjena sekcije narudzbi',
  "      {tab === 'orders' && <AdminOrders />}\n\n"
)

if (!dashboard.includes('<AdminOrders />')) throw new Error('dashboard: komponenta nije povezana')
if (dashboard.includes('updateOrderStatus')) throw new Error('dashboard: stara akcija je ostala')
save(DASHBOARD, dashboard)
console.log('src/app/pages/AdminDashboard.tsx je povezan sa novom sekcijom')

unlinkSync(WORKFLOW)
unlinkSync(new URL(import.meta.url))
console.log('Privremeni workflow i skripta su uklonjeni')
