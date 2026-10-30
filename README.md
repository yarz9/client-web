# BioHerbica — razvojni web-shop

Premium, responzivna React/Vite trgovina na bosanskom jeziku, za prirodne proizvode BioHerbice iz Tuzle. Vizuelni identitet koristi toplu bjelkastu podlogu, maslinasto zelenu, nježno plavu i uredničku tipografiju. Aplikacija radi kao Node servis na Railwayju, s MySQL bazom za narudžbe i katalog. Razvojna verzija polazi od Store starter predloška i prilagođena je BioHerbici.

> **Status demo-verzije:** Katalog sadrži samo razvojne, nepotvrđene unose. Proizvodi nemaju aktuelnu potvrđenu cijenu, dostupnost ni fotografije i zato se ne mogu staviti u korpu niti naručiti. Ne objavljivati kao aktivnu prodavnicu dok vlasnica ne dostavi odobrene podatke i ne završe konfiguracija i provjere opisane ispod.

## Pokretanje lokalno

Za pregled razvoja: `npm install`, zatim `npm run dev` (Vite, `http://localhost:5173`). Za puni lokalni rad s API-jem i bazom: `npm run build`, `npm run db:bootstrap`, pa `npm start` (`http://localhost:3000`). Server čita lokalni `.env` ako postoji; varijable iz okruženja uvijek imaju prednost.

Za lokalni Workers pregled: izvršite `npm run build`, zatim `npx wrangler d1 migrations apply bioherbica-local --local --config wrangler.jsonc`, a potom `npx wrangler dev --local --config wrangler.jsonc --ip 127.0.0.1 --port 5173`. Wrangler koristi lokalne D1/R2 resurse, spremljene u ignorirani `.wrangler`. `wrangler.jsonc` sadrži ID za development OAuth koji vraća `sites_enable_auth`; produkcijski client ID se ne koristi lokalno. Završite sign-in i callback test na localhostu prije bilo kakve objave.

Provjere dostupne u projektu: `npm run typecheck`, `npm run build` i `npx wrangler deploy --dry-run --config wrangler.jsonc`.

## Katalog i fotografije

- Jedino izvorno mjesto podataka za katalog je `src/data/products.ts`.
- Svaka stavka eksplicitno sadrži `verificationStatus`, `available`, cijenu (ili `null`), kategoriju i opcionalnu istorijsku referentnu cijenu. Stavke su namjerno nedostupne za kupovinu.
- Historijske cijene iz ranijih objava su samo reference, nisu aktuelna ponuda. Izvadak pretrage Instagrama navodi i ponudu prirodne kozmetike/preparata; direktni javni opis profila spominje Tuzlu i frazu „Priroda oblikovana znanjem magistra farmacije“. Objave se ne mogu pouzdano pregledati dovoljno da bi se verifikovao kompletan katalog.
- Zamijenite razvojne vizuelne prikaze originalnim fotografijama. Upload u administratorskom panelu sprema JPG/PNG/WebP datoteke u zaštićeni R2 bucket (do 5 MB); zatim dodajte putanju za prikaz fotografije u podatak proizvoda. U ovoj verziji upravljanje slikama postoji, ali uređivanje teksta/cijena/kategorija nije CMS — katalog se zasad održava u `src/data/products.ts`.

## Narudžbe i administratorski pristup

Worker endpoint `/api/orders` prima zahtjeve gostujućih kupaca uz provjeru istog origin-a, validira obavezne podatke, ponovo provjerava katalog i cijene na serveru te sprema narudžbu u D1 s jedinstvenom referencom, snimkom cijena i proizvoda, kontaktom, pouzećem, statusom i vremenom. Dostava ostaje nepotvrđena dok je vlasnica ne dogovori s kupcem; ne prikazuje se izmišljeni konačni iznos. Nema online naplate ni podataka kartice. Dok proizvodi nisu verificirani, API odbija zahtjeve i checkout je jasno zaključan.

Panel `/admin` čuva sesiju u potpisanom `HttpOnly` kolačiću koji traje 8 sati. Prijava koristi korisničko ime i lozinku iz serverskih varijabli `ADMIN_USERNAME` i `ADMIN_PASSWORD`, a `ADMIN_SESSION_SECRET` potpisuje sesiju; ako nije postavljen, ključ se izvodi iz lozinke, pa su dovoljne varijable `ADMIN_USERNAME` i `ADMIN_PASSWORD`. Pogrešni pokušaji ograničeni su na 8 u 15 minuta po IP adresi. Panel uređuje proizvode (naziv, opis, cijenu, veličinu, kategoriju, fotografiju, verifikaciju, dostupnost), kategorije, tekstove uslova i privatnosti, mijenja statuse narudžbi i upisuje dogovorenu cijenu dostave. Odgovor API-ja za listu je `{ results: [...] }`. Neprijavljen posjetilac ne dobija podatke kupaca. Za narudžbe trenutno nema email obavijesti.

**Prije prve stvarne narudžbe:** potvrditi katalog, postaviti `ADMIN_USERNAME`, `ADMIN_PASSWORD` i `ADMIN_SESSION_SECRET` kao varijable na Railwayju (nikad u kodu), a zatim testirati sa vlasnicom. Prijava kupca nije obavezna; podaci koji se prikupljaju su oni potrebni za dostavu, pa klijentica treba odobriti tekst privatnosti i uslove prije puštanja kupovine.

## Potrebno od klijentice prije lansiranja

1. Originalni logo, odobrene fotografije i originalni kataloški sadržaj/Google Drive katalog.
2. Za svaki proizvod: konačni naziv, kategorija, cijena, veličina/neto količina, dostupnost, namjena i tekst opisa, potvrda podobnosti za online prodaju, tačne opcije/varijante, deklaracije, upozorenja i fotografije.
3. Potvrđen način, cijena i područja dostave, kurir i okvirni rokovi, postupak odbijene/nepreuzete pošiljke.
4. Odobreni podaci BioHerbice (puni naziv poslovnog subjekta, adresa, kontakt, registracijski/porezni podaci ako su potrebni), politika privatnosti, uslovi kupovine, reklamacije, povrat/odustanak te informacije o obradi ličnih podataka; lokalna pravna provjera za propise BiH.
5. Dogovoriti korisničko ime i lozinku za `/admin` i unijeti ih kao Railway varijable `ADMIN_USERNAME` i `ADMIN_PASSWORD`, uz nasumični `ADMIN_SESSION_SECRET`.
6. Lokalni i staging pregled checkouta, D1/R2 funkcija i vlasničkog panela; pregled konzole i mrežnih grešaka. Test narudžbe se odbijaju dok kataloški unosi nisu verificirani.

## Hosting

Aplikacija se objavljuje na Railwayju: `npm run build` pravi statički klijent u `dist/client` i kompajlira Node server u `server/index.js`, a `npm start` služi i API i statičke fajlove. Baza je MySQL. Na web servisu dodajte varijablu `DATABASE_URL` s referencom na MySQL servis (`${{MySQL.DATABASE_URL}}`, ime servisa prilagodite) ili povežite MySQL servis tako da dijeli `MYSQLHOST`/`MYSQLUSER`/`MYSQLDATABASE`; server prihvata oba načina. Bez te veze API vraća 503 uz poruku da baza nije povezana. Nakon prvog deploya pokrenite `npm run db:bootstrap` da se naprave tabele, kategorije, tekstovi uslova i početni katalog. Potrebne varijable su `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` i `ADMIN_SESSION_SECRET` (primjer u `.env.example`). To je i dalje razvojni prikaz, nije aktivna prodavnica. Plaćanje je isključivo pouzećem; ne prikupljati kartice.
