import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { usePageMeta } from '@/hooks/usePageMeta'
import { API_BASE_URL } from '@/constants/config'

/* ── Contenu éditable depuis le back-office ───────────────────────────────
   Chaque page interroge l'API : si l'admin a personnalisé le texte (éditeur
   riche), on l'affiche ; sinon on garde le texte i18n historique (fallback). */

function usePageLegaleDb(ns) {
  const [page, setPage] = useState(null)
  useEffect(() => {
    let mort = false
    fetch(`${API_BASE_URL}/vitrine/pages/${ns}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!mort && d?.personnalise) setPage(d) })
      .catch(() => {})
    return () => { mort = true }
  }, [ns])
  return page
}

// Typographie appliquée au HTML libre de l'éditeur (titres, listes, tableaux, liens).
const PROSE =
  'text-dim text-[14.5px] leading-relaxed ' +
  '[&_h1]:font-display [&_h1]:font-bold [&_h1]:text-ink [&_h1]:text-[22px] [&_h1]:mt-6 [&_h1]:mb-2 ' +
  '[&_h2]:font-display [&_h2]:font-semibold [&_h2]:text-ink [&_h2]:text-[17px] [&_h2]:mt-6 [&_h2]:mb-2 ' +
  '[&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-ink [&_h3]:text-[15px] [&_h3]:mt-4 [&_h3]:mb-1.5 ' +
  '[&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 ' +
  '[&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_strong]:text-ink [&_b]:text-ink ' +
  '[&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_td]:border [&_td]:border-edge [&_td]:px-3 [&_td]:py-2 ' +
  '[&_th]:border [&_th]:border-edge [&_th]:px-3 [&_th]:py-2 [&_th]:bg-subtle [&_th]:text-ink [&_th]:text-left ' +
  '[&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:my-3'

function PageLegaleDb({ page, path }) {
  const { i18n } = useTranslation()
  const en = i18n.language?.startsWith('en')
  const titre = (en ? page.titre_en : page.titre_fr) || page.titre_fr || page.titre_en || ''
  const contenu = (en ? page.contenu_en : page.contenu_fr) || page.contenu_fr || page.contenu_en || ''
  usePageMeta({ title: titre, path })
  return (
    <VitrineShell>
      <section className="py-14 px-5">
        <div className="max-w-[760px] mx-auto">
          {titre && <h1 className="font-display font-extrabold text-[clamp(26px,3.8vw,40px)] text-ink leading-tight mb-8">{titre}</h1>}
          <div className="bg-card border border-edge rounded-2xl p-6 md:p-8">
            {/* HTML rédigé par l'admin (assaini côté serveur avant stockage) */}
            <div className={PROSE} dangerouslySetInnerHTML={{ __html: contenu }} />
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}

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
  const db = usePageLegaleDb(ns)
  usePageMeta({ title: t(`vitrine.legal_pages.${ns}.title`), path })
  const sections = t(`vitrine.legal_pages.${ns}.sections`, { returnObjects: true })
  if (db) return <PageLegaleDb page={db} path={path} />
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
  const db = usePageLegaleDb(ns)
  usePageMeta({ title: t(`vitrine.legal_pages.${ns}.title`), path })
  const articles = t(`vitrine.legal_pages.${ns}.articles`, { returnObjects: true })

  if (db) return <PageLegaleDb page={db} path={path} />

  if (!Array.isArray(articles) || !articles.length) {
    return <LegalPage ns={ns} path={path} />
  }

  const metaLines = t(`vitrine.legal_pages.${ns}.meta_lines`, { returnObjects: true, defaultValue: [] })
  const version   = t(`vitrine.legal_pages.${ns}.version`,    { defaultValue: '' })
  const note      = t(`vitrine.legal_pages.${ns}.note`,       { defaultValue: '' })

  return (
    <VitrineShell>
      <section className="py-14 px-5">
        <div className="max-w-[820px] mx-auto">
          {note && (
            <div className="mb-8 bg-primary/8 border border-primary/30 rounded-xl px-5 py-4 text-[13px] text-ink leading-relaxed">
              {note}
            </div>
          )}
          <LegalHead
            eyebrow={t(`vitrine.legal_pages.${ns}.eyebrow`)}
            title={t(`vitrine.legal_pages.${ns}.title`)}
            subtitle={t(`vitrine.legal_pages.${ns}.subtitle`)}
          />
          {Array.isArray(metaLines) && metaLines.some(Boolean) && (
            <div className="bg-card border border-edge rounded-2xl p-5 md:p-8 mb-4 text-[12px] text-ghost space-y-0.5">
              {metaLines.filter(Boolean).map((l) => <p key={l}>{l}</p>)}
            </div>
          )}
          <div className="bg-card border border-edge rounded-2xl p-5 md:p-8">
            {articles.map((article) => (
              <RichArticle key={article.title} title={article.title} blocks={article.blocks} />
            ))}
          </div>
          {version && (
            <p className="text-center text-ghost text-[11.5px] mt-6">{version}</p>
          )}
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
  return <RichLegalPage ns="mentions" path="/mentions-legales" />
}

export function CookiesPage() {
  return <RichLegalPage ns="cookies" path="/cookies" />
}

export function ProtectionDonneesPage() {
  return <RichLegalPage ns="protection_donnees" path="/protection-donnees" />
}

export function CguPage() {
  return <RichLegalPage ns="cgu" path="/cgu" />
}

export function DroitsCreateursPage() {
  return <RichLegalPage ns="droits_createurs" path="/droits-createurs" />
}

export function ConditionsVentePage() {
  return <RichLegalPage ns="conditions_vente" path="/conditions-vente" />
}

export function ProduitsInterditesPage() {
  return <RichLegalPage ns="produits_interdits" path="/produits-interdits" />
}

export function LivraisonRetoursPage() {
  return <LegalPage ns="livraison_retours" path="/livraison-retours" />
}

export function ReglesCommunautePage() {
  return <RichLegalPage ns="regles_communaute" path="/regles-communaute" />
}

export function ContactReclamationsPage() {
  return <RichLegalPage ns="contact_reclamations" path="/contact-reclamations" />
}
