CREATE TABLE IF NOT EXISTS orders (
  reference TEXT PRIMARY KEY,
  customer_json TEXT NOT NULL,
  items_json TEXT NOT NULL,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  delivery_charge INTEGER CHECK (delivery_charge IS NULL OR delivery_charge >= 0),
  total INTEGER CHECK (total IS NULL OR total >= subtotal),
  payment_method TEXT NOT NULL CHECK (payment_method = 'Plaćanje pouzećem'),
  status TEXT NOT NULL CHECK (status IN ('Novo', 'Potvrđeno', 'U pripremi', 'Poslano', 'Isporučeno', 'Otkazano')),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
