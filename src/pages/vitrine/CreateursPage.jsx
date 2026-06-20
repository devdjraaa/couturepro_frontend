import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import VitrineShell from './VitrineChrome'
import { getCreators } from './vitrineApi'

export default function CreateursPage() {
  const [creators, setCreators] = useState(null)
  useEffect(() => { getCreators().then(setCreators) }, [])

  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <div className="text-center mb-9">
            <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary">Créateurs</div>
            <h1 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] mt-2 text-ink">Découvrez les créateurs</h1>
            <p className="text-dim mt-1">Des talents vérifiés à travers le Bénin et l’Afrique de l’Ouest.</p>
          </div>

          {!creators && <p className="text-center text-dim">Chargement…</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(creators || []).map((c) => (
              <Link key={c.id} to={`/createurs/${c.id}`}
                    className="bg-card border border-edge rounded-lg p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center font-display font-bold text-lg text-white shrink-0" style={{ background: c.gradient }}>{c.initiales}</div>
                  <div>
                    <h3 className="font-bold text-base text-ink flex items-center gap-1.5">
                      {c.nom}
                      {c.verifie && <span className="text-[10.5px] font-bold text-primary bg-primary-50 px-1.5 py-0.5 rounded-full">✓ Vérifié</span>}
                    </h3>
                    <div className="text-[12.5px] text-dim">{c.specialite} · {c.ville}</div>
                  </div>
                </div>
                <div className="flex gap-3.5 text-[13px] text-dim">
                  {c.note ? <span className="text-primary font-bold">★ {c.note}</span> : <span className="text-ghost">Nouveau</span>}
                  {c.avis ? <span>· {c.avis} avis</span> : null}
                  {c.experience ? <span>· {c.experience}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}
