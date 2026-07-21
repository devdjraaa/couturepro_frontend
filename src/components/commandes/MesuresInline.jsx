import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Ruler, ChevronDown, Check } from 'lucide-react'
import { useMesures, useSaveMesures } from '@/hooks/useMesures'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants/routes'

/**
 * Pts 68-69 — Édition des mesures sans quitter la création de commande.
 *
 * Il fallait auparavant sortir du formulaire, aller dans la fiche du client,
 * saisir les mesures, puis tout recommencer — la commande en cours était perdue.
 * Le panneau charge les libellés attendus par le TYPE DE VÊTEMENT choisi
 * (`libelles_mesures`), pré-remplis avec ce que le client a déjà.
 *
 * ⚠️ Les mesures sont rattachées au CLIENT, pas au vêtement (arbitrage acté) :
 * une seule fiche par client, dont `champs` regroupe tous les types confondus.
 * L'enregistrement FUSIONNE donc au lieu de remplacer — sans quoi enregistrer
 * les mesures d'une robe effacerait celles prises pour un pantalon.
 */
export default function MesuresInline({ clientId, libelles = [], vetementNom }) {
  const { t } = useTranslation()
  const [ouvert, setOuvert] = useState(false)
  const [valeurs, setValeurs] = useState({})
  const [enregistre, setEnregistre] = useState(false)

  const { data: mesure, isLoading } = useMesures(clientId)
  const save = useSaveMesures(clientId)

  const existantes = mesure?.champs ?? {}

  // Pré-remplissage à l'ouverture, et à chaque fois que la fiche du client change.
  useEffect(() => {
    if (!ouvert) return
    setValeurs(Object.fromEntries(libelles.map((l) => [l, existantes[l] ?? ''])))
  }, [ouvert, mesure]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!clientId) return null

  // Type de vêtement sans libellés configurés : le panneau ne rendait RIEN.
  // Le créateur arrivait au prix sans avoir jamais vu de champ de mesures, sans
  // savoir que ça se règle dans le Catalogue — la fonction existait et restait
  // invisible. On le dit, et on l'y emmène.
  if (libelles.length === 0) {
    return (
      <div className="rounded-lg border border-edge bg-subtle px-3 py-2 flex items-start gap-2">
        <Ruler size={14} className="text-ghost shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-2xs text-dim leading-relaxed">
          {t('commandes.creation.mesures_non_configurees', { vetement: vetementNom })}{' '}
          <Link to={ROUTES.VETEMENTS} className="font-semibold text-primary">
            {t('commandes.creation.mesures_configurer')}
          </Link>
        </p>
      </div>
    )
  }

  const renseignees = libelles.filter((l) => existantes[l] !== undefined && existantes[l] !== '').length

  const enregistrer = async () => {
    // Seules les valeurs réellement saisies partent : un champ vidé ne doit pas
    // écraser une mesure existante par une chaîne vide.
    const saisies = Object.fromEntries(
      Object.entries(valeurs)
        .filter(([, v]) => String(v).trim() !== '')
        .map(([k, v]) => [k, Number(v)]),
    )
    await save.mutateAsync({ ...existantes, ...saisies })
    setEnregistre(true)
    setTimeout(() => setEnregistre(false), 2500)
    setOuvert(false)
  }

  return (
    <div className="rounded-lg border border-edge bg-subtle overflow-hidden">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        <Ruler size={14} className="text-primary shrink-0" />
        <span className="text-xs font-medium text-ink flex-1">
          {t('commandes.creation.mesures_titre')}
        </span>
        {enregistre ? (
          <span className="text-2xs font-semibold text-success flex items-center gap-1">
            <Check size={12} />{t('commandes.creation.mesures_enregistrees')}
          </span>
        ) : (
          <span className="text-2xs text-ghost tabular-nums">
            {renseignees}/{libelles.length}
          </span>
        )}
        <ChevronDown size={14} className={cn('text-ghost transition-transform', ouvert && 'rotate-180')} />
      </button>

      {ouvert && (
        <div className="px-3 pb-3 space-y-2">
          {isLoading ? (
            <p className="text-2xs text-ghost">{t('commun.chargement')}</p>
          ) : (
            <>
              <p className="text-2xs text-ghost">
                {t('commandes.creation.mesures_aide', { vetement: vetementNom })}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {libelles.map((libelle) => (
                  <div key={libelle}>
                    <label className="block text-2xs text-ghost mb-0.5 truncate" title={libelle}>
                      {/* Les libellés sont saisis librement par l'atelier
                          (`tour_de_poitrine`) : on les rend lisibles sans les
                          traduire, puisqu'ils n'ont pas de clé i18n. */}
                      {libelle.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={valeurs[libelle] ?? ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setValeurs((v) => ({ ...v, [libelle]: e.target.value }))}
                      className="w-full bg-card border border-edge rounded-lg px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={enregistrer}
                disabled={save.isPending}
                className="w-full mt-1 rounded-lg bg-primary text-white text-xs font-semibold py-2 disabled:opacity-60"
              >
                {save.isPending ? t('commun.chargement') : t('commandes.creation.mesures_enregistrer')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
