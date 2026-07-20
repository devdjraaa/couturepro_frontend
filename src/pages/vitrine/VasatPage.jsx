import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'
import { API_BASE_URL } from '@/constants/config'

/**
 * VASAT — second produit du groupe (directive direction 20/07).
 *
 * Présent sur le site mais invisible au public : page volontairement blanche,
 * accessible par mot de passe uniquement, le temps du développement en
 * arrière-plan. Le premier mot de passe saisi devient la référence (TOFU),
 * vérifié ensuite côté serveur à chaque accès. Retirer la protection suffira
 * le jour du lancement.
 */
export default function VasatPage() {
  const { t } = useTranslation()
  usePageMeta({ title: 'VASAT', description: '', path: '/vasat', noindex: true })

  const [ok, setOk] = useState(() => sessionStorage.getItem('vasat_ok') === '1')
  const [mdp, setMdp] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const entrer = async (e) => {
    e.preventDefault()
    if (busy || mdp.length < 6) return
    setBusy(true); setErr('')
    try {
      const r = await fetch(`${API_BASE_URL}/vitrine/vasat/acces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ mdp }),
      })
      const data = await r.json().catch(() => null)
      if (r.ok && data?.ok) {
        sessionStorage.setItem('vasat_ok', '1')
        setOk(true)
      } else {
        setErr(data?.code === 'non_configure'
          ? t('vitrine.vasat.indisponible')
          : (data?.message || t('vitrine.vasat.erreur')))
      }
    } catch {
      setErr(t('vitrine.vasat.erreur'))
    } finally { setBusy(false) }
  }

  if (ok) {
    // Page blanche assumée : l'espace de travail VASAT se construira ici.
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <p className="text-ghost text-sm tracking-widest uppercase">VASAT</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-5">
      <form onSubmit={entrer} className="w-full max-w-[320px] text-center">
        <Lock size={20} className="mx-auto text-ghost mb-4" />
        <input
          type="password" value={mdp} onChange={(e) => setMdp(e.target.value)}
          placeholder={t('vitrine.vasat.mdp')} autoFocus
          className="w-full rounded-lg border border-edge bg-card px-3 py-2.5 text-sm text-ink text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {err && <p className="text-xs text-danger mt-2" role="alert">{err}</p>}
        <button type="submit" disabled={busy || mdp.length < 6}
                className="mt-3 w-full rounded-lg bg-primary text-white text-sm font-semibold py-2.5 disabled:opacity-50">
          {t('vitrine.vasat.entrer')}
        </button>
      </form>
    </div>
  )
}
