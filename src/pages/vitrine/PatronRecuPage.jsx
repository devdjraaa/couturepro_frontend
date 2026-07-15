import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, RefreshCw, CheckCircle2, Clock, XCircle, Copy } from 'lucide-react'
import VitrineShell from './VitrineChrome'
import { getAchatStatut } from './vitrineApi'
import { useDevise } from './vitrineCurrency'
import { usePageMeta } from '@/hooks/usePageMeta'

// P162-163 : reçu + récupération d'un patron payant. Le code de transaction (dans l'URL)
// suffit à retrouver la commande et à re-télécharger le contenu après paiement.
export default function PatronRecuPage() {
  const { t } = useTranslation()
  const { format } = useDevise()
  const { code } = useParams()
  const [data, setData] = useState(undefined) // undefined = chargement, null = introuvable
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  usePageMeta({ title: t('vitrine.patron.recu_title'), path: `/patrons/recu/${code}` })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await getAchatStatut(code)
      setData(d && d.code_transaction ? d : null)
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => { load() }, [load])

  const copier = () => {
    navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) }).catch(() => {})
  }

  const paye = data?.paye
  const echoue = data?.statut === 'echoue'

  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[560px] mx-auto px-5">
          <h1 className="font-display text-[clamp(24px,3vw,32px)] text-ink text-center">{t('vitrine.patron.recu_title')}</h1>
          <p className="text-dim text-center mt-2 mb-6">{t('vitrine.patron.recu_subtitle')}</p>

          {data === undefined && <p className="text-dim text-center">{t('vitrine.loading')}</p>}
          {data === null && (
            <div className="bg-card border border-edge rounded-2xl p-6 text-center">
              <p className="text-dim">{t('vitrine.patron.not_found')}</p>
              <Link to="/patrons/recuperer" className="text-primary font-semibold text-sm hover:underline mt-3 inline-block">{t('vitrine.patron.recuperer_title')}</Link>
            </div>
          )}

          {data && (
            <div className="bg-card border border-edge rounded-2xl p-6">
              {/* Code de transaction */}
              <div className="bg-subtle border border-edge rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] text-ghost uppercase tracking-widest">{t('vitrine.patron.code_label')}</div>
                  <div className="font-mono font-bold text-ink text-[15px] truncate">{data.code_transaction}</div>
                </div>
                <button onClick={copier} className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-dim hover:text-primary transition">
                  <Copy size={14} />{copied ? t('vitrine.patron.copied') : t('vitrine.patron.copy')}
                </button>
              </div>

              {/* Contenu */}
              <div className="mt-4">
                <div className="font-semibold text-ink">{data.patron?.titre}</div>
                <div className="text-primary font-bold text-sm mt-0.5">{format(data.montant)}</div>
              </div>

              {/* Statut */}
              <div className="mt-4 flex items-center gap-2">
                {paye
                  ? <><CheckCircle2 size={18} className="text-success" /><span className="text-success font-semibold text-sm">{t('vitrine.patron.statut_paye')}</span></>
                  : echoue
                    ? <><XCircle size={18} className="text-danger" /><span className="text-danger font-semibold text-sm">{t('vitrine.patron.statut_echoue')}</span></>
                    : <><Clock size={18} className="text-warning" /><span className="text-warning font-semibold text-sm">{t('vitrine.patron.statut_pending')}</span></>}
              </div>

              {/* Action */}
              <div className="mt-5">
                {paye ? (
                  <a href={data.telechargement} className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition">
                    <Download size={17} />{t('vitrine.patron.download')}
                  </a>
                ) : (
                  <button onClick={load} disabled={loading} className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary transition disabled:opacity-60">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />{t('vitrine.patron.refresh')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </VitrineShell>
  )
}
