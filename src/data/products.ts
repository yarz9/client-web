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

const detoxKapiDescription = `Ova tinktura prirodna je biljna formulacija na bazi pažljivo odabrane kombinacije koprive, zelenog čaja, korijena maslačka, đumbira, komorača i cimeta. Ova sinergijska kombinacija biljnih sastojaka tradicionalno se koristi za podršku normalnoj probavi, metabolizmu i općem osjećaju vitalnosti.

Djelovanje: Kopriva je poznata po svom bogatom prirodnom sastavu i tradicionalnoj primjeni za podršku organizmu. Zeleni čaj sadrži prirodne polifenole i katehine, koji doprinose antioksidativnoj zaštiti stanica. Korijen maslačka tradicionalno se koristi za podršku funkciji probavnog sistema, dok đumbir i komorač doprinose ugodnoj probavi i tradicionalno se primjenjuju kod osjećaja nadutosti i probavnih tegoba. Cimet dodatno obogaćuje formulaciju svojim aromatičnim i biljnim svojstvima.

Zahvaljujući kombinaciji pažljivo odabranih biljaka, ova tinktura predstavlja praktičan oblik biljne podrške svakodnevnoj rutini i očuvanju općeg osjećaja dobrobiti.

Sastojci:

Kopriva (list), zeleni čaj (list), maslačak (korijen), đumbir (korijen), komorač (sjeme), cimet (kora), alkohol.

Način upotrebe:

Prije upotrebe dobro protresti. Uzimati prema preporučenoj dnevnoj dozi, razrijeđeno u malo vode.`

const detoxKapiDetails = [
  'Sastojci: kopriva (list), zeleni čaj (list), maslačak (korijen), đumbir (korijen), komorač (sjeme), cimet (kora), alkohol.',
  'Neto količina: 30 ml — 10 KM.',
  'Način upotrebe: prije upotrebe dobro protresti; uzimati prema preporučenoj dnevnoj dozi, razrijeđeno u malo vode.',
  'Sadrži alkohol; nije namijenjeno djeci, trudnicama i dojiljama.',
]

const kolesterolKapiDescription = `Aktivni sastojci mješavine biljnih kapi sadrže prirodne biljne spojeve s antioksidativnim svojstvima. Pažljivo odabrana kombinacija maslačka, artičoke, cikorije, đumbira i lista masline tradicionalno se koristi za podršku normalnoj funkciji jetre, žuči i probavnog sistema. Gorke biljne tvari doprinose normalnom procesu probave, dok biljni antioksidansi pomažu u zaštiti ćelija od oksidativnog stresa.

Sastav: Biljne kapi predstavljaju mješavinu sljedećih etanolno-vodenih ekstrakata:

• Tinktura maslačka (Tinctura Taraxaci – list i korijen)
• Tinktura artičoke (Tinctura Cynarae – list)
• Tinktura cikorije (Tinctura Cichorii – korijen)
• Tinktura đumbira (Tinctura Zingiberis – korijen)
• Tinktura masline (Tinctura Oleae – list)
• Alkohol

Maslačak (list i korijen) tradicionalno se koristi za podršku funkciji jetre, žuči i probavnog sistema. Gorke tvari iz korijena maslačka doprinose stimulaciji probavnih sokova i normalnoj probavnoj funkciji, dok list sadrži prirodne biljne spojeve i minerale.

Artičoka (list) poznata je po sadržaju cinarina i drugih biljnih polifenola. Tradicionalno se koristi za podršku funkciji jetre i žuči te normalnoj probavi masti. Doprinosi normalnom protoku žuči i olakšava probavu teže hrane.

Cikorija (korijen) prirodni je izvor inulina, prebiotičkog vlakna koje služi kao hrana korisnim crijevnim bakterijama. Tradicionalno se koristi za podršku probavi, normalnom radu crijeva i održavanju ravnoteže crijevne mikroflore.

Đumbir (korijen) poznat je po svojim aromatičnim i bioaktivnim spojevima. Tradicionalno se koristi za podršku probavi, smanjenje osjećaja mučnine i nadutosti te održavanje normalne funkcije probavnog sistema.

Maslina (list) bogata je polifenolima, posebno oleuropeinom, koji posjeduje izražena antioksidativna svojstva. Doprinosi zaštiti ćelija od oksidativnog stresa i predstavlja vrijedan biljni sastojak ove formulacije.

Način primjene: Prema preporučenoj dnevnoj dozi, razrijediti u malo vode.

Pakovanje: 30 ml.`

const kolesterolKapiDetails = [
  'Sastav: etanolno-vodeni ekstrakti maslačka (list i korijen), artičoke (list), cikorije (korijen), đumbira (korijen) i masline (list); alkohol.',
  'Pakovanje: 30 ml — 10 KM.',
  'Način primjene: prema preporučenoj dnevnoj dozi, razrijediti u malo vode.',
  'Sadrži alkohol; nije namijenjeno djeci, trudnicama i dojiljama.',
]

const zenskeKapiDescription = `Pažljivo odabrana kombinacija vrkute, vrbovice, nevena, kunice i kantariona predstavlja tradicionalnu biljnu formulaciju namijenjenu podršci zdravlju ženskog reproduktivnog i urinarnog sistema. Ove biljke poznate su po svojoj tradicionalnoj primjeni u njezi ženskog organizma, posebno tokom menstrualnog ciklusa i u periodima hormonalnih promjena.

Djelovanje i tradicionalna primjena:

Vrkuta (Alchemilla vulgaris) jedna je od najpoznatijih biljaka u tradicionalnoj biljnoj njezi ženskog zdravlja. Sadrži tanine i druge biljne spojeve, a tradicionalno se koristi za ublažavanje menstrualnih tegoba i podršku normalnom menstrualnom ciklusu.

Vrbovica (Epilobium sp.) tradicionalno se koristi u biljnim pripravcima za podršku zdravlju urinarnog i reproduktivnog sistema. Sadrži polifenole i flavonoide s antioksidativnim svojstvima.

Neven (Calendula officinalis) poznat je po svojim umirujućim i njegujućim svojstvima. Tradicionalno se koristi za podršku zdravlju sluznice i kože te doprinosi zaštiti organizma od oksidativnog stresa.

Kunica (Achillea millefolium) tradicionalno se primjenjuje kod menstrualnih tegoba i probavnih smetnji. Sadrži eterična ulja, flavonoide i druge biljne spojeve koji doprinose njenoj širokoj primjeni u tradicionalnoj fitoterapiji.

Kantarion (Hypericum perforatum) poznat je po svojim bioaktivnim sastojcima, posebno hipericinu i hiperforinu. Tradicionalno se koristi za podršku emocionalnoj ravnoteži i općem osjećaju dobrobiti.

Zahvaljujući kombinaciji pažljivo odabranih biljaka, ova tinktura objedinjuje tradicionalnu biljnu primjenu i predstavlja praktičan oblik biljne podrške svakodnevnoj brizi o ženskom zdravlju.

Sastav: Etanolno-vodeni ekstrakt mješavine sljedećih biljaka:

• Vrkuta – nadzemni dio (Alchemilla vulgaris)
• Vrbovica – nadzemni dio (Epilobium sp.)
• Neven – cvijet (Calendula officinalis)
• Kunica – nadzemni dio (Achillea millefolium)
• Kantarion – nadzemni dio (Hypericum perforatum)
• Alkohol

Način upotrebe: Prema preporučenoj dnevnoj dozi, razrijediti u malo vode.

Pakovanje: 30 ml.`

const zenskeKapiDetails = [
  'Sastav: etanolno-vodeni ekstrakt vrkute (nadzemni dio), vrbovice (nadzemni dio), nevena (cvijet), kunice (nadzemni dio) i kantariona (nadzemni dio); alkohol.',
  'Pakovanje: 30 ml — 10 KM.',
  'Način upotrebe: prema preporučenoj dnevnoj dozi, razrijediti u malo vode.',
  'Sadrži alkohol; nije namijenjeno djeci, trudnicama i dojiljama.',
  'Kantarion može uticati na djelovanje nekih lijekova, uključujući hormonsku kontracepciju; prije upotrebe se posavjetujte s ljekarom.',
]

const smirenjeKapiDescription = `Biljne kapi predstavljaju prirodnu kombinaciju valerijane, hmelja i mente, pažljivo odabranih zbog svoje tradicionalne primjene za opuštanje organizma i podršku kvalitetnom snu.

Tinktura valerijane (odoljena) poznata je po svom umirujućem djelovanju te se tradicionalno koristi za ublažavanje nervoze, unutrašnjeg nemira i poteškoća s uspavljivanjem. Doprinosi opuštanju organizma i lakšem uspostavljanju mirnog sna.

Tinktura hmelja tradicionalno se koristi kao biljni sastojak za opuštanje i smanjenje osjećaja napetosti i razdražljivosti. U kombinaciji s valerijanom doprinosi umirujućem djelovanju biljne formulacije.

Tinktura mente (metvice) upotpunjuje ovu kombinaciju svojim osvježavajućim mirisom i ugodnim okusom. Tradicionalno se koristi za podršku probavi i doprinosi boljoj senzornoj prihvatljivosti proizvoda.

Zahvaljujući kombinaciji valerijane i hmelja, ove biljne kapi namijenjene su osobama koje žele podržati opuštanje organizma, smanjiti osjećaj svakodnevne napetosti i poboljšati kvalitetu odmora.

Sastav: Etanolno-vodeni ekstrakt sljedećih biljaka:

• Valerijana – korijen (Valeriana officinalis)
• Hmelj – šišarke (Humulus lupulus)
• Menta – list (Mentha piperita)
• Alkohol

Način upotrebe: Prema preporučenoj dnevnoj dozi, razrijediti u malo vode.

Pakovanje: 30 ml.`

const smirenjeKapiDetails = [
  'Sastav: etanolno-vodeni ekstrakt valerijane (korijen), hmelja (šišarke) i mente (list); alkohol.',
  'Pakovanje: 30 ml — 10 KM.',
  'Način upotrebe: prema preporučenoj dnevnoj dozi, razrijediti u malo vode.',
  'Sadrži alkohol; nije namijenjeno djeci, trudnicama i dojiljama.',
  'Može izazvati pospanost; ne upravljajte vozilom i ne kombinujte s lijekovima za smirenje ili uspavljivanje bez savjeta ljekara.',
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
  { slug: 'detox-kapi', name: 'Detox kapi – Podrška metabolizmu i probavi', price: 10, size: '30 ml', category: 'biljni-preparati', image: '', short: 'Biljna tinktura za podršku probavi i metabolizmu', description: detoxKapiDescription, details: detoxKapiDetails, verificationStatus: 'verified', available: true },
  { slug: 'kapi-za-holesterol', name: 'Kapi za holesterol', price: 10, size: '30 ml', category: 'biljni-preparati', image: '', short: 'Biljne kapi sa maslačkom, artičokom, cikorijom, đumbirom i maslinom', description: kolesterolKapiDescription, details: kolesterolKapiDetails, verificationStatus: 'verified', available: true },
  { slug: 'kapi-za-ciste-polipe-i-miome', name: 'Kapi za ciste, polipe i miome', price: 10, size: '30 ml', category: 'biljni-preparati', image: '', short: 'Biljna tinktura za podršku ženskom reproduktivnom zdravlju', description: zenskeKapiDescription, details: zenskeKapiDetails, verificationStatus: 'verified', available: true },
  { slug: 'kapi-za-smirenje-i-nesanicu', name: 'Kapi za smirenje i nesanicu', price: 10, size: '30 ml', category: 'biljni-preparati', image: '', short: 'Biljne kapi sa valerijanom, hmeljem i mentom', description: smirenjeKapiDescription, details: smirenjeKapiDetails, verificationStatus: 'verified', available: true },
  { slug: 'pulmomed', name: 'PulmoMed – Biljni med za dišne puteve', price: 12, category: 'voca-i-med', image: '', short: 'Biljni med sa sladićem, bijelim sljezom, timijanom i polenom', description: pulmoMedDescription, details: pulmoMedDetails, options: [{ label: '250 g', price: 12 }, { label: '350 g', price: 17 }], verificationStatus: 'verified', available: true },
]

export const bySlug = (slug: string) => products.find((product) => product.slug === slug)
export const featured = products.filter((product) => product.featured)
export const newArrivals = products.slice(0, 8)
