import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Container } from '../components/ui'

type Policy = { key: string; title: string; content: string; sortOrder: number }

const policySections: Policy[] = [
  { key: 'merchant', title: 'Informacije o prodavcu', content: 'Puni naziv poslovnog subjekta, adresa sjedišta, registracijski i kontakt podaci čekaju potvrdu vlasnice.', sortOrder: 0 },
  { key: 'orders', title: 'Narudžbe i plaćanje', content: 'Plaćanje je zamišljeno kao plaćanje pouzećem. Narudžba se smatra zahtjevom dok BioHerbica ne potvrdi dostupnost i cijenu dostave. Online naplata nije omogućena.', sortOrder: 1 },
  { key: 'delivery', title: 'Dostava', content: 'Kurirska služba, područja dostave, cijena dostave, rokovi isporuke i postupak u slučaju nepreuzete pošiljke čekaju potvrdu.', sortOrder: 2 },
  { key: 'returns', title: 'Povrat i reklamacije', content: 'Postupak odustanka od kupovine, povrata robe, reklamacija i rokovi za njihovo rješavanje moraju biti dostavljeni i odobreni prije početka prodaje.', sortOrder: 3 },
  { key: 'privacy', title: 'Privatnost i lični podaci', content: 'Zahtjev za narudžbu se čuva u Railway MySQL bazi koju održava vlasnik projekta. U bazu se upisuju ime, telefon, grad, adresa, opciona napomena i email, artikli s cijenama zabilježenim u trenutku zahtjeva, način plaćanja, status i vrijeme slanja. Pristup narudžbama ograničen je na zaštićeni administratorski panel; podaci se ne prikazuju javno. Vlasnica prije lansiranja treba odrediti rok čuvanja, voditelja obrade i kanal za zahtjeve kupaca te potvrditi konačnu obavijest o privatnosti.', sortOrder: 4 },
  { key: 'legal', title: 'Lokalna provjera', content: 'Ovaj sadržaj je razvojni podsjetnik, nije pravno mišljenje ni konačan tekst uslova. Prije objave prodaje zatražite lokalnu pravnu provjeru za propise Bosne i Hercegovine.', sortOrder: 5 },

]

export function Policies() {
  const [sections, setSections] = useState(policySections)
  useEffect(() => {
    let active = true
    void fetch('/api/policies').then(async response => {
      if (!response.ok) return
      const body = await response.json() as { results?: Policy[] }
      if (active && body.results?.length) setSections(body.results)
    }).catch(() => undefined)
    return () => { active = false }
  }, [])
  return <Container className="pb-20 pt-12 sm:pb-28 sm:pt-20"><Link to="/" className="inline-flex items-center gap-2 text-[12px] text-muted hover:text-olive"><ArrowLeft className="size-4"/> Početna</Link><div className="mt-8 max-w-3xl"><p className="text-[10px] uppercase tracking-[.2em] text-olive">BioHerbica · informacije za kupce</p><h1 className="font-display mt-4 text-[53px] leading-[.94] sm:text-[76px]">Uslovi i privatnost</h1><p className="mt-5 border-l-2 border-olive bg-[#eff0e8] px-4 py-3 text-[12px] leading-relaxed text-olive-deep">Razvojni sadržaj — informacije označene kao nepotvrđene moraju biti zamijenjene prije početka prodaje.</p></div><div className="mt-10 divide-y divide-line border-y border-line">{sections.map(section => <section key={section.key} className="grid gap-2 py-6 sm:grid-cols-[220px_1fr] sm:gap-8"><h2 className="text-[13px] font-medium">{section.title}</h2><p className="max-w-2xl whitespace-pre-line text-[12px] leading-[1.9] text-muted">{section.content}</p></section>)}</div></Container>
}
