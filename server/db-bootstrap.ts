import mysql from 'mysql2/promise'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const db = await mysql.createConnection(dbUrl)

try {
  await db.query('CREATE TABLE IF NOT EXISTS orders (reference TEXT PRIMARY KEY, customer_json TEXT NOT NULL, items_json TEXT NOT NULL, subtotal INTEGER NOT NULL CHECK (subtotal >= 0), delivery_charge INTEGER CHECK (delivery_charge IS NULL OR delivery_charge >= 0), total INTEGER CHECK (total IS NULL OR total >= subtotal), payment_method TEXT NOT NULL CHECK (payment_method = ?) , status TEXT NOT NULL CHECK (status IN (?, ?, ?, ?, ?, ?)), created_at TEXT NOT NULL, INDEX orders_created_at_idx (created_at DESC))', ['Plaćanje pouzećem', 'Novo', 'Potvrđeno', 'U pripremi', 'Poslano', 'Isporučeno', 'Otkazano'])
  await db.query('CREATE TABLE IF NOT EXISTS product_images (keyname VARCHAR(200) PRIMARY KEY, mimetype VARCHAR(120) NOT NULL, data LONGBLOB NOT NULL, created_at DATETIME NOT NULL)')
  await db.query('CREATE TABLE IF NOT EXISTS products (id INT AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(200) NOT NULL UNIQUE, name VARCHAR(200) NOT NULL, price INTEGER NULL, size VARCHAR(120) NULL, category VARCHAR(120) NULL, image VARCHAR(500) NULL, short VARCHAR(240) NULL, description TEXT NULL, details JSON NULL, verification_status ENUM("awaiting_confirmation","verified") NOT NULL DEFAULT "awaiting_confirmation", available TINYINT NOT NULL DEFAULT 0, featured TINYINT NOT NULL DEFAULT 0, reference_price INTEGER NULL, sort_order INTEGER NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX products_category_idx (category), INDEX products_verification_idx (verification_status), INDEX products_available_idx (available))')
  await db.query('CREATE TABLE IF NOT EXISTS categories (keyname VARCHAR(200) PRIMARY KEY, label VARCHAR(200) NOT NULL, blurb VARCHAR(255) NULL, number VARCHAR(20) NULL, sort_order INTEGER NOT NULL DEFAULT 0)')
  console.log('Database tables ready.')
} catch (error) {
  console.error('Database bootstrap failed:', error)
  process.exit(1)
} finally {
  await db.end()
}
