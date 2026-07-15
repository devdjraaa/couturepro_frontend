import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { usePageMeta } from '@/hooks/usePageMeta'

function LegalHead({ eyebrow, title, subtitle, date }) {
  return (
    <div className="max-w-[760px] mx-auto mb-10">
      <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-primary mb-2">{eyebrow}</div>
      <h1 className="font-display font-extrabold text-[clamp(26px,3.8vw,40px)] text-ink leading-tight">{title}</h1>
      {subtitle && <p className="text-dim mt-3 text-[15px] leading-relaxed max-w-[600px]">{subtitle}</p>}
      {date && <p className="text-ghost text-[12px] mt-4 border-t border-edge pt-4">{date}</p>}
    </div>
  )
}

function LegalSection({ h, p }) {
  return (
    <div className="mb-7">
      <h2 className="font-display font-semibold text-[16px] text-ink mb-2">{h}</h2>
      <p className="text-dim leading-relaxed text-[14.5px]">{p}</p>
    </div>
  )
}

function LegalPage({ ns, path, metaTitle }) {
  const { t } = useTranslation()
  usePageMeta({ title: metaTitle || t(`vitrine.legal_pages.${ns}.title`), path })
  const sections = t(`vitrine.legal_pages.${ns}.sections`, { returnObjects: true })
  return (
    <VitrineShell>
      <section className="py-14 px-5">
        <div className="max-w-[760px] mx-auto">
          <LegalHead
            eyebrow={t(`vitrine.legal_pages.${ns}.eyebrow`)}
            title={t(`vitrine.legal_pages.${ns}.title`)}
            subtitle={t(`vitrine.legal_pages.${ns}.subtitle`)}
            date={t(`vitrine.legal_pages.${ns}.date`)}
          />
          <div className="bg-card border border-edge rounded-2xl p-6 md:p-8 space-y-1">
            {(Array.isArray(sections) ? sections : []).map((s) => (
              <LegalSection key={s.h} h={s.h} p={s.p} />
            ))}
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}

export function ConfidentialitePage() {
  return <LegalPage ns="confidentialite" path="/confidentialite" />
}

export function MentionsLegalesPage() {
  return <LegalPage ns="mentions" path="/mentions-legales" />
}

export function CookiesPage() {
  return <LegalPage ns="cookies" path="/cookies" />
}

export function ProtectionDonneesPage() {
  return <LegalPage ns="protection_donnees" path="/protection-donnees" />
}

export function CguPage() {
  return <LegalPage ns="cgu" path="/cgu" />
}

export function DroitsCreateursPage() {
  return <LegalPage ns="droits_createurs" path="/droits-createurs" />
}

export function ConditionsVentePage() {
  return <LegalPage ns="conditions_vente" path="/conditions-vente" />
}

export function ProduitsInterditesPage() {
  return <LegalPage ns="produits_interdits" path="/produits-interdits" />
}

export function LivraisonRetoursPage() {
  return <LegalPage ns="livraison_retours" path="/livraison-retours" />
}

export function ReglesCommunautePage() {
  return <LegalPage ns="regles_communaute" path="/regles-communaute" />
}

export function ContactReclamationsPage() {
  return <LegalPage ns="contact_reclamations" path="/contact-reclamations" />
}
