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

const pulmoMedDescription = `Ova pažljivo pripremljena biljna medna mješavina predstavlja spoj tradicionalno cijenjenih ljekovitih biljaka, prirodnog meda i polena. Formulisana je kombinacijom pažljivo odabranih biljnih sastojaka koji se u tradicionalnoj fitoterapiji koriste zbog svojih umirujućih, zaštitnih i njegujućih svojstava.

Bogata i aromatična baza prirodnog meda sjedinjuje se s korijenom sladića, bijelog sljeza, timijanom, majčinom dušicom, kamilicom i matičnjakom, stvarajući jedinstvenu biljnu kombinaciju. Dodatak polena obogaćuje formulu prirodnim proteinima, aminokiselinama, vitaminima i mineralima.

Posebno mjesto u ovoj formulaciji zauzima korijen bijelog sljeza, poznat po visokom sadržaju biljnih sluzi koje u kontaktu s vodom stvaraju zaštitni, umirujući sloj. U kombinaciji sa sladićem i aromatičnim biljem, ova mješavina objedinjuje tradicionalno poznata svojstva biljaka koje se koriste za njegu i umirivanje sluznice grla i disajnih puteva.

Djelovanje i prednosti

• Umirujuće djelovanje na grlo: Bijeli sljez i sladić tradicionalno se koriste za ublažavanje osjećaja nadraženosti i suhoće grla.
• Zaštita sluznice: Prirodne biljne sluzi iz korijena bijelog sljeza stvaraju nježan zaštitni sloj koji doprinosi umirujućem osjećaju na sluznici.
• Podrška disajnim putevima: Timijan i majčina dušica tradicionalno se koriste u biljnim preparatima namijenjenim njezi disajnih puteva.
• Umirujuća biljna svojstva: Kamilica je poznata po svojim umirujućim svojstvima i dugoj tradiciji primjene u fitoterapiji.
• Prirodna nutritivna podrška: Med i polen doprinose nutritivnoj vrijednosti proizvoda zahvaljujući prirodno prisutnim hranjivim sastojcima.
• Biljna aromatična kombinacija: Matičnjak doprinosi blagoj aromi i zaokružuje karakter ove pažljivo osmišljene formule.

Ključni sastojci i njihova svojstva

Korijen sladića (Glycyrrhiza glabra)

Sladić je jedna od najcjenjenijih biljaka tradicionalne fitoterapije. Njegov korijen bogat je glicirizinom, flavonoidima i drugim bioaktivnim biljnim jedinjenjima. Posebno je poznat po svojim umirujućim svojstvima i tradicionalnoj primjeni kod nadražene sluznice grla. Biljne komponente sladića doprinose umirujućem karakteru formulacije i nadopunjuju djelovanje bijelog sljeza.

Timijan (Thymus vulgaris)

Timijan je aromatična biljka bogata eteričnim uljima, posebno timolom i karvakrolom, kao i flavonoidima i fenolnim jedinjenjima. Tradicionalno se koristi u preparatima za njegu disajnih puteva. Njegove aromatične komponente daju biljnoj mješavini karakterističan miris i doprinose njenom fitoterapijskom profilu.

Majčina dušica (Thymus serpyllum)

Majčina dušica pripada porodici aromatičnih biljaka koje se tradicionalno koriste za podršku zdravlju disajnih puteva. Sadrži eterična ulja, flavonoide i fenolna jedinjenja. Posebno je cijenjena u tradicionalnim biljnim pripravcima zbog svojih aromatičnih i umirujućih svojstava. U kombinaciji s timijanom doprinosi bogatstvu biljnog sastava.

Kamilica (Matricaria chamomilla)

Kamilica je jedna od najpoznatijih biljaka tradicionalne medicine. Njeni cvjetovi sadrže bisabolol, flavonoide, apigenin i druge vrijedne biljne komponente. Poznata je po svojim umirujućim svojstvima, a tradicionalno se koristi za njegu osjetljive sluznice i probavnog sistema. Doprinosi blagom i uravnoteženom karakteru ove biljne formule.

Matičnjak (Melissa officinalis)

Matičnjak je aromatična biljka poznata po svojim umirujućim i opuštajućim svojstvima. Sadrži polifenole, flavonoide i karakteristična aromatična jedinjenja, među kojima se posebno ističe ružmarinska kiselina. Tradicionalno se koristi za opuštanje, podršku probavi i ublažavanje osjećaja napetosti. Njegova blaga citrusna aroma dodatno obogaćuje biljnu kombinaciju.

Korijen bijelog sljeza (Althaea officinalis)

Bijeli sljez predstavlja jedan od najvažnijih sastojaka ove formulacije. Njegov korijen izuzetno je bogat biljnim sluzima, polisaharidima, pektinima i drugim prirodnim komponentama.

U kontaktu s vodom biljne sluzi stvaraju nježnu zaštitnu strukturu koja oblaže sluznicu i doprinosi ublažavanju osjećaja suhoće, grebanja i nadraženosti grla. Tradicionalno se koristi kod suhog kašlja i iritirane sluznice ždrijela.

Polen u prahu

Pčelinji polen prirodni je proizvod bogat različitim nutritivnim komponentama. Sadrži proteine, aminokiseline, lipide, ugljikohidrate, polifenole te različite vitamine i minerale. Njegov sastav zavisi od biljnog porijekla.

U ovoj formulaciji polen doprinosi nutritivnoj vrijednosti i dodatno obogaćuje sastav medne mješavine.

Prirodni med

Med predstavlja osnovu ove formulacije i prirodno je bogat jednostavnim šećerima, enzimima, organskim kiselinama i različitim antioksidativnim jedinjenjima. Poznat je po svojim umirujućim svojstvima i tradicionalnoj upotrebi za ublažavanje osjećaja nadraženosti grla.

Osim što objedinjuje sve biljne sastojke, med doprinosi prijatnoj aromi, punoći i prirodnoj slatkoći proizvoda.

Napomena: Proizvod sadrži med i pčelinji polen. Nije namijenjen osobama alergičnim na pčelinje proizvode. Zbog prisustva sladića, osobe s povišenim krvnim pritiskom, bolestima srca ili bubrega, kao i trudnice i dojilje, trebaju se prije upotrebe posavjetovati sa zdravstvenim radnikom. Ne preporučuje se djeci mlađoj od godinu dana zbog sadržaja meda.`

const pulmoMedDetails = [
  'Sastojci: prirodni med, korijen sladića, korijen bijelog sljeza, timijan, majčina dušica, kamilica, matičnjak i pčelinji polen u prahu.',
  'Pakovanja: 200 g — 12 KM · 350 g — 17 KM.',
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
  { slug: 'pulmomed-200g', name: 'PulmoMed 200 g', price: 12, category: 'voca-i-med', image: '', short: 'Biljni medni eliksir sa sladićem, bijelim sljezom, kamilicom i timijanom', description: pulmoMedDescription, details: pulmoMedDetails, verificationStatus: 'verified', available: true },
  { slug: 'pulmomed-350g', name: 'PulmoMed 350 g', price: 17, category: 'voca-i-med', image: '', short: 'Biljni medni eliksir sa sladićem, bijelim sljezom, kamilicom i timijanom', description: pulmoMedDescription, details: pulmoMedDetails, verificationStatus: 'verified', available: true },
]

export const bySlug = (slug: string) => products.find((product) => product.slug === slug)
export const featured = products.filter((product) => product.featured)
export const newArrivals = products.slice(0, 8)
