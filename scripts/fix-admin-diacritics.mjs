import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'

const SERVER = 'server/index.ts'
const WORKFLOW = '.github/workflows/admin-diacritics.yml'

const pairs = [
  ['Kod pracenja moze imati najvise 60 znakova.', 'Kod praćenja može imati najviše 60 znakova.'],
  ["'Narudzba ' + reference + ' nije pronadena.'", "'Narudžba ' + reference + ' nije pronađena.'"],
  ["'Referenca narudzbe nije validna.'", "'Referenca narudžbe nije validna.'"],
  ["'Narudzbu ' + reference + ' mozete obrisati samo kada je otkazana.'", "'Narudžbu ' + reference + ' možete obrisati samo kada je otkazana.'"],
  ["'Unesite kod pracenja posiljke.'", "'Unesite kod praćenja pošiljke.'"],
  ["'Narudzba ' + reference + ' nema email kupca.'", "'Narudžba ' + reference + ' nema email kupca.'"],
  ["'Slanje emaila nije podeseno. Postavite RESEND_API_KEY i ORDER_EMAIL_FROM na Railway servisu.'", "'Slanje emaila nije podešeno. Postavite RESEND_API_KEY i ORDER_EMAIL_FROM na Railway servisu.'"],
  ["'Email nije poslan. Provjerite RESEND_API_KEY i adresu posiljaoca.'", "'Email nije poslan. Provjerite RESEND_API_KEY i adresu pošiljaoca.'"],
  ["'Postovani '", "'Poštovani '"],
  ["'Vasa narudzba ' + reference + ' je predata posti.'", "'Vaša narudžba ' + reference + ' je predata pošti.'"],
  ["'Kod za pracenje posiljke: '", "'Kod za praćenje pošiljke: '"],
  ["'Status narudzbe: '", "'Status narudžbe: '"],
  ["'BioHerbica - pracenje narudzbe '", "'BioHerbica — praćenje narudžbe '"],
]

let server = readFileSync(SERVER, 'utf8')

for (const [from, to] of pairs) {
  if (!server.includes(from)) throw new Error('Nije pronadeno: ' + from)
  server = server.split(from).join(to)
}

if (server.includes('pracenja') || server.includes('Narudzba') || server.includes('Postovani')) {
  throw new Error('Ostala je poruka bez dijakritike')
}

writeFileSync(SERVER, server)
console.log('server/index.ts: poruke su ispravljene')

unlinkSync(WORKFLOW)
unlinkSync(new URL(import.meta.url))
console.log('Privremeni fajlovi su uklonjeni')
