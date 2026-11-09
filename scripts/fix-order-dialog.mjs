import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'

const CHECKOUT = 'src/app/pages/Checkout.tsx'
const WORKFLOW = '.github/workflows/fix-order-dialog.yml'

let source = readFileSync(CHECKOUT, 'utf8')

function replaceOnce(from, to, label) {
  const first = source.indexOf(from)
  if (first === -1) throw new Error(label + ': anchor nije pronaden')
  source = source.slice(0, first) + to + source.slice(first + from.length)
}

function removeLine(needle, label) {
  const index = source.indexOf(needle)
  if (index === -1) throw new Error(label + ': linija nije pronadena')
  const start = source.lastIndexOf('\n', index) + 1
  let end = source.indexOf('\n', index)
  if (end === -1) end = source.length
  source = source.slice(0, start) + source.slice(end + 1)
}

replaceOnce(
  "import { Navigate, useLocation, useParams } from 'react-router'",
  "import { Navigate, useLocation, useNavigate, useParams } from 'react-router'",
  'checkout: uvoz useNavigate'
)

replaceOnce(
  'const { loading: catalogLoading } = useCatalog()',
  'const { loading: catalogLoading } = useCatalog()\n  const navigate = useNavigate()',
  'checkout: navigate'
)

removeLine('const [sent, setSent] = useState', 'checkout: uklanjanje sent stanja')
removeLine('if (sent) return <Container', 'checkout: uklanjanje sent guarda')
removeLine('// Korpa se prazni', 'checkout: uklanjanje starog komentara')
removeLine('cart.clear()', 'checkout: uklanjanje preranog praznjenja korpe')

replaceOnce(
  'setSent({ reference: body.reference })',
  "navigate('/order/' + body.reference, { replace: true, state: { reference: body.reference, customer: form, items: cart.items, subtotal: body.subtotal ?? cart.subtotal } })",
  'checkout: prelazak na potvrdu'
)

replaceOnce(
  '  const [checked, setChecked] = useState(false)',
  '  const [checked, setChecked] = useState(false)\n  const cart = useCart()\n  const [showDialog, setShowDialog] = useState(Boolean(state))\n  // Korpa se prazni tek na stranici potvrde, pa checkout ne presmjerava na /shop.\n  useEffect(() => { if (state) cart.clear() }, [])',
  'potvrda: stanje dijaloga i praznjenje korpe'
)

replaceOnce(
  '<Container className="pt-16 sm:pt-24">',
  '<Container className="pt-16 sm:pt-24">\n    {showDialog && state ? <OrderSentDialog reference={reference} onClose={() => setShowDialog(false)} /> : null}',
  'potvrda: prikaz dijaloga'
)

if (source.includes('setSent')) throw new Error('checkout: sent je ostao')
if (!source.includes('useNavigate')) throw new Error('checkout: navigate nije dodat')
if (!source.includes('showDialog && state')) throw new Error('potvrda: dijalog nije dodat')
if (!source.includes('cart.clear()')) throw new Error('potvrda: korpa se ne prazni')

writeFileSync(CHECKOUT, source)
console.log('Checkout.tsx: tok narudzbe je prepravljen')

unlinkSync(WORKFLOW)
unlinkSync(new URL(import.meta.url))
console.log('Privremeni fajlovi su uklonjeni')
