// Tekst koji mora biti vidljiv uz dodatke prehrani i na svakoj stranici sajta.
// Drži se na jednom mjestu da se prikaz u podnožju i na stranici proizvoda ne razlikuje.
export const SUPPLEMENT_DISCLAIMER =
  'Dodatak prehrani. Nije lijek i ne služi za dijagnostikovanje, liječenje ili sprječavanje bolesti. Ne zamjenjuje raznovrsnu prehranu. Prije upotrebe posavjetujte se s ljekarom ili farmaceutom, posebno ako ste trudni, dojite ili uzimate lijekove.'

// Podaci o prodavcu koje zakon traži uz online prodaju. Ostaju prazni dok ih vlasnica
// ne potvrdi, pa se u podnožju prikazuje samo napomena da podaci slijede.
export const MERCHANT_DETAILS = {
  legalName: '',
  address: '',
  registrationNumber: '',
  phone: '',
  email: '',
} as const

export const merchantDetailsConfirmed = Object.values(MERCHANT_DETAILS).every(value => value.length > 0)
