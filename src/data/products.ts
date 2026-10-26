export type Category =
  | 'njega-lica'
  | 'njega-tijela'
  | 'njega-kose'
  | 'sapuni'
  | 'biljni-preparati'
  | 'cajevi'
  | 'voca-i-med'

export const categories: { key: Category; label: string; blurb: string; number: string }[] = [
  { key: 'njega-lica', label: 'Njega lica', blurb: 'Kreme, serumi i svakodnevni rituali', number: '01' },
  { key: 'njega-tijela', label: 'Njega tijela', blurb: 'Mali trenuci pažnje prema sebi', number: '02' },
  { key: 'njega-kose', label: 'Njega kose', blurb: 'Njega osmišljena za kosu', number: '03' },
  { key: 'sapuni', label: 'Ručno rađeni sapuni', blurb: 'Za svakodnevnu njegu i darivanje', number: '04' },
  { key: 'biljni-preparati', label: 'Biljni preparati i ulja', blurb: 'Biljne formulacije i ulja', number: '05' },
  { key: 'cajevi', label: 'Čajevi i mješavine', blurb: 'Biljke za trenutke predaha', number: '06' },
  { key: 'voca-i-med', label: 'Voće, med i pekmez', blurb: 'Sokovi, namazi i voćne delicije', number: '07' },
]

export type VerificationStatus = 'awaiting_confirmation' | 'verified'

export interface Product {
  slug: string
  name: string
  price: number | null
  referencePrice?: number
  size?: string
  category: Category
  image: string
  short: string
  description: string
  details: string[]
  verificationStatus: VerificationStatus
  available: boolean
  featured?: boolean
}

// Development references only. Historical amounts are kept separate from live prices.
// Nothing is purchasable until the owner confirms the full product listing.
export const products: Product[] = [
  { slug: 'q10-nar-divlja-ruza', name: 'Q10 anti-age krema — nar i divlja ruža', price: null, referencePrice: 30, size: '50 g (ranije navedeno)', category: 'njega-lica', image: '', short: 'Ranije objavljena cijena nije potvrđena', description: 'Razvojna stavka iz ranije javne objave. Aktuelni opis, cijena, sastav, dostupnost i klasifikacija čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false, featured: true },
  { slug: 'krema-mjesovita-masna-koza', name: 'Krema za mješovitu i masnu kožu', price: null, referencePrice: 25, category: 'njega-lica', image: '', short: 'Cijena iz ranije objave čeka potvrdu', description: 'Razvojna stavka iz ranije javne objave. Aktuelni opis, cijena, sastav, dostupnost i klasifikacija čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false, featured: true },
  { slug: 'krema-smilje-hijaluronska', name: 'Krema za lice sa smiljem', price: null, category: 'njega-lica', image: '', short: 'Cijena i veličina nisu potvrđene', description: 'Privremeni kataloški unos. Naziv, sastav, veličinu, cijenu, dostupnost i klasifikaciju potvrđuje vlasnica prije objave.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'bioherbica-hair-mask', name: 'Maska za kosu', price: null, size: '200 ml (ranije navedeno)', category: 'njega-kose', image: '', short: 'Privremeni unos — detalji čekaju potvrdu', description: 'Privremeni razvojni unos na osnovu ranije informacije o veličini. Aktuelni naziv, opis, cijena, dostupnost i klasifikacija čekaju potvrdu.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'zlatni-serum', name: 'Zlatni serum', price: null, category: 'njega-lica', image: '', short: 'Cijena, veličina i opis nisu potvrđeni', description: 'Privremeni kataloški unos. Sve pojedinosti potvrđuje vlasnica prije objave.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'rucno-radjeni-sapun', name: 'Ručno rađeni sapuni', price: null, category: 'sapuni', image: '', short: 'Varijante i cijene čekaju potvrdu', description: 'Privremeni kataloški unos. Varijante, sastav, cijene i dostupnost potvrđuje vlasnica prije objave.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
]

export const bySlug = (slug: string) => products.find((product) => product.slug === slug)
export const featured = products.filter((product) => product.featured)
export const newArrivals = products.slice(0, 4)
