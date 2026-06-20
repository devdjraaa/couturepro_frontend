import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import VitrineShell from './VitrineChrome'
import { getCreators, demoModels, categories } from './vitrineApi'

const ROTATIONS = [
  'Rejoignez l’aventure dès aujourd’hui.',
  'Découvrez les meilleurs créateurs.',
  'Trouvez votre inspiration mode.',
  'Valorisez votre savoir-faire.',
]

const btnPrimary = 'inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-600 transition'
const btnOutline = 'inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary transition'

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
  const [rot, setRot] = useState(0)
  const [creators, setCreators] = useState(null)
  const [cat, setCat] = useState('all')

  useEffect(() => {
    const t = setInterval(() => setRot((v) => (v + 1) % ROTATIONS.length), 2600)
    return () => clearInterval(t)
  }, [])
  useEffect(() => { getCreators().then(setCreators) }, [])

  const models = cat === 'all' ? demoModels : demoModels.filter((m) => m.cat === cat)

  return (
    <VitrineShell>
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-12 text-center">
        <div className="pointer-events-none absolute -top-44 -right-28 w-[520px] h-[520px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(208,11,11,.08), transparent 70%)' }} />
        <div className="max-w-[1180px] mx-auto px-5 relative">
          <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary">Plateforme des créateurs de mode</div>
          <h1 className="font-display font-extrabold mx-auto max-w-[880px] my-3.5 text-[clamp(34px,6vw,60px)] leading-[1.08] text-ink">
            La vitrine des <span className="text-primary">créateurs de mode</span> africaine.
          </h1>
          <div className="h-7 mb-6 text-dim text-[clamp(15px,2vw,19px)] font-medium">
            <b className="text-ink font-semibold">{ROTATIONS[rot]}</b>
          </div>
          <div className="flex gap-3 justify-center flex-wrap mb-5">
            <a href="#creators" className={btnPrimary}>Découvrir les créateurs</a>
            <a href="#how" className={btnOutline}>Comment ça marche</a>
          </div>
          <div className="flex gap-6 justify-center flex-wrap text-dim text-sm">
            <span><b className="text-ink font-bold">2 547</b> créateurs</span>
            <span><b className="text-ink font-bold">389</b> designers</span>
            <span><b className="text-ink font-bold">6</b> villes</span>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="how" className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <SectionHead eyebrow="Comment ça marche" title="Trois étapes, c’est tout" subtitle="Du compte à la première commande, sans friction." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { n: 'ÉTAPE 1', t: 'Créez votre compte', d: 'Inscription créateur en quelques minutes.' },
              { n: 'ÉTAPE 2', t: 'Publiez vos créations', d: 'Vitrine pro générée automatiquement.' },
              { n: 'ÉTAPE 3', t: 'Recevez des commandes', d: 'Contacts, devis et suivi au même endroit.' },
            ].map((s) => (
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
          <SectionHead eyebrow="Découvrir" title="Trouvez votre créateur" subtitle="Des talents vérifiés, près de chez vous ou partout en Afrique." />
          <div className="flex gap-4 overflow-x-auto pb-3.5">
            {(creators || []).map((c) => (
              <Link key={c.id} to={`/createurs/${c.id}`}
                    className="min-w-[268px] max-w-[268px] bg-card border border-edge rounded-lg p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[50px] h-[50px] rounded-xl flex items-center justify-center font-display font-bold text-lg text-white shrink-0" style={{ background: c.gradient }}>{c.initiales}</div>
                  <div>
                    <h4 className="font-bold text-[15.5px] text-ink flex items-center gap-1.5">
                      {c.nom}
                      {c.verifie && <span className="text-[10.5px] font-bold text-primary bg-primary-50 px-1.5 py-0.5 rounded-full">✓ Vérifié</span>}
                    </h4>
                    <div className="text-[12.5px] text-dim">{c.specialite}</div>
                  </div>
                </div>
                <div className="text-[13px] text-dim mb-3.5">
                  {c.note ? <span className="text-primary font-bold">★ {c.note}</span> : <span className="text-ghost">Nouveau</span>}
                  {' · '}📍 {c.ville}
                </div>
                <span className={btnOutline + ' w-full justify-center !py-2 text-[13px]'}>Visiter le profil</span>
              </Link>
            ))}
            {!creators && <div className="text-dim text-sm p-4">Chargement…</div>}
          </div>
        </div>
      </section>

      {/* GALERIE */}
      <section id="gallery" className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <SectionHead eyebrow="Galerie" title="Inspirez-vous des modèles" subtitle="Une galerie centralisée, classée par catégorie." />
          <div className="flex gap-2.5 justify-center flex-wrap mb-7">
            {categories.map((c) => (
              <button key={c.key} onClick={() => setCat(c.key)}
                      className={`text-[13px] font-medium px-4 py-1.5 rounded-full border transition ${cat === c.key ? 'bg-primary border-primary text-white' : 'bg-card border-edge text-dim hover:border-primary hover:text-primary'}`}>
                {c.label}
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
                  <div className="text-[12px] text-dim mt-0.5 mb-1.5">par {m.par}</div>
                  <div className="font-bold text-primary text-[14.5px]">{m.prix} <span className="text-dim font-medium text-[11px]">FCFA</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUIVI CTA */}
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <div className="rounded-3xl py-12 px-8 text-center bg-[#0D0D0D] text-white">
            <h2 className="font-display text-[clamp(24px,3vw,34px)]">Suivez votre commande</h2>
            <p className="text-white/70 mt-2 mb-6">Avec votre numéro de reçu, sans créer de compte.</p>
            <Link to="/suivi" className={btnPrimary}>Suivre une commande</Link>
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}
