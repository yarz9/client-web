import mysql from 'mysql2/promise'

export type SeedCategory = { key: string; label: string; blurb: string; number: string }
export type SeedProduct = {
  slug: string
  name: string
  price: number | null
  size?: string | null
  category: string
  image?: string | null
  short: string
  description: string
  details: string[]
options?: { label: string; price: number }[] | null
  verificationStatus: 'awaiting_confirmation' | 'verified'
  available: boolean
  featured?: boolean
  referencePrice?: number | null
}
export type SeedCatalogue = { categories: SeedCategory[]; products: SeedProduct[] }

export type SetupReport = {
  ok: boolean
  products: number
failures: { step: string; code: string; message: string }[]
}

// Packagings the catalogue used to list as separate products. They are removed on
// boot so a product that gained a packaging choice is not shown twice.
const SUPERSEDED_SLUGS = ['pulmomed-200g', 'pulmomed-350g']

const policies: [string, string, string][] = [
['merchant', 'Informacije o prodavcu', 'Puni naziv poslovnog subjekta, adresa sjedišta, registracijski i kontakt podaci čekaju potvrdu vlasnice.'],
  ['orders', 'Narudžbe i plaćanje', 'Plaćanje je zamišljeno kao plaćanje pouzećem. Narudžba se smatra zahtjevom dok BioHerbica ne potvrdi dostupnost i cijenu dostave.\nOnline naplata nije omogućena.'],
  ['delivery', 'Dostava', 'Kurirska služba, područja dostave, cijena dostave, rokovi isporuke i postupak u slučaju nepreuzete pošiljke čekaju potvrdu.'],
['returns', 'Povrat i reklamacije', 'Postupak odustanka od kupovine, povrata robe, reklamacija i rokovi za njihovo rješavanje moraju biti dostavljeni i odobreni prije početka prodaje.'],
  ['privacy', 'Privatnost i lični podaci', 'Zahtjev za narudžbu se čuva u Railway MySQL bazi koju održava vlasnik projekta.\nU bazu se upisuju ime, telefon, grad, adresa, opciona napomena i email, artikli s cijenama zabilježenim u trenutku zahtjeva, način plaćanja, status i vrijeme slanja. Pristup narudžbama ograničen je na zaštićeni administratorski panel; podaci se ne prikazuju javno.\nVlasnica prije lansiranja treba odrediti rok čuvanja, voditelja obrade i kanal za zahtjeve kupaca te potvrditi konačnu obavijest o privatnosti.'],
  ['legal', 'Lokalna provjera', 'Ovaj sadržaj je razvojni podsjetnik, nije pravno mišljenje ni konačan tekst uslova.\nPrije objave prodaje zatražite lokalnu pravnu provjeru za propise Bosne i Hercegovine.'],
]

const tables: [string, string][] = [
  ['categories', `CREATE TABLE IF NOT EXISTS categories (
    keyname VARCHAR(200) PRIMARY KEY,
    label VARCHAR(200) NOT NULL,
    blurb VARCHAR(255) NULL,
    number VARCHAR(20) NULL,
sort_order INT NOT NULL DEFAULT 0
  )`],
  ['products', `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(200) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    price INT NULL,
    size VARCHAR(120) NULL,
    category VARCHAR(200) NULL,
    image VARCHAR(500) NULL,
    short VARCHAR(240) NULL,
description TEXT NULL,
    details JSON NULL,
    options JSON NULL,
    verification_status ENUM('awaiting_confirmation','verified') NOT NULL DEFAULT 'awaiting_confirmation',
    available TINYINT(1) NOT NULL DEFAULT 0,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    reference_price INT NULL,
    sort_order INT NOT NULL DEFAULT 0,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX products_category_idx (category),
    INDEX products_verification_idx (verification_status),
    INDEX products_available_idx (available)
  )`],
  // created_at je tekst jer aplikacija upisuje ISO 8601 vrijednost sa završnim Z, a
  // MySQL DATETIME odbija taj zapis (ERROR 1292). ISO stringovi se sortiraju ispravno.
  ['orders', `CREATE TABLE IF NOT EXISTS orders (
    reference VARCHAR(32) PRIMARY KEY,
    customer_json JSON NOT NULL,
items_json JSON NOT NULL,
    subtotal INT NOT NULL CHECK (subtotal >= 0),
    delivery_charge INT NULL CHECK (delivery_charge IS NULL OR delivery_charge >= 0),
    total INT NULL CHECK (total IS NULL OR total >= 0),
    payment_method VARCHAR(40) NOT NULL DEFAULT 'Plaćanje pouzećem' CHECK (payment_method = 'Plaćanje pouzećem'),
status ENUM('Novo','Potvrđeno','U pripremi','Poslano','Isporučeno','Otkazano') NOT NULL DEFAULT 'Novo',
    created_at VARCHAR(40) NOT NULL,
    INDEX orders_created_at_idx (created_at)
  )`],
  ['product_images', `CREATE TABLE IF NOT EXISTS product_images (
    keyname VARCHAR(200) PRIMARY KEY,
    mimetype VARCHAR(120) NOT NULL,
data LONGBLOB NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`],
  ['store_policies', `CREATE TABLE IF NOT EXISTS store_policies (
    keyname VARCHAR(40) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`],
]

function describe(error: unknown) {
  const candidate = error as { code?: string; errno?: number; sqlMessage?: string; message?: string }
  return {
    code: String(candidate.code ?? candidate.errno ?? 'unknown'),
    message:
String(candidate.sqlMessage ?? candidate.message ?? 'unknown error'),
  }
}

// Creates the tables and adds any missing catalogue entries. Each step is reported
// separately and nothing is overwritten, so it is safe to run on every boot.
export async function ensureSchema(dbUrl: string, seed: SeedCatalogue): Promise<SetupReport> {
const failures: SetupReport['failures'] = []
  const db = await mysql.createConnection(dbUrl)
  const created = new Set<string>()

  const run = async (step: string, work: () => Promise<unknown>) => {
    try {
      await work()
      return true
    } catch (error) {
      const detail = describe(error)
      failures.push({ step, ...detail })
console.error(`Database setup step failed: ${step} (${detail.code}): ${detail.message}`)
      return false
    }
  }

  try {
    for (const [name, sql] of tables) {
      if (await run(`create ${name}`, () => db.query(sql))) created.add(name)
    }

    // Tables created before packagings existed still need the column.
await run('add products.options', async () => {
      const [rows] = await db.query<mysql.RowDataPacket[]>("SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'options'")
      if (Number(rows[0]?.count ?? 0) > 0) return
      await db.query('ALTER TABLE products ADD COLUMN options JSON NULL AFTER details')
    })

    // Baza kreirana ranije ima created_at kao DATETIME, što odbija ISO 8601 zapis.
    await run('widen orders.created_at', async () => {
      const [rows] = await db.query<mysql.RowDataPacket[]>("SELECT DATA_TYPE AS dataType FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'created_at'")
      if (String(rows[0]?.dataType ?? '').toLowerCase() === 'varchar') return
      await db.query('ALTER TABLE orders MODIFY COLUMN created_at VARCHAR(40) NOT NULL')
    })

    if (created.has('categories')) {
      await run('seed categories', async () => {
        const [[row]] = await db.query<mysql.RowDataPacket[]>('SELECT COUNT(*) AS count FROM categories')
        if (Number(row.count) > 0) return
for (const [sortOrder, category] of seed.categories.entries()) {
          await db.execute('INSERT INTO categories (keyname, label, blurb, number, sort_order) VALUES (?, ?, ?, ?, ?)', [category.key, category.label, category.blurb, category.number, sortOrder])
        }
      })
    }

    if (created.has('store_policies')) {
await run('seed policies', async () => {
        const [[row]] = await db.query<mysql.RowDataPacket[]>('SELECT COUNT(*) AS count FROM store_policies')
        if (Number(row.count) > 0) return
        for (const [sortOrder, [key, title, content]] of policies.entries()) {
          await db.execute('INSERT INTO store_policies (keyname, title, content, sort_order) VALUES (?, ?, ?, ?)', [key, title, content, sortOrder])
        }
      })
    }

    if (created.has('products')) {
      await run('seed products', async () => {
        for (const [sortOrder, product] of seed.products.entries()) {
          await db.execute('INSERT INTO products (slug, name, price, size, category, image, short, description, details, options, verification_status, available, featured, reference_price, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE image = IF(image IS NULL OR image = ?, VALUES(image), image), options = IF(options IS NULL, VALUES(options), options)', [product.slug, product.name, product.price, product.size ?? null, product.category, product.image || null, product.short, product.description, JSON.stringify(product.details), product.options ? JSON.stringify(product.options) : null,
product.verificationStatus, product.available ? 1 : 0, product.featured ? 1 : 0, product.referencePrice ?? null, sortOrder, ''])
        }
      })

      await run('remove superseded packagings', async () => {
        for (const slug of SUPERSEDED_SLUGS) {
          await db.execute('DELETE FROM products WHERE slug = ?', [slug])
        }
      })

      // A placeholder that the owner has since confirmed in the code becomes a real
      // listing, photo and all. Only rows still awaiting confirmation are touched, so
      // anything edited later in the admin panel survives the next deploy.
      await run('confirm verified products', async () => {
        for (const product of seed.products) {
          if (product.verificationStatus !== 'verified') continue
          await db.execute(
            "UPDATE products SET name = ?, price = ?, size = ?, category = ?, image = COALESCE(NULLIF(?, ''), image), short = ?, description = ?, details = ?, options = COALESCE(?, options), verification_status = 'verified', available = ?, reference_price = ? WHERE slug = ? AND verification_status = 'awaiting_confirmation'",
            [product.name, product.price, product.size ?? null, product.category, product.image || '', product.short, product.description, JSON.stringify(product.details), product.options ? JSON.stringify(product.options) : null, product.available ? 1 : 0, product.referencePrice ?? null, product.slug]
          )
        }
      })
    }
const [[countRow]] = await db.query<mysql.RowDataPacket[]>('SELECT COUNT(*) AS count FROM products').catch(() => [[{ count: 0 }] as mysql.RowDataPacket[]] as unknown as [mysql.RowDataPacket[], unknown])
    return { ok: failures.length === 0, products: Number(countRow?.count ?? 0), failures }
  } finally {
    await db.end().catch(() => {})
  }
}
