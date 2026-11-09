import { Check } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'

import { Button, ButtonLink } from './ui'

// Prikazuje se odmah nakon što server potvrdi da je zahtjev sačuvan. Kupac odatle
// može otvoriti praćenje ili zatvoriti dijalog i vidjeti punu potvrdu ispod.
export function OrderSentDialog({ reference, onClose }: { reference: string; onClose?: () => void }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-fg/45 p-4 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-sent-title"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.95 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.04 }}
          className="w-full max-w-md border border-line bg-bg p-7 text-center shadow-drawer sm:p-9"
        >
          <motion.span
            aria-hidden="true"
            initial={reduced ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.12 }}
            className="mx-auto grid size-16 place-items-center rounded-full bg-olive-deep text-white"
          >
            <Check className="size-7" />
          </motion.span>
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 id="order-sent-title" className="font-display mt-5 text-[34px] leading-none sm:text-[38px]">Narudžba poslata</h2>
            <p className="mt-3 text-[12px] leading-relaxed text-muted">
              Vaš zahtjev je zaprimljen. Dostupnost i cijenu dostave potvrđujemo prije konačnog dogovora, plaćanje je pouzećem.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 border border-line bg-surface px-3 py-2 text-[11px]">
              <span className="text-faint">Referenca</span>
              <strong className="tabular-nums tracking-[.06em]">{reference}</strong>
            </p>
            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              Narudžbu možete pratiti ovdje — potvrda ostaje sačuvana na ovom uređaju.
            </p>
          </motion.div>
          <motion.div
            className="mt-6 flex flex-col gap-2 sm:flex-row"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <ButtonLink to="/track" className="w-full rounded-[2px]">Pratite narudžbu</ButtonLink>
            {onClose
              ? <Button variant="secondary" onClick={onClose} className="w-full rounded-[2px]">Zatvori</Button>
              : <ButtonLink to={`/order/${reference}`} variant="secondary" className="w-full rounded-[2px]">Pogledajte potvrdu</ButtonLink>}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
