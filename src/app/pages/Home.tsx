import { motion } from 'motion/react'
import { ArrowDown, ArrowRight, FlaskConical, Heart, Sparkles } from 'lucide-react'
import { Link } from 'react-router'

import { useCatalog } from '../lib/catalog'
import { ProductCard } from '../components/ProductCard'
import { ButtonLink, Container, Reveal, SectionTitle } from '../components/ui'

const ease = [0.22, 1, 0.36, 1] as const

const categoryScenes = [
  { background: 'linear-gradient(145deg,#e9eee5,#cbd5c5)', symbol: '✳' },
  { background: 'linear-gradient(145deg,#f2eae0,#e4d7c6)', symbol: '◒' },
  { background: 'linear-gradient(145deg,#e9eff0,#c9dfe0)', symbol: '〰' },
]

export function Home() {
  const { categories, products } = useCatalog()
  const newArrivals = products.slice(0, 4)
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-9 sm:pb-24 sm:pt-14 lg:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 h-[38rem] w-[45rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(202,222,222,.52),transparent_68%)]" />
        <Container className="relative">
          <div className="grid min-h-[610px] items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-6">
            <div className="relative z-10 pb-7 lg:pb-16">
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease }} className="mb-7 flex items-center gap-3 text-[11px] uppercase tracking-[.22em] text-olive">
                <span className="h-px w-9 bg-olive/60" />
                Prirodni proizvodi · Tuzla
              </motion.p>
              <h1 className="font-display max-w-[850px] text-[clamp(4rem,9.2vw,8.8rem)] leading-[.82] tracking-[-.045em]">
                <motion.span className="block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: .9, delay: .1, ease }}>Priroda,</motion.span>
                <motion.span className="ml-[.32em] mt-[.12em] block italic text-olive" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: .9, delay: .24, ease }}>blisko vama.</motion.span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .46, ease }} className="mt-9 max-w-[430px] text-[16px] leading-[1.85] text-muted sm:ml-[13%] sm:text-[17px]">
                Pažljivo osmišljeni prirodni proizvodi za njegu, male svakodnevne rituale i trenutke koji pripadaju samo vama.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .55, ease }} className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4 sm:ml-[13%]">
                <ButtonLink to="/shop" size="lg" className="gap-4 rounded-[2px] bg-olive-deep px-6 text-white hover:bg-olive">
                  Istražite ponudu <ArrowRight />
                </ButtonLink>
                <Link to="/about" className="border-b border-olive/45 pb-1 text-[14px] text-olive-deep transition-colors hover:border-olive hover:text-olive">Upoznajte BioHerbicu</Link>
              </motion.div>
              <div className="mt-14 hidden items-center gap-4 text-[11px] uppercase tracking-[.17em] text-faint sm:ml-[13%] sm:flex">
                <span>01</span><span className="h-px w-14 bg-line-strong"/><span>Priroda oblikovana znanjem</span>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 22, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.1, delay: .15, ease }} className="relative mx-auto w-full max-w-[590px] lg:-mr-4">
              <div className="relative aspect-[.91] sm:aspect-[.95]">
                <div className="absolute inset-[5%_9%_10%_7%] rotate-[-5deg] border border-olive/20" />
                <div className="absolute inset-[1%_4%_5%_12%] rotate-[3deg] bg-blue-wash" />
                <div className="absolute inset-[4%_9%_8%_8%] overflow-hidden bg-[#e9ece3] shadow-[0_24px_80px_-42px_rgba(46,63,49,.4)]">
                  <img src="/images/products/q10-nar-divlja-ruza.webp" alt="Q10 krema od nara i divlje ruže — fotografija s dostavljene kolekcije" className="size-full object-cover object-center" fetchPriority="high" />
                </div>
                <div className="absolute right-[0%] top-[12%] flex size-[98px] rotate-[9deg] flex-col items-center justify-center rounded-full border border-olive/25 bg-bg/85 text-olive-deep sm:size-[122px]">
                  <span className="font-display text-[31px] leading-none sm:text-[39px]">BH</span><span className="mt-1 text-[8px] uppercase tracking-[.18em]">Tuzla</span>
                </div>
                <div className="absolute bottom-[7%] left-[-2%] max-w-[205px] border-l-2 border-olive bg-bg/90 px-4 py-3 shadow-soft backdrop-blur-sm sm:left-[-5%] sm:max-w-[238px] sm:px-5 sm:py-4">
                  <p className="font-display text-[22px] leading-[1.05] sm:text-[27px]">Mala pažnja. Svaki dan.</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[.15em] text-muted">Vaš ritam, vaš ritual</p>
                </div>
                <span aria-hidden="true" className="absolute bottom-[17%] right-[4%] font-display text-[56px] text-white/80">✳</span>
              </div>
            </motion.div>
          </div>
          <a href="#kategorije" className="mt-5 hidden w-fit items-center gap-3 text-[10px] uppercase tracking-[.18em] text-muted hover:text-olive lg:flex"><ArrowDown className="size-3"/> Otkrijte ponudu</a>
        </Container>
      </section>

      <section id="kategorije" className="border-y border-line bg-[#f2f3ee] py-7 sm:py-9">
        <Container className="flex flex-wrap items-center justify-between gap-x-7 gap-y-3 text-[11px] uppercase tracking-[.15em] text-muted">
          <span className="mr-3 text-olive">BioHerbica, Tuzla</span><span>Njega lica i tijela</span><span>Biljni preparati</span><span>Čajevi i mješavine</span><span>Voćni proizvodi</span>
        </Container>
      </section>

      <section className="pt-20 sm:pt-28">
        <Container>
          <Reveal><div className="grid gap-5 md:grid-cols-[.7fr_1.3fr] md:items-end"><div><p className="mb-3 text-[11px] uppercase tracking-[.2em] text-olive">Istražite po svom ritmu</p><h2 className="font-display max-w-lg text-[45px] leading-[.95] sm:text-[58px]">Mala otkrića,<br/><em className="text-olive">za svaki dan.</em></h2></div><p className="max-w-[390px] pb-1 text-[14px] leading-[1.8] text-muted md:justify-self-end">Od njege lica do biljnih mješavina i voćnih proizvoda — upoznajte različite dijelove BioHerbica ponude.</p></div></Reveal>
          <div className="mt-11 grid gap-px bg-line md:grid-cols-3">
            {categoryScenes.map((scene, index) => {
              const category = categories[index]
              if (!category) return null
              return <Reveal key={category.key} delay={index * .08}><Link to={`/shop?category=${category.key}`} className="group relative block min-h-[285px] overflow-hidden bg-bg sm:min-h-[390px]">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.035]" style={{ background: scene.background }}><span aria-hidden="true" className="absolute -right-5 -top-12 font-display text-[280px] leading-none text-white/45">{scene.symbol}</span><span className="absolute bottom-12 left-[13%] font-display text-[124px] italic text-olive/40">{String(index + 1).padStart(2, '0')}</span></div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-6 pt-12 sm:px-8 sm:pb-8"><div><span className="text-[10px] uppercase tracking-[.2em] text-olive">{category.number} / BioHerbica</span><h3 className="font-display mt-2 text-[32px] sm:text-[38px]">{category.label}</h3><p className="mt-1 text-[12px] text-muted">{category.blurb}</p></div><span className="grid size-11 place-items-center border border-olive/30 text-olive transition-all group-hover:bg-olive group-hover:text-white"><ArrowRight className="size-4"/></span></div>
              </Link></Reveal>
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-5">
            {categories.slice(3).map(category => <Link key={category.key} to={`/shop?category=${category.key}`} className="group flex items-center gap-3 py-2 text-[13px] text-muted transition-colors hover:text-olive"><span className="text-[10px] tracking-[.1em] text-faint">{category.number}</span><span>{category.label}</span><ArrowRight className="size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"/></Link>)}
          </div>
        </Container>
      </section>

      <section className="pt-24 sm:pt-32">
        <Container>
          <Reveal><SectionTitle eyebrow="Katalog u pripremi" title="Otkrijte BioHerbica ponudu" action={<Link to="/shop" className="hidden items-center gap-2 border-b border-olive/40 pb-2 text-[13px] text-olive-deep hover:border-olive sm:flex">Cijeli katalog <ArrowRight className="size-4"/></Link>}/></Reveal>
          <div className="mt-3 flex items-center gap-2 text-[12px] leading-relaxed text-muted"><span className="size-1.5 rounded-full bg-olive"/> Razvojni prikaz: cijene, dostupnost i fotografije čekaju potvrdu vlasnice. Kupovina će biti dostupna nakon verifikacije kataloga.</div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{newArrivals.map((product, i) => <ProductCard key={product.slug} product={product} index={i} priority={i < 2}/>)}</div>
        </Container>
      </section>

      <section className="pt-24 sm:pt-32">
        <Container>
          <div className="grid items-stretch gap-px overflow-hidden bg-line md:grid-cols-[.88fr_1.12fr]">
            <Reveal className="relative min-h-[390px] bg-blue-wash sm:min-h-[520px]"><img src="/images/products/sok-od-aronije.webp" alt="Sok od aronije sa jabukom — fotografija s dostavljene kolekcije" className="absolute inset-0 size-full object-cover" loading="lazy"/><span className="absolute right-7 top-7 bg-bg/85 px-3 py-2 font-display text-[18px] italic text-olive">Priroda, izbliza</span></Reveal>
            <Reveal delay={.12} className="flex min-h-[390px] flex-col justify-center bg-[#eff0e8] px-7 py-12 sm:px-12 lg:px-16">
              <p className="flex items-center gap-3 text-[10px] uppercase tracking-[.2em] text-olive"><FlaskConical className="size-4"/> Promišljena njega</p>
              <h2 className="font-display mt-6 max-w-[600px] text-[43px] leading-[.96] sm:text-[61px]">Priroda oblikovana znanjem, u vašoj svakodnevici.</h2>
              <p className="mt-6 max-w-[460px] text-[14px] leading-[1.9] text-muted">BioHerbica predstavlja prirodne proizvode za njegu i svakodnevne rituale. O konkretnim sastojcima, načinu izrade i namjeni saznajte iz provjerenih informacija uz svaki proizvod.</p>
              <div className="mt-9 flex items-center gap-4 border-t border-olive/20 pt-5"><Sparkles className="size-4 text-olive"/><span className="text-[12px] text-muted">Svaki detalj zaslužuje pažnju.</span><Heart className="ml-auto size-4 text-olive"/></div>
              <ButtonLink to="/about" variant="secondary" className="mt-8 w-fit rounded-[2px] border-olive/40 text-olive-deep">Više o BioHerbici <ArrowRight/></ButtonLink>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="pb-24 pt-24 sm:pb-32 sm:pt-36">
        <Container><div className="relative overflow-hidden bg-olive-deep px-7 py-14 text-[#f9f9f4] sm:px-14 sm:py-20 lg:px-20"><div aria-hidden="true" className="absolute -right-12 -top-40 select-none font-display text-[430px] leading-none text-white/[.035]">❋</div><Reveal className="relative max-w-3xl"><p className="text-[10px] uppercase tracking-[.23em] text-[#c8d1be]">Vaše sljedeće malo otkriće</p><h2 className="font-display mt-5 text-[48px] leading-[.93] sm:text-[74px]">Upoznajte ono što<br/><em className="text-[#c8d1be]">vas doziva.</em></h2><p className="mt-6 max-w-md text-[14px] leading-[1.8] text-white/70">Pregledajte razvojni katalog BioHerbica proizvoda. Ponuda će se ažurirati nakon potvrde aktuelnih podataka.</p><ButtonLink to="/shop" size="lg" className="mt-8 gap-4 rounded-[2px] bg-[#f7f8f1] text-olive-deep hover:bg-white">Pogledajte katalog <ArrowRight/></ButtonLink></Reveal></div></Container>
      </section>
    </>
  )
}
