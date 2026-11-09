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

const maslackKapiDescription = `Tinktura korijena maslačka prirodni je biljni pripravak dobiven ekstrakcijom korijena maslačka (Taraxacum officinale) u etanolno-vodenoj otopini. Korijen maslačka poznat je po svom bogatom sadržaju inulina, gorkih biljnih tvari i drugih prirodnih spojeva koji doprinose njegovoj tradicionalnoj primjeni za podršku probavnom sistemu.

Korijen maslačka tradicionalno se koristi za podršku normalnoj funkciji jetre, žuči i probave. Njegove gorke tvari potiču lučenje probavnih sokova i doprinose normalnom probavnom procesu.

Zahvaljujući sadržaju inulina, prirodnog prebiotičkog vlakna, korijen maslačka zanimljiv je i kao biljni sastojak koji doprinosi održavanju ravnoteže crijevne mikroflore.

Maslačak je poznat i po svojoj tradicionalnoj primjeni za podršku funkciji bubrega i normalnom izlučivanju tečnosti iz organizma.

Djelovanje i tradicionalna primjena:

• Podržava normalnu funkciju probavnog sistema.
• Tradicionalno se koristi za podršku funkciji jetre i žuči.
• Doprinosi normalnom lučenju probavnih sokova.
• Sadrži inulin, prirodno prebiotičko vlakno.
• Tradicionalno se koristi za podršku normalnom izlučivanju tečnosti iz organizma.

Sastav: Etanolno-vodeni ekstrakt korijena maslačka (Taraxacum officinale).

Način upotrebe: Prema preporučenoj dnevnoj dozi, razrijediti u malo vode ili čaja.

Pakovanje: 30 ml.`

const maslackKapiDetails = [
  'Sastav: etanolno-vodeni ekstrakt korijena maslačka (Taraxacum officinale).',
  'Pakovanje: 30 ml — 9 KM.',
  'Način upotrebe: prema preporučenoj dnevnoj dozi, razrijediti u malo vode ili čaja.',
  'Sadrži alkohol; nije namijenjeno djeci, trudnicama i dojiljama.',
  'Zbog tradicionalne primjene kod bubrega i izlučivanja tečnosti, osobe sa bubrežnim oboljenjima, žučnim kamencem ili one koje uzimaju lijekove za izlučivanje tečnosti trebaju se prije upotrebe posavjetovati s ljekarom.',
]

const antireumatskiMelemDescription = `Ljekovitost i upotreba:

Ova prirodna biljna krema sadrži pažljivo odabranu kombinaciju macerata gaveza, kantariona i nevena, obogaćenu pčelinjim voskom, shea maslacem i vitaminom E. Dodatak eteričnih ulja čempresa, ruzmarina, lavande, bora, bibera i zimzelena upotpunjuje formulaciju i pruža ugodan osjećaj tokom masaže.

Macerat gaveza tradicionalno se koristi za njegu kože i masažu područja izloženih fizičkom naporu. Kantarionovo ulje poznato je po svojim umirujućim i njegujućim svojstvima, dok macerat nevena doprinosi njezi osjetljive, suhe i nadražene kože.

Pčelinji vosak i shea maslac hrane i omekšavaju kožu, pomažu u očuvanju njene prirodne zaštitne barijere i ostavljaju je mekanom i glatkom. Vitamin E djeluje kao antioksidans i pomaže u zaštiti uljne faze proizvoda od oksidacije.

Eterična ulja čempresa, ruzmarina, lavande, bora, bibera i zimzelena daju kremi karakterističnu biljnu aromu i čine je pogodnom za masažu nakon fizičkog napora.

Krema je namijenjena za:

• Masažu umornih i napetih mišića.
• Njegu kože nakon fizičkog napora.
• Masažu područja vrata, leđa, ramena, ruku i nogu.
• Njegu suhe i grube kože.
• Omekšavanje i zaštitu kože.
• Aromatičnu masažu koja pruža osjećaj opuštanja.

Sastav: Macerat korijena gaveza, macerat kantariona, macerat nevena, pčelinji vosak, shea maslac, eterično ulje čempresa, eterično ulje ruzmarina, eterično ulje lavande, eterično ulje bora, eterično ulje bibera, eterično ulje zimzelena i vitamin E.

Način upotrebe: Nanijeti manju količinu kreme na željeno područje kože i nježno umasirati kružnim pokretima. Koristiti prema potrebi.

Napomena: Samo za vanjsku upotrebu. Izbjegavati kontakt s očima, sluznicama i oštećenom kožom. Prije prve upotrebe preporučuje se testiranje na manjem području kože.`

const antireumatskiMelemDetails = [
  'Sastav: macerat korijena gaveza, macerat kantariona, macerat nevena, pčelinji vosak, shea maslac, eterična ulja čempresa, ruzmarina, lavande, bora, bibera i zimzelena, vitamin E.',
  'Način upotrebe: nanijeti manju količinu na željeno područje kože i nježno umasirati kružnim pokretima; koristiti prema potrebi.',
  'Samo za vanjsku upotrebu. Izbjegavati kontakt s očima, sluznicama i oštećenom kožom.',
  'Prije prve upotrebe preporučuje se testiranje na manjem području kože.',
]

const gastroMedDescription = `Pažljivo odabrana kombinacija kamilice, sladića, lanenog sjemena, nevena, matičnjaka, bokvice, bijelog sljeza i anisa, obogaćena maslinovim uljem, medom i limunskom kiselinom, namijenjena je njezi probavnog sistema i umirivanju osjetljive želučane sluznice.

Upotreba biljnog pripravka preporučuje se kao podrška:

• Održavanju normalne funkcije probavnog sistema.
• Njezi i zaštiti osjetljive želučane sluznice.
• Ublažavanju osjećaja nelagode u želucu.
• Održavanju ugodne probave.
• Svakodnevnoj njezi probavnog trakta.

Sastav i djelovanje biljaka:

Kamilica (Matricaria chamomilla – cvijet) tradicionalno se koristi za umirivanje probavnog sistema i ublažavanje osjećaja nadutosti i grčeva.

Sladić (Glycyrrhiza glabra – korijen) sadrži prirodne biljne spojeve i tradicionalno se koristi za njegu sluznice želuca i probavnog trakta.

Laneno sjeme (Linum usitatissimum) bogato je sluzima koje u dodiru s vodom stvaraju zaštitni gel i doprinose njezi sluznice probavnog sistema.

Neven (Calendula officinalis – cvijet) poznat je po svojim umirujućim svojstvima i tradicionalnoj primjeni u njezi probavnog sistema.

Matičnjak (Melissa officinalis – list) tradicionalno se koristi za olakšavanje probave, smanjenje osjećaja nadutosti i umirivanje probavnih tegoba povezanih s napetošću.

Bokvica (Plantago major – list) sadrži biljne sluzi i druge prirodne spojeve koji doprinose njenoj tradicionalnoj primjeni u njezi sluznice.

Bijeli sljez (Althaea officinalis – korijen) bogat je biljnim sluzima koje stvaraju nježan zaštitni sloj i tradicionalno se koriste za umirivanje nadražene sluznice.

Anis (Pimpinella anisum) tradicionalno se koristi za olakšavanje varenja i smanjenje osjećaja nadutosti.

Kantarion (Hypericum perforatum) poznat je po svojim biljnim aktivnim sastojcima i tradicionalnoj primjeni u njezi probavnog sistema.

Maslinovo ulje i med upotpunjuju formulaciju, dajući joj ugodnu teksturu i prirodnu bazu.

Sastav: Kamilica – cvijet, sladić – korijen, laneno sjeme, neven – cvijet, matičnjak – list, bokvica – list, bijeli sljez – korijen, anis, kantarionov macerat u maslinovom ulju, med i limunska kiselina.`

const gastroMedDetails = [
  'Sastav: kamilica (cvijet), sladić (korijen), laneno sjeme, neven (cvijet), matičnjak (list), bokvica (list), bijeli sljez (korijen), anis, kantarionov macerat u maslinovom ulju, med i limunska kiselina.',
  'Namjena: podrška normalnoj funkciji probavnog sistema, njezi osjetljive želučane sluznice i ugodnoj probavi.',
  'Sadrži sladić: osobe s povišenim krvnim pritiskom, bolestima srca ili bubrega, kao i trudnice i dojilje, trebaju se prije upotrebe posavjetovati sa zdravstvenim radnikom.',
  'Sadrži kantarion, koji može uticati na djelovanje nekih lijekova, uključujući hormonsku kontracepciju; prije upotrebe se posavjetujte s ljekarom ili farmaceutom.',
  'Sadrži med; ne preporučuje se djeci mlađoj od godinu dana.',
  'Cijena: 23 KM. Količina pakovanja i preporučena dnevna doza čekaju potvrdu.',
]

const hemoroidiKapiDescription = `Sastav:

Stolisnik (kunica), rusomača, neven – cvijet, list kupine i etanolno-vodeni ekstrakt.

Namjena proizvoda:

Pažljivo odabrana kombinacija stolisnika, rusomače, nevena i lista kupine predstavlja biljnu formulaciju koja se tradicionalno koristi kao podrška ženskom zdravlju i menstrualnoj ravnoteži.

Aktivni biljni sastojci poznati su po svojoj tradicionalnoj primjeni kod menstrualnih tegoba, osjećaja nelagode i grčeva tokom ciklusa. Stolisnik i rusomača posebno su cijenjeni u tradicionalnoj biljnoj medicini zbog svoje primjene kod obilnih menstruacija, dok neven i list kupine upotpunjuju formulaciju svojim biljnim sastojcima i adstringentnim svojstvima.

Kombinacija ovih biljaka predstavlja praktičan oblik tradicionalne biljne podrške tokom menstrualnog ciklusa i svakodnevne brige o ženskom zdravlju.

Primjena:

Prije upotrebe bočicu dobro promućkati. Uzimati prema preporučenoj dnevnoj dozi, razrijeđeno u malo vode.

Upozorenje:

Ne preporučuje se trudnicama, dojiljama, djeci i osobama preosjetljivim na neki od sastojaka. Ne prekoračivati preporučenu dnevnu dozu. Dodatak prehrani nije zamjena za raznovrsnu i uravnoteženu prehranu.

Pakovanje: 30 ml.`

const hemoroidiKapiDetails = [
  'Sastav: stolisnik (kunica), rusomača, neven (cvijet), list kupine i etanolno-vodeni ekstrakt.',
  'Pakovanje: 30 ml — 10 KM.',
  'Primjena: prije upotrebe bočicu dobro promućkati; uzimati prema preporučenoj dnevnoj dozi, razrijeđeno u malo vode.',
  'Upozorenje: ne preporučuje se trudnicama, dojiljama, djeci i osobama preosjetljivim na neki od sastojaka.',
  'Ne prekoračivati preporučenu dnevnu dozu. Dodatak prehrani nije zamjena za raznovrsnu i uravnoteženu prehranu.',
]

const melemHemoroidiDescription = `Sastojci: Macerat kore hrasta, macerat kantariona, macerat nevena, ulje stolisnika, ulje crnog kima, ricinusovo ulje, ulje lješnjaka, pčelinji vosak, lanolin, eterično ulje čempresa, vitamin E, eterično ulje smilja i eterično ulje metvice.

Tradicionalna biljna njega u pažljivo osmišljenoj formulaciji.

Bogata kombinacija biljnih macerata i prirodnih ulja, upotpunjena pčelinjim voskom i lanolinom, stvara hranjiv melem koji njeguje kožu, omekšava je i pomaže u očuvanju njene prirodne zaštitne barijere.

Macerat kore hrasta, poznat po sadržaju tanina, u kombinaciji s maceratima kantariona i nevena pruža tradicionalnu biljnu njegu. Ulje crnog kima, stolisnika i lješnjaka dodatno obogaćuju formulu, dok ricinusovo ulje doprinosi bogatoj teksturi i osjećaju mekoće kože.

Eterična ulja čempresa, smilja i metvice daju melemu prepoznatljiv biljni miris i osjećaj svježine, a vitamin E doprinosi zaštiti uljne faze od oksidacije.

Način upotrebe: Nanijeti malu količinu melema na čistu i suhu kožu te nježno umasirati. Koristiti prema potrebi.

Napomena: Samo za vanjsku upotrebu. Izbjegavati kontakt s očima i sluznicama. Prije prve upotrebe preporučuje se testirati proizvod na malom dijelu kože. Ne nanositi na oštećenu kožu. Ne preporučuje se osobama osjetljivim na neki od sastojaka.`

const melemHemoroidiDetails = [
  'Sastojci: macerat kore hrasta, macerat kantariona, macerat nevena, ulje stolisnika, ulje crnog kima, ricinusovo ulje, ulje lješnjaka, pčelinji vosak, lanolin, eterično ulje čempresa, vitamin E, eterično ulje smilja i eterično ulje metvice.',
  'Način upotrebe: nanijeti malu količinu na čistu i suhu kožu te nježno umasirati; koristiti prema potrebi.',
  'Samo za vanjsku upotrebu. Izbjegavati kontakt s očima i sluznicama. Ne nanositi na oštećenu kožu.',
  'Prije prve upotrebe preporučuje se testirati proizvod na malom dijelu kože. Ne preporučuje se osobama osjetljivim na neki od sastojaka.',
  'Cijena: 10 KM. Količina pakovanja (gramaža) čeka potvrdu.',
]

const cajSmirenjeDescription = `Biljni čaj od kamilice, matičnjaka, lipe, lavande, šipka i komorača. Nježan, blago cvjetan i prirodno aromatičan, s osvježavajućom voćnom notom šipka i blagom slatkoćom komorača. Idealan za trenutke opuštanja i uživanja u toploj šoljici čaja. ✨

💜 Ukus: Nježna kamilica i lavanda, uz osvježavajuću voćnu notu šipka.

🌙 Kofein: Prirodno bez kofeina.

🌡️ Priprema: 100 °C, 5–10 minuta.

🍃 Sastav: Kamilica, matičnjak, lipa, lavanda, šipak (plod) i komorač.

☕ Posebnost: Pažljivo odabrana kombinacija šest biljaka, bez dodatnih aroma.`

const cajSmirenjeDetails = [
  'Sastav: kamilica, matičnjak, lipa, lavanda, šipak (plod) i komorač.',
  'Priprema: 100 °C, 5–10 minuta.',
  'Prirodno bez kofeina; bez dodatnih aroma.',
]

const cleansingFoamDescription = `Opis proizvoda

Nježni gel za čišćenje lica namijenjen je svakodnevnom uklanjanju nečistoća, viška sebuma i ostataka šminke. Njegova blaga formulacija kombinuje biljne sastojke i hidratantne aktivne komponente koje čiste kožu bez nepotrebnog isušivanja.

Sadrži glicerin koji pomaže u očuvanju prirodne vlažnosti kože te D-pantenol (provitamin B5), poznat po svojim umirujućim i njegujućim svojstvima. Blagi biljni tenzidi Coco Glucoside, Decyl Glucoside i Cocamidopropyl Betaine stvaraju nježnu pjenu koja učinkovito uklanja nečistoće, višak masnoće i ostatke proizvoda s kože.

Formulacija obogaćena hidrolatom kamilice i lavande pruža dodatnu njegu, dok eterično ulje lavande i kamilice upotpunjuje proizvod nježnim biljnim mirisom.

Zahvaljujući uravnoteženoj kombinaciji sastojaka, gel ostavlja kožu čistom, mekom, svježom i ugodnom na dodir. Pogodan je za svakodnevnu rutinu njege lica.

Prednosti proizvoda:

• Nježno uklanja nečistoće i višak sebuma.
• Pomaže u očuvanju prirodne vlažnosti kože.
• Glicerin doprinosi hidrataciji kože.
• D-pantenol njeguje i umiruje kožu.
• Blagi biljni tenzidi omogućavaju učinkovito čišćenje.
• Ne ostavlja osjećaj zatezanja i suhoće kada je pravilno formuliran.
• Pogodan za svakodnevnu upotrebu.

Aktivni sastojci:

• Glicerin: Humektans koji privlači i zadržava vlagu u koži.
• D-pantenol: Provitamin B5 koji doprinosi hidrataciji, umirivanju i njezi kože.
• Hidrolat kamilice/lavande: Biljna vodena faza koja upotpunjuje formulaciju.
• Coco Glucoside, Decyl Glucoside i Cocamidopropyl Betaine: Blagi sastojci za čišćenje koji uklanjaju nečistoće i višak sebuma.

Sastav (INCI): Aqua (ili Chamomilla Recutita Flower Water / Lavandula Angustifolia Flower Water), Glycerin, Panthenol, Coco-Glucoside, Decyl Glucoside, Cocamidopropyl Betaine, konzervans, Lavandula Angustifolia Oil ili Chamomilla Recutita Oil, Citric Acid ili Lactic Acid.

Način upotrebe: Nanijeti malu količinu gela na vlažno lice, nježno umasirati kružnim pokretima, a zatim temeljito isprati mlakom vodom. Koristiti ujutro i navečer.

Pakovanje: Prema odabranoj ambalaži.`

const cleansingFoamDetails = [
  'Sastav (INCI): Aqua (ili Chamomilla Recutita Flower Water / Lavandula Angustifolia Flower Water), Glycerin, Panthenol, Coco-Glucoside, Decyl Glucoside, Cocamidopropyl Betaine, konzervans, Lavandula Angustifolia Oil ili Chamomilla Recutita Oil, Citric Acid ili Lactic Acid.',
  'Način upotrebe: nanijeti malu količinu na vlažno lice, nježno umasirati kružnim pokretima, temeljito isprati mlakom vodom; koristiti ujutro i navečer.',
  'Pakovanje: prema odabranoj ambalaži — 15 KM.',
  'Samo za vanjsku upotrebu; izbjegavati kontakt s očima. U slučaju iritacije prestati s upotrebom.',
]

const niacinamidFoamDescription = `Opis proizvoda

Hidratantni gel za čišćenje lica predstavlja idealan izbor za svakodnevnu njegu i čišćenje kože. Njegova pažljivo osmišljena formulacija kombinuje blage biljne tenzide, hidratantne sastojke i aktivne komponente koje učinkovito uklanjaju nečistoće i višak sebuma, ostavljajući kožu čistom, svježom i njegovanom.

Aloe vera gel i glicerin pomažu u očuvanju prirodne vlažnosti kože, sprečavajući osjećaj suhoće i zatezanja nakon pranja. Niacinamid (vitamin B3) doprinosi održavanju zdrave kožne barijere, ujednačenijem izgledu tena i regulaciji viška sebuma. D-pantenol (provitamin B5) poznat je po svojim umirujućim i hidratantnim svojstvima te doprinosi mekoći i ugodnom osjećaju na koži.

Blagi tenzidi Decyl Glucoside i Coco Glucoside nježno uklanjaju nečistoće bez agresivnog narušavanja prirodne zaštitne barijere kože. Zahvaljujući kombinaciji aktivnih sastojaka, gel ostavlja kožu mekanom, osvježenom i hidratiziranom.

Uživajte u nježnom svakodnevnom čišćenju koje istovremeno njeguje i osvježava vašu kožu.

Šta gel pruža:

• Nježno čisti kožu i uklanja nečistoće i višak sebuma.
• Sadrži niacinamid, pantenol i aloe vera gel.
• Glicerin pomaže u održavanju hidratacije kože.
• Umiruje, osvježava i njeguje kožu.
• Pogodan za svakodnevnu upotrebu.
• Nježna formula bez dodanih mirisa.

Aktivni sastojci:

• Niacinamid: Pomaže u održavanju kožne barijere, ujednačenijem tenu i regulaciji sebuma.
• Aloe vera: Hidratizira i umiruje kožu.
• Glicerin: Veže vlagu i pomaže u sprečavanju isušivanja.
• D-pantenol: Umiruje i njeguje kožu te doprinosi hidrataciji.

Način upotrebe: Nanijeti malu količinu gela na vlažno lice, nježno umasirati kružnim pokretima, a zatim isprati mlakom vodom. Koristiti ujutro i navečer.

Tip kože: Svi tipovi kože, uključujući normalnu, mješovitu i masnu kožu.`

const niacinamidFoamDetails = [
  'Aktivni sastojci: niacinamid (vitamin B3), aloe vera gel, glicerin i D-pantenol (provitamin B5).',
  'Blagi tenzidi: Decyl Glucoside i Coco Glucoside.',
  'Način upotrebe: nanijeti malu količinu na vlažno lice, nježno umasirati kružnim pokretima, isprati mlakom vodom; koristiti ujutro i navečer.',
  'Tip kože: svi tipovi kože, uključujući normalnu, mješovitu i masnu.',
  'Bez dodanih mirisa.',
  'Pakovanje: prema odabranoj ambalaži — 15 KM.',
  'Samo za vanjsku upotrebu; izbjegavati kontakt s očima. U slučaju iritacije prestati s upotrebom.',
]

const koprivaAronijaPekmezDescription = `Opis proizvoda

Prirodni pekmez predstavlja pažljivo osmišljenu kombinaciju jabukovog pekmeza, mljevenog sjemena koprive, kakaa u prahu, polena i koncentriranog soka aronije, uz dodatak svježeg limunovog soka i šipka u prahu ili acerole.

Jabukov pekmez daje prirodnu voćnu osnovu i ugodnu slatkoću, dok sjeme koprive obogaćuje proizvod biljnim hranjivim sastojcima. Kakao u prahu sadrži prirodne polifenole i flavonoide, poznate po svom antioksidativnom potencijalu.

Aronija je posebno cijenjena zbog visokog sadržaja antocijanina i drugih polifenola koji doprinose antioksidativnom kapacitetu proizvoda. Polen predstavlja prirodni izvor različitih hranjivih tvari, dok limunov sok doprinosi svježini i prirodnoj aromi.

Dodatak šipka u prahu ili acerole dodatno obogaćuje formulaciju vitaminom C, koji doprinosi normalnoj funkciji imunološkog sistema, zaštiti stanica od oksidativnog stresa i smanjenju umora i iscrpljenosti.

Zahvaljujući kombinaciji voća, biljnih sastojaka i polena, ovaj pekmez predstavlja ukusan način obogaćivanja svakodnevne prehrane prirodnim hranjivim sastojcima.

Šta pekmez pruža:

• Bogatstvo prirodnih biljnih sastojaka i voćnih nutrijenata.
• Sadrži sjeme koprive, polen i kakao.
• Obogaćen aronijom, limunom i šipkom ili acerolom.
• Prirodni izvor biljnih polifenola i antioksidativnih spojeva.

Sastav: Jabukov pekmez, mljeveno sjeme koprive, kakao u prahu, polen, reducirani sok aronije, svježi limunov sok i šipak u prahu ili acerola.

Posebno se ističe: Kombinacija aronije, kakaa, šipka i polena, koja proizvodu daje bogat nutritivni sastav i karakterističan voćno-čokoladni okus.`

const koprivaAronijaPekmezDetails = [
  'Sastav: jabukov pekmez, mljeveno sjeme koprive, kakao u prahu, polen, reducirani sok aronije, svježi limunov sok i šipak u prahu ili acerola.',
  'Posebno se ističe: kombinacija aronije, kakaa, šipka i polena, koja proizvodu daje bogat nutritivni sastav i karakterističan voćno-čokoladni okus.',
  'Sadrži polen; nije namijenjen osobama alergičnim na pčelinje proizvode.',
  'Cijena: 19 KM. Količina pakovanja (gramaža) čeka potvrdu.',
]

// Development references only. Historical amounts are kept separate from live prices.
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
  { slug: 'cleansing-foam', name: 'Cleansing Foam (Pantenol)', price: 15, category: 'njega-lica', image: '/images/products/cleansing-foam.webp', short: 'Nježni gel za čišćenje lica sa D-pantenolom i glicerinom', description: cleansingFoamDescription, details: cleansingFoamDetails, verificationStatus: 'verified', available: true },
  { slug: 'cleansing-foam-niacinamid', name: 'Cleansing Foam (Niacinamid)', price: 15, category: 'njega-lica', image: '', short: 'Hidratantni gel za čišćenje lica sa niacinamidom i aloe verom', description: niacinamidFoamDescription, details: niacinamidFoamDetails, verificationStatus: 'verified', available: true },
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
  { slug: 'kopriva-i-aronija', name: 'Kopriva – aronija pekmez', price: 19, category: 'voca-i-med', image: '/images/products/kopriva-i-aronija.webp', short: 'Pekmez sa sjemenom koprive, aronijom, kakaom i polenom', description: koprivaAronijaPekmezDescription, details: koprivaAronijaPekmezDetails, verificationStatus: 'verified', available: true },
  { slug: 'vocni-eliksir', name: 'Voćni eliksir', price: null, category: 'voca-i-med', image: '/images/products/vocni-eliksir.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Sastav, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'zlatna-snaga', name: 'Zlatna snaga', price: null, category: 'voca-i-med', image: '/images/products/zlatna-snaga.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Sastav, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'sok-od-aronije', name: 'Sok od aronije sa jabukom', price: null, category: 'voca-i-med', image: '/images/products/sok-od-aronije.webp', short: 'Naziv preuzet s etikete; podaci čekaju potvrdu', description: 'Naziv je pročitan s etikete na fotografiji koju je dostavila klijentica. Sastav, veličina, cijena, dostupnost i uslovi prodaje čekaju potvrdu BioHerbice.', details: ['Razvojni unos — nije ponuda za kupovinu.'], verificationStatus: 'awaiting_confirmation', available: false },
  { slug: 'caj-za-smirenje', name: 'Čaj za smirenje', price: 5, category: 'cajevi', image: '', short: 'Biljni čaj od kamilice, matičnjaka, lipe, lavande, šipka i komorača', description: cajSmirenjeDescription, details: cajSmirenjeDetails, verificationStatus: 'verified', available: true },
  { slug: 'detox-kapi', name: 'Detox kapi – Podrška metabolizmu i probavi', price: 10, size: '30 ml', category: 'biljni-preparati', image: '', short: 'Biljna tinktura za podršku probavi i metabolizmu', description: detoxKapiDescription, details: detoxKapiDetails, verificationStatus: 'verified', available: true },
  { slug: 'kapi-za-holesterol', name: 'Kapi za holesterol', price: 10, size: '30 ml', category: 'biljni-preparati', image: '', short: 'Biljne kapi sa maslačkom, artičokom, cikorijom, đumbirom i maslinom', description: kolesterolKapiDescription, details: kolesterolKapiDetails, verificationStatus: 'verified', available: true },
  { slug: 'kapi-za-ciste-polipe-i-miome', name: 'Kapi za ciste, polipe i miome', price: 10, size: '30 ml', category: 'biljni-preparati', image: '', short: 'Biljna tinktura za podršku ženskom reproduktivnom zdravlju', description: zenskeKapiDescription, details: zenskeKapiDetails, verificationStatus: 'verified', available: true },
  { slug: 'kapi-za-smirenje-i-nesanicu', name: 'Kapi za smirenje i nesanicu', price: 10, size: '30 ml', category: 'biljni-preparati', image: '', short: 'Biljne kapi sa valerijanom, hmeljem i mentom', description: smirenjeKapiDescription, details: smirenjeKapiDetails, verificationStatus: 'verified', available: true },
  { slug: 'kapi-korijena-maslacka', name: 'Kapi korijena maslačka', price: 9, size: '30 ml', category: 'biljni-preparati', image: '', short: 'Biljna tinktura od korijena maslačka (Taraxacum officinale)', description: maslackKapiDescription, details: maslackKapiDetails, verificationStatus: 'verified', available: true },
  { slug: 'antireumatski-melem', name: 'Antireumatski melem', price: 25, category: 'biljni-preparati', image: '', short: 'Biljna krema sa maceratima gaveza, kantariona i nevena', description: antireumatskiMelemDescription, details: antireumatskiMelemDetails, verificationStatus: 'verified', available: true },
  { slug: 'gastromed', name: 'GastroMed', price: 23, category: 'biljni-preparati', image: '', short: 'Biljni pripravak sa kamilicom, sladićem, lanenim sjemenom i medom', description: gastroMedDescription, details: gastroMedDetails, verificationStatus: 'verified', available: true },
  { slug: 'kapi-za-hemoroide', name: 'Kapi za hemoroide', price: 10, size: '30 ml', category: 'biljni-preparati', image: '', short: 'Biljne kapi sa stolisnikom, rusomačom, nevenom i listom kupine', description: hemoroidiKapiDescription, details: hemoroidiKapiDetails, verificationStatus: 'verified', available: true },
  { slug: 'melem-za-hemoroide', name: 'Melem za hemoroide', price: 10, category: 'biljni-preparati', image: '', short: 'Biljni melem sa maceratom kore hrasta, kantariona i nevena', description: melemHemoroidiDescription, details: melemHemoroidiDetails, verificationStatus: 'verified', available: true },
  { slug: 'pulmomed', name: 'PulmoMed – Biljni med za dišne puteve', price: 12, category: 'voca-i-med', image: '', short: 'Biljni med sa sladićem, bijelim sljezom, timijanom i polenom', description: pulmoMedDescription, details: pulmoMedDetails, options: [{ label: '250 g', price: 12 }, { label: '350 g', price: 17 }], verificationStatus: 'verified', available: true },
]

export const bySlug = (slug: string) => products.find((product) => product.slug === slug)
export const featured = products.filter((product) => product.featured)
export const newArrivals = products.slice(0, 8)
