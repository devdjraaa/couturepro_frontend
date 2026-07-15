import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { usePageMeta } from '@/hooks/usePageMeta'

/* ── Composant générique (pages simples : sections [{h,p}]) ───────────── */

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

function LegalPage({ ns, path }) {
  const { t } = useTranslation()
  usePageMeta({ title: t(`vitrine.legal_pages.${ns}.title`), path })
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

/* ── Rendu de blocs riches (pour les pages avec articles structurés) ──── */

function BlockTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-edge my-4">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-subtle">
            {headers.map((h) => (
              <th key={h} className="text-left text-ink font-semibold px-3 py-2.5 border-b border-edge whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-subtle/40'}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 text-dim border-b border-edge/50 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BlockList({ items }) {
  return (
    <ul className="space-y-1.5 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-dim text-[14px] leading-relaxed">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function BlockBox({ title, t: text }) {
  return (
    <div className="my-4 bg-elevated border border-edge rounded-xl p-4">
      {title && <p className="font-semibold text-ink text-[13px] mb-1.5">{title}</p>}
      <p className="text-dim text-[13.5px] leading-relaxed">{text}</p>
    </div>
  )
}

function BlockPermission({ name, t: text }) {
  return (
    <div className="my-3 bg-subtle border border-edge rounded-xl p-4">
      <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary mb-2">{name}</p>
      <p className="text-dim text-[13.5px] leading-relaxed">{text}</p>
    </div>
  )
}

function Block({ block }) {
  if (block.type === 'p')
    return <p className="text-dim text-[14px] leading-relaxed my-2">{block.t}</p>
  if (block.type === 'subtitle')
    return <h3 className="font-display font-semibold text-ink text-[14px] mt-5 mb-1">{block.t}</h3>
  if (block.type === 'list')
    return <BlockList items={block.items} />
  if (block.type === 'table')
    return <BlockTable headers={block.headers} rows={block.rows} />
  if (block.type === 'box')
    return <BlockBox title={block.title} t={block.t} />
  if (block.type === 'permission')
    return <BlockPermission name={block.name} t={block.t} />
  return null
}

function RichArticle({ title, blocks }) {
  return (
    <div className="mb-8">
      <h2 className="font-display font-bold text-[13.5px] uppercase tracking-[0.06em] text-ink mb-3 pb-2 border-b border-edge">{title}</h2>
      {(Array.isArray(blocks) ? blocks : []).map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  )
}

function RichLegalPage({ ns, path }) {
  const { t } = useTranslation()
  usePageMeta({ title: t(`vitrine.legal_pages.${ns}.title`), path })
  const articles = t(`vitrine.legal_pages.${ns}.articles`, { returnObjects: true })

  if (!Array.isArray(articles) || !articles.length) {
    return <LegalPage ns={ns} path={path} />
  }

  return (
    <VitrineShell>
      <section className="py-14 px-5">
        <div className="max-w-[820px] mx-auto">
          <LegalHead
            eyebrow={t(`vitrine.legal_pages.${ns}.eyebrow`)}
            title={t(`vitrine.legal_pages.${ns}.title`)}
            subtitle={t(`vitrine.legal_pages.${ns}.subtitle`)}
          />
          <div className="bg-card border border-edge rounded-2xl p-5 md:p-8 mb-4 text-[12px] text-ghost space-y-0.5">
            <p>{t(`vitrine.legal_pages.${ns}.meta_responsible`)}</p>
            <p>{t(`vitrine.legal_pages.${ns}.meta_date`)}</p>
          </div>
          <div className="bg-card border border-edge rounded-2xl p-5 md:p-8">
            {articles.map((article) => (
              <RichArticle key={article.title} title={article.title} blocks={article.blocks} />
            ))}
          </div>
          <p className="text-center text-ghost text-[11.5px] mt-6">
            {t(`vitrine.legal_pages.${ns}.version`)}
          </p>
        </div>
      </section>
    </VitrineShell>
  )
}

/* ── Exports des 11 pages ─────────────────────────────────────────────── */

export function ConfidentialitePage() {
  return <RichLegalPage ns="confidentialite" path="/confidentialite" />
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
