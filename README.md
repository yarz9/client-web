# BioHerbica — razvojni web-shop

Premium, responzivna React/Vite trgovina na bosanskom jeziku, za prirodne proizvode BioHerbice iz Tuzle. Aplikacija radi kao Node servis na Railwayju, s MySQL bazom za narudžbe i katalog.

> **Status demo-verzije:** Katalog sadrži samo razvojne, nepotvrđene unose. Proizvodi nemaju aktuelnu potvrđenu cijenu, dostupnost ni fotografije i zato se ne mogu staviti u korpu niti naručiti. Ne objavljivati kao aktivnu prodavnicu dok vlasnica ne dostavi odobrene podatke i ne završe konfiguracija i provjere opisane ispod.

## Pokretanje lokalno

`npm install`, zatim `npm run dev` (Vite, `http://localhost:5173`) za pregled razvoja.
Za puni lokalni rad s API-jem i bazom: `npm run build`, `npm run db:bootstrap`, pa `npm start` (`http://localhost:3000`). Server čita lokalni `.env` ako postoji; varijable iz okruženja uvijek imaju prednost.

Provjere dostupne u projektu: `npm run typecheck` (klijent) i `npm run build` (klijent, server i bootstrap skripta).

## Katalog i fotografije

- Prvo pokretanje popunjava bazu iz `src/data/products.ts`; nakon toga je **MySQL izvor podataka** i sve izmjene idu kroz `/admin`.
- Svaka stavka ima `verificationStatus`, `available`, cijenu (ili `null`), kategoriju i opcionalnu referentnu cijenu. Stavke su namjerno nedostupne za kupovinu dok ih vlasnica ne potvrdi.
- Upload u admin panelu prima JPG, PNG i WebP do 5 MB. Tip se provjerava po sadržaju datoteke (magic bytes), ne po onome što pošiljalac tvrdi. Slike se spremaju u MySQL tabelu `product_images` i serviraju preko `/api/images/<naziv>`; R2 bucket se ne koristi.
- Zamijeniti razvojne vizuelne prikaze originalnim fotografijama.

## Narudžbe, praćenje i administratorski pristup

`POST /api/orders` prima zahtjeve gostujućih kupaca uz provjeru istog origin-a, validaciju podataka, ponovnu provjeru kataloga i cijena na serveru te upis narudžbe s jedinstvenom referencom, snimkom cijena i statusom `Novo`. Odgovor sadrži i `trackToken`, koji kupcu omogućava praćenje bez čuvanja ličnih podataka u pregledniku.

`POST /api/orders/track` je javna provjera statusa: traži referencu i **ili** telefon s narudžbe **ili** `trackToken`. Vraća samo status, stavke, međuzbir, dostavu, ukupan iznos i kod praćenja — bez imena, adrese i telefona. Ako je narudžba obrisana u admin panelu, vraća 404 i praćenje je više ne prikazuje.

Statusi narudžbe su `Novo`, `Potvrđeno`, `U pripremi`, `Poslano`, `Isporučeno`, `Otkazano`, a ista paleta boja koristi se u admin panelu i na stranici `/track`. Admin upisuje dogovorenu cijenu dostave, kod praćenja i može poslati email kupcu ako su postavljeni `RESEND_API_KEY` i `ORDER_EMAIL_FROM`.

Panel `/admin` čuva sesiju u potpisanom `HttpOnly` kolačiću koji traje 4 sata. Prijava koristi `ADMIN_USERNAME`, `ADMIN_PASSWORD` i `ADMIN_SESSION_SECRET`.

- U produkciji (`NODE_ENV=production`) server odbija da izvede ključ sesije iz lozinke: `ADMIN_SESSION_SECRET` mora imati najmanje 32 znaka, a `ADMIN_PASSWORD` najmanje 12.
- Neuspjele prijave ograničene su na 8 u 15 minuta po IP adresi i na 10 u 15 minuta po korisničkom imenu. IP se čita s kraja `X-Forwarded-For` niza, jer taj unos dodaje proxy, a ne klijent.
- Javno slanje narudžbi ograničeno je na 5 u 10 minuta po IP adresi, a provjera praćenja na 20 u 15 minuta.

## Hosting

Aplikacija se objavljuje na Railwayju: `npm run build` pravi statički klijent u `dist/client` i kompajlira Node server u `server/index.js`, a `npm start` služi i API i statičke fajlove.

Potrebne varijable: `DATABASE_URL` (referenca na MySQL servis, npr. `${{MySQL.DATABASE_URL}}`, ili podijeljeni `MYSQLHOST`/`MYSQLUSER`/`MYSQLDATABASE`), `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, te opcionalno `RESEND_API_KEY`, `ORDER_EMAIL_FROM` i `PUBLIC_URL`.

Zdravstvene provjere: `/api/healthz` ne dira bazu i pogodna je za Railway health check; `/api/health` provjerava i bazu.

Tabele i početni katalog server priprema sam pri pokretanju; ako baza nije dostupna, pokretanje se nastavlja uz upozorenje u logu. Ručno: `npm run db:bootstrap` lokalno ili `node build/server/db-bootstrap.js` unutar kontejnera.

Plaćanje je isključivo pouzećem; ne prikupljati podatke s platnih kartica.

## Potrebno od klijentice prije lansiranja

1. Originalni logo, odobrene fotografije i originalni kataloški sadržaj.
2. Za svaki proizvod: konačni naziv, kategorija, cijena, veličina/neto količina, dostupnost, namjena i tekst opisa, potvrda podobnosti za online prodaju, tačne opcije/varijante, deklaracije, upozorenja i fotografije.
3. Potvrđen način, cijena i područja dostave, kurir i okvirni rokovi, postupak odbijene/nepreuzete pošiljke.
4. Odobreni podaci BioHerbice (puni naziv poslovnog subjekta, adresa, kontakt, registracijski/porezni podaci), politika privatnosti, uslovi kupovine, reklamacije, povrat/odustanak te informacije o obradi ličnih podataka; lokalna pravna provjera za propise BiH.
5. Dogovoriti korisničko ime i lozinku za `/admin` i unijeti ih kao Railway varijable, uz nasumični `ADMIN_SESSION_SECRET`.
6. Lokalni i staging pregled checkouta, praćenja, emaila i panela; pregled konzole i mrežnih grešaka.
