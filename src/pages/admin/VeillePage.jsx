// Veille opportunités (n8n + IA locale) : les résultats hebdo arrivent ici — l'e-mail du
// lundi n'est plus qu'une notification courte. Sélection IA en tête (rang + raison), le
// reste des résultats bruts est replié.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Radar, ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import { AdminLayout } from '@/components/admin'
import adminApi from '@/services/adminApi'
import { cn } from '@/utils/cn'

export default function VeillePage() {
  const { t } = useTranslation()
  const [semaines, setSemaines] = useState(null)
  const [ouverts, setOuverts] = useState({})

  useEffect(() => {
    adminApi.get('/veille')
      .then(({ data }) => setSemaines(Array.isArray(data) ? data : []))
      .catch(() => setSemaines([]))
  }, [])

  const formatSemaine = (d) => {
    try {
      return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    } catch { return d }
  }

  return (
    <AdminLayout title={t('admin.veille.titre')}>
      <p className="text-sm text-dim mb-5">{t('admin.veille.sous_titre')}</p>

      {semaines === null && <p className="text-dim text-sm">{t('commun.chargement')}</p>}

      {Array.isArray(semaines) && semaines.length === 0 && (
        <div className="bg-card border border-edge rounded-2xl p-8 text-center">
          <Radar size={28} className="mx-auto text-ghost mb-2" />
          <p className="text-dim text-sm">{t('admin.veille.vide')}</p>
        </div>
      )}

      {Array.isArray(semaines) && semaines.map((s, idx) => (
        <div key={s.semaine} className="bg-card border border-edge rounded-2xl mb-4 overflow-hidden">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-edge">
            <h2 className="font-semibold text-ink text-[15px]">
              {t('admin.veille.semaine_du', { date: formatSemaine(s.semaine) })}
              {idx === 0 && <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t('admin.veille.derniere')}</span>}
            </h2>
            <span className="text-xs text-ghost tabular-nums">
              {t('admin.veille.compteur', { sel: s.selection.length, total: s.selection.length + s.autres.length })}
            </span>
          </div>

          {/* Sélection IA */}
          <div className="p-4 space-y-2.5">
            {s.selection.length === 0 && <p className="text-[13px] text-ghost">{t('admin.veille.aucune_selection')}</p>}
            {s.selection.map((item) => (
              <div key={item.lien} className="flex gap-3 items-start bg-subtle rounded-xl p-3.5">
                <span className="flex-none w-6 h-6 rounded-full bg-primary text-inverse text-[12px] font-bold flex items-center justify-center mt-0.5">
                  {item.ia_rang}
                </span>
                <div className="min-w-0 flex-1">
                  <a href={item.lien} target="_blank" rel="noopener noreferrer"
                     className="font-medium text-ink text-[14px] hover:text-primary transition inline-flex items-start gap-1.5">
                    {item.titre}<ExternalLink size={13} className="flex-none mt-1 text-ghost" />
                  </a>
                  {item.ia_raison && (
                    <p className="text-[12.5px] text-dim mt-1 flex items-start gap-1.5">
                      <Sparkles size={13} className="flex-none mt-0.5 text-primary/70" />{item.ia_raison}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Autres résultats (repliés) */}
          {s.autres.length > 0 && (
            <div className="border-t border-edge">
              <button onClick={() => setOuverts((o) => ({ ...o, [s.semaine]: !o[s.semaine] }))}
                      className="w-full px-5 py-2.5 flex items-center gap-1.5 text-[12.5px] text-dim hover:text-ink transition">
                {ouverts[s.semaine] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {t('admin.veille.autres', { n: s.autres.length })}
              </button>
              {ouverts[s.semaine] && (
                <ul className="px-6 pb-4 space-y-1.5">
                  {s.autres.map((item) => (
                    <li key={item.lien}>
                      <a href={item.lien} target="_blank" rel="noopener noreferrer"
                         className={cn('text-[13px] text-dim hover:text-primary transition')}>
                        {item.titre}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  )
}
