import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { getCreators, demoModels, categories } from './vitrineApi'
import { useDevise } from './vitrineCurrency'

const btnPrimary = 'inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-600 transition'
const btnOutline = 'inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary transition'

function HeroSearch({ creators }) {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const list = creators || []
  const cM = query ? list.filter((c) => `${c.nom} ${c.specialite} ${c.ville}`.toLowerCase().includes(query)).slice(0, 4) : []
  const mM = query ? demoModels.filter((m) => `${m.nom} ${m.par}`.toLowerCase().includes(query)).slice(0, 4) : []
  const idByNom = (nom) => list.find((c) => c.nom === nom)?.id
  const has = cM.length || mM.length

  return (
    <div className="relative max-w-[540px] mx-auto mb-6 text-left">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('vitrine.search.placeholder')}
             className="w-full rounded-xl border border-edge bg-card px-4 py-3 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30" />
      {query && (
        <div className="absolute inset-x-0 top-full mt-2 bg-card border border-edge rounded-xl shadow-lg overflow-hidden z-30">
          {!has && <div className="px-4 py-3 text-sm text-dim">{t('vitrine.search.empty')}</div>}
          {cM.length > 0 && (
            <div className="py-1">
              <div className="px-4 pt-2 pb-1 text-2xs font-bold uppercase tracking-wider text-ghost">{t('vitrine.search.creators')}</div>
              {cM.map((c) => (
                <Link key={c.id} to={`/createurs/${c.id}`} onClick={() => setQ('')}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-subtle transition">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: c.gradient }}>{c.initiales}</span>
                  <span className="text-sm text-ink">{c.nom}</span>
                  <span className="text-xs text-ghost ml-auto">{c.specialite}</span>
                </Link>
              ))}
            </div>
          )}
          {mM.length > 0 && (
            <div className="py-1 border-t border-edge">
              <div className="px-4 pt-2 pb-1 text-2xs font-bold uppercase tracking-wider text-ghost">{t('vitrine.search.models')}</div>
              {mM.map((m) => {
                const id = idByNom(m.par)
                return (
                  <Link key={m.id} to={id ? `/createurs/${id}` : '/#gallery'} onClick={() => setQ('')}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-subtle transition">
                    <span className="text-lg">{m.emoji}</span>
                    <span className="text-sm text-ink">{m.nom}</span>
                    <span className="text-xs text-ghost ml-auto">{m.par}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SectionHead({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-[620px] mx-auto mb-9 text-center">
      {eyebrow && <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary">{eyebrow}</div>}
      <h2 className="font-display text-[clamp(26px,3.4vw,38px)] mt-2.5 mb-2 text-ink">{title}</h2>
      {subtitle && <p className="text-dim">{subtitle}</p>}
    </div>
  )
}

export default function VitrineHome() {
  const { t } = useTranslation()
  const { format } = useDevise()
  const [rot, setRot] = useState(0)
  const [creators, setCreators] = useState(null)
  const [cat, setCat] = useState('all')

  const rotations = t('vitrine.rotations', { returnObjects: true })
  const steps = t('vitrine.how.steps', { returnObjects: true })

  useEffect(() => {
    const id = setInterval(() => setRot((v) => v + 1), 2600)
    return () => clearInterval(id)
  }, [])
  useEffect(() => { getCreators().then(setCreators) }, [])

  const models = cat === 'all' ? demoModels : demoModels.filter((m) => m.cat === cat)
  const rotMsg = Array.isArray(rotations) && rotations.length ? rotations[rot % rotations.length] : ''

  return (
    <VitrineShell>
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-12 text-center">
        <div className="pointer-events-none absolute -top-44 -right-28 w-[520px] h-[520px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(208,11,11,.08), transparent 70%)' }} />
        <div className="max-w-[1180px] mx-auto px-5 relative">
          <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary">{t('vitrine.hero.eyebrow')}</div>
          <h1 className="font-display font-extrabold mx-auto max-w-[880px] my-3.5 text-[clamp(34px,6vw,60px)] leading-[1.08] text-ink">
            {t('vitrine.hero.title_pre')}<span className="text-primary">{t('vitrine.hero.title_hl')}</span>{t('vitrine.hero.title_post')}
          </h1>
          <div className="h-7 mb-6 text-dim text-[clamp(15px,2vw,19px)] font-medium">
            <b className="text-ink font-semibold">{rotMsg}</b>
          </div>
          <HeroSearch creators={creators} />
          <div className="flex gap-3 justify-center flex-wrap mb-5">
            <a href="#creators" className={btnPrimary}>{t('vitrine.hero.cta_discover')}</a>
            <a href="#how" className={btnOutline}>{t('vitrine.hero.cta_how')}</a>
          </div>
          <div className="flex gap-6 justify-center flex-wrap text-dim text-sm">
            <span><b className="text-ink font-bold">2 547</b> {t('vitrine.hero.stat_creators')}</span>
            <span><b className="text-ink font-bold">389</b> {t('vitrine.hero.stat_designers')}</span>
            <span><b className="text-ink font-bold">6</b> {t('vitrine.hero.stat_cities')}</span>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="how" className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <SectionHead eyebrow={t('vitrine.how.eyebrow')} title={t('vitrine.how.title')} subtitle={t('vitrine.how.subtitle')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(Array.isArray(steps) ? steps : []).map((s) => (
              <div key={s.n} className="bg-card border border-edge rounded-lg p-7 text-center">
                <div className="text-[12px] font-bold text-primary tracking-[0.1em]">{s.n}</div>
                <h3 className="font-display text-xl my-1.5 text-ink">{s.t}</h3>
                <p className="text-dim text-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CRÉATEURS */}
      <section id="creators" className="py-16 bg-elevated">
        <div className="max-w-[1180px] mx-auto px-5">
          <SectionHead eyebrow={t('vitrine.creators.eyebrow')} title={t('vitrine.creators.title')} subtitle={t('vitrine.creators.subtitle')} />
          <div className="flex gap-4 overflow-x-auto pb-3.5">
            {(creators || []).map((c) => (
              <Link key={c.id} to={`/createurs/${c.id}`}
                    className="min-w-[268px] max-w-[268px] bg-card border border-edge rounded-lg p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[50px] h-[50px] rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-lg text-white shrink-0" style={c.logo_url ? undefined : { background: c.gradient }}>{c.logo_url ? <img src={c.logo_url} alt={c.nom} className="w-full h-full object-cover" /> : c.initiales}</div>
                  <div>
                    <h4 className="font-bold text-[15.5px] text-ink flex items-center gap-1.5">
                      {c.nom}
                      {c.verifie && <span className="text-[10.5px] font-bold text-primary bg-primary-50 px-1.5 py-0.5 rounded-full">{t('vitrine.creators.verified')}</span>}
                    </h4>
                    <div className="text-[12.5px] text-dim">{c.specialite}</div>
                  </div>
                </div>
                <div className="text-[13px] text-dim mb-3.5">
                  {c.note ? <span className="text-primary font-bold">★ {c.note}</span> : <span className="text-ghost">{t('vitrine.creators.new')}</span>}
                  {' · '}📍 {c.ville}
                </div>
                <span className={btnOutline + ' w-full justify-center !py-2 text-[13px]'}>{t('vitrine.creators.visit')}</span>
              </Link>
            ))}
            {!creators && <div className="text-dim text-sm p-4">{t('vitrine.loading')}</div>}
          </div>
        </div>
      </section>

      {/* GALERIE */}
      <section id="gallery" className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <SectionHead eyebrow={t('vitrine.gallery.eyebrow')} title={t('vitrine.gallery.title')} subtitle={t('vitrine.gallery.subtitle')} />
          <div className="flex gap-2.5 justify-center flex-wrap mb-7">
            {categories.map((c) => (
              <button key={c.key} onClick={() => setCat(c.key)}
                      className={`text-[13px] font-medium px-4 py-1.5 rounded-full border transition ${cat === c.key ? 'bg-primary border-primary text-white' : 'bg-card border-edge text-dim hover:border-primary hover:text-primary'}`}>
                {t(`vitrine.gallery.cats.${c.key}`)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {models.map((m) => (
              <div key={m.id} className="bg-card border border-edge rounded-lg overflow-hidden">
                <div className="h-[160px] flex items-center justify-center text-[40px] relative" style={{ background: m.gradient }}>
                  <span className="absolute top-2.5 left-2.5 text-white text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#0D0D0D]">{m.type}</span>
                  {m.emoji}
                </div>
                <div className="p-3.5">
                  <h4 className="font-semibold text-[14.5px] text-ink">{m.nom}</h4>
                  <div className="text-[12px] text-dim mt-0.5 mb-1.5">{t('vitrine.gallery.by')} {m.par}</div>
                  <div className="font-bold text-primary text-[14.5px]">{format(m.prix)}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-2xs text-ghost mt-4 text-center">{t('vitrine.indicatif')}</p>
        </div>
      </section>

      {/* SUIVI CTA */}
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <div className="rounded-3xl py-12 px-8 text-center bg-[#0D0D0D] text-white">
            <h2 className="font-display text-[clamp(24px,3vw,34px)]">{t('vitrine.cta.title')}</h2>
            <p className="text-white/70 mt-2 mb-6">{t('vitrine.cta.subtitle')}</p>
            <Link to="/suivi" className={btnPrimary}>{t('vitrine.cta.button')}</Link>
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}
