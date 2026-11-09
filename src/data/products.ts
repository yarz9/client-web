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

export type ProductOption = { label: string; price: number }

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
  options?: ProductOption[]
  verificationStatus: VerificationStatus
  available: boolean
  featured?: boolean
}

const pulmoMedDescription = `PulmoMed je prirodni biljni pripravak na bazi meda, obogaćen pažljivo odabranom kombinacijom biljnih sastojaka: korijenom bijelog sljeza, korijenom sladića, timijanom, majčinom dušicom, kamilicom, matičnjakom i polenom u prahu.

Sinergijsko djelovanje meda i biljnih sastojaka pruža prirodnu podršku zdravlju dišnih puteva te doprinosi umirivanju nadraženog grla i osjećaja grebanja u grlu.

Bijeli sljez i sladić tradicionalno se koriste u pripravcima za njegu sluznice dišnih puteva. Njihovi biljni sastojci doprinose umirivanju nadražene sluznice i osjećaja suhoće u grlu.

Timijan i majčina dušica poznati su po svojoj tradicionalnoj primjeni kod tegoba dišnih puteva. Posebno su cijenjeni kao biljni sastojci u pripravcima namijenjenim olakšavanju iskašljavanja i njezi dišnih puteva.

Kamilica i matičnjak upotpunjuju biljnu formulaciju svojim umirujućim svojstvima, dok polen u prahu dodatno obogaćuje sastav prirodnim hranjivim tvarima.

Zahvaljujući pažljivo odabranoj kombinaciji biljnih sastojaka i meda, PulmoMed predstavlja prirodni biljni pripravak ugodnog okusa, namijenjen svakodnevnoj njezi grla i dišnih puteva.

Prednosti PulmoMed pripravka:

• Sadrži kombinaciju sedam pažljivo odabranih prirodnih sastojaka.
• Bijeli sljez i sladić tradicionalno se koriste za umirivanje nadražene sluznice.
• Timijan i majčina dušica poznati su po tradicionalnoj primjeni kod kašlja.
• Kamilica i matičnjak upotpunjuju biljnu formulaciju.
• Med daje pripravku prirodnu slatkoću i ugodan okus.
• Obogaćen polenom u prahu.

Sastav:

Med, korijen bijelog sljeza, korijen sladića, timijan (list), majčina dušica (list), kamilica (cvijet), matičnjak (list) i polen u prahu.`

const pulmoMedDetails = [
  'Sastav: med, korijen bijelog sljeza, korijen sladića, timijan (list), majčina dušica (list), kamilica (cvijet), matičnjak (list) i polen u prahu.',
  'Pakovanja: 250 g — 12 KM · 350 g — 17 KM.',
  'Sadrži med i pčelinji polen; nije namijenjen osobama alergičnim na pčelinje proizvode.',
  'Zbog sadržaja sladića, osobe s povišenim krvnim pritiskom, bolestima srca ili bubrega, kao i trudnice i dojilje, trebaju se prije upotrebe posavjetovati sa zdravstvenim radnikom.',
  'Ne preporučuje se djeci mlađoj od godinu dana zbog sadržaja meda.',
]

// Development references only. Historical amounts are kept separate from live prices.
// Nothing is purchasable until the owner confirms the full product listing.
export const products: Product[] = [
  { slug: 'q10-nar-divlja-ruza', name: 'Q10 anti-age krema — nar i divlja ruža', price: null, referencePrice: 30, size: '50 g (ranije navedeno)', category: 'njega-lica', image: '/images/products/q10-nar-divlja-ruza.webp', short: 'Ranije objavljena cijena nije potvrđena', description: 'Razvojna stavka iz ranije javne objave. Aktuelni opis, cijena, sastav, dostupnost i klasifikacija čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false, featured: true },
  { slug: 'krema-mjesovita-masna-koza', name: 'Krema za mješovitu i masnu kožu', price: null, referencePrice: 25, category: 'njega-lica', image: '/images/products/krema-mjesovita-masna-koza.webp', short: 'Cijena iz ranije objave čeka potvrdu', description: 'Razvojna stavka iz ranije javne objave. Aktuelni opis, cijena, sastav, dostupnost i klasifikacija čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false, featured: true },
  { slug: 'krema-smilje-hijaluronska', name: 'Krema smilje sa hijaluronskom kiselinom', price: null, category: 'njega-lica', image: '/images/products/hydrance-cream.webp', short: 'Cijena i veličina nisu potvrđene', description: 'Privremeni kataloški unos. Naziv, sastav, veličinu, cijenu, dostupnost i klasifikaciju potvrđuje vlasnica prije objave.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'bioherbica-hair-mask', name: 'Hair Mask', price: null, size: '200 ml (ranije navedeno)', category: 'njega-kose', image: '/images/products/bioherbica-hair-mask.webp', short: 'Privremeni unos — detalji čekaju potvrdu', description: 'Privremeni razvojni unos na osnovu ranije informacije o veličini. Aktuelni naziv, opis, cijena, dostupnost i klasifikacija čekaju potvrdu.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'zlatni-serum', name: 'Zlatni serum', price: null, category: 'njega-lica', image: '/images/products/zlatni-serum.webp', short: 'Cijena, veličina i opis nisu potvrđeni', description: 'Privremeni kataloški unos. Sve pojedinosti potvrđuje vlasnica prije objave.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'rucno-radjeni-sapun', name: 'Ručno rađeni sapuni', price: null, category: 'sapuni', image: '', short: 'Varijante i cijene čekaju potvrdu', description: 'Privremeni kataloški unos. Varijante, sastav, cijene i dostupnost potvrđuje vlasnica prije objave.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'piling-za-tijelo', name: 'Piling za tijelo', price: null, category: 'njega-tijela', image: '/images/products/piling-za-tijelo.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'hair-repair-cream', name: 'Hair Repair Cream', price: null, category: 'njega-kose', image: '/images/products/hair-repair-cream.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'sebo-balance', name: 'Sebo Balance', price: null, category: 'njega-lica', image: '/images/products/sebo-balance.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'cleansing-foam', name: 'Cleansing Foam', price: null, category: 'njega-lica', image: '/images/products/cleansing-foam.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'prirodni-dezodorans', name: 'Prirodni dezodorans', price: null, category: 'njega-tijela', image: '/images/products/prirodni-dezodorans.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'tonik-za-kosu', name: 'Tonik za kosu', price: null, category: 'njega-kose', image: '/images/products/tonik-za-kosu.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'sampon-za-rast-kose', name: 'Šampon za rast kose', price: null, category: 'njega-kose', image: '/images/products/sampon-za-rast-kose.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice. Naziv ne predstavlja potvrđenu tvrdnju o djelovanju proizvoda.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'rosopas-melem', name: 'Rosopas melem', price: null, category: 'biljni-preparati', image: '/images/products/rosopas-melem.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'nevenova-mast', name: 'Nevenova mast', price: null, category: 'biljni-preparati', image: '/images/products/nevenova-mast.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'gavez-mast', name: 'Gavez mast', price: null, category: 'biljni-preparati', image: '/images/products/gavez-mast.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'njegujuci-melem', name: 'Njegujući melem', price: null, category: 'biljni-preparati', image: '/images/products/njegujuci-melem.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'sos-biljni-melem', name: 'S.O.S. biljni melem', price: null, category: 'biljni-preparati', image: '/images/products/sos-biljni-melem.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'ulje-kantariona', name: 'Ulje kantariona', price: null, category: 'biljni-preparati', image: '/images/products/ulje-kantariona.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'ulje-maslacka', name: 'Ulje maslačka', price: null, category: 'biljni-preparati', image: '/images/products/ulje-maslacka.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'ulje-nevena', name: 'Ulje nevena', price: null, category: 'biljni-preparati', image: '/images/products/ulje-nevena.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'ricinusovo-ulje', name: 'Ricinusovo ulje', price: null, category: 'biljni-preparati', image: '/images/products/ricinusovo-ulje.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Opis, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'sok-od-borovnice', name: 'Sok od borovnice', price: null, category: 'voca-i-med', image: '/images/products/sok-od-borovnice.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Sastav, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'sok-od-jabuke', name: 'Sok od jabuke', price: null, category: 'voca-i-med', image: '/images/products/sok-od-jabuke.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Sastav, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'djeciji-pekmez', name: 'Dječiji pekmez', price: null, category: 'voca-i-med', image: '/images/products/djeciji-pekmez.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Sastav, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'kopriva-i-aronija', name: 'Kopriva i aronija', price: null, category: 'voca-i-med', image: '/images/products/kopriva-i-aronija.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Sastav, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'vocni-eliksir', name: 'Voćni eliksir', price: null, category: 'voca-i-med', image: '/images/products/vocni-eliksir.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Sastav, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'zlatna-snaga', name: 'Zlatna snaga', price: null, category: 'voca-i-med', image: '/images/products/zlatna-snaga.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Sastav, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'sok-od-aronije', name: 'Sok od aronije sa jabukom', price: null, category: 'voca-i-med', image: '/images/products/sok-od-aronije.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Sastav, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'pulmomed', name: 'PulmoMed – Biljni med za dišne puteve', price: 12, category: 'voca-i-med', image: '', short: 'Biljni med sa sladićem, bijelim sljezom, timijanom i polenom', description: pulmoMedDescription, details: pulmoMedDetails, options: [{ label: '250 g', price: 12 }, { label: '350 g', price: 17 }], verificationStatus: 'verified', available: true },
]

export const bySlug = (slug: string) => products.find((product) => product.slug === slug)
export const featured = products.filter((product) => product.featured)
export const newArrivals = products.slice(0, 8)
