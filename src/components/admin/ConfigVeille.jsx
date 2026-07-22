import { useEffect, useState } from 'react'
import { Plus, X, Save, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useVeilleConfig, useUpdateVeilleConfig } from '@/hooks/admin/useVeilleConfig'
import Modal from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

/**
 * Recherches et mots-clés de la veille, éditables par la direction.
 *
 * Ils étaient « modifiables en base », ce qui revient à ne l'être pour
 * personne : il fallait une console sur le serveur. La direction connaît le
 * terrain — les salons, les bailleurs, le vocabulaire du métier — bien mieux
 * que nous ; l'obliger à passer par un développeur pour ajouter un terme
 * garantissait que la liste ne bougerait jamais.
 *
 * Présenté en FENÊTRE, pas déplié dans la page : ces quatre listes font une
 * bonne centaine de termes et repoussaient les résultats de la veille hors de
 * l'écran. On vient les régler de temps en temps ; on vient lire les résultats
 * tous les jours. C'est donc aux résultats de garder la place.
 */

/** Une liste de termes : on ajoute, on retire, rien d'autre. */
function ListeTermes({ titre, aide, termes, onChange, obligatoire }) {
  const { t } = useTranslation()
  const [saisie, setSaisie] = useState('')

  const ajouter = () => {
    const v = saisie.trim()
    // Le doublon est refusé ici plutôt qu'à l'enregistrement : sinon le terme
    // disparaît au rechargement sans que personne ne comprenne pourquoi.
    if (v && !termes.includes(v)) onChange([...termes, v])
    setSaisie('')
  }

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h3 className="font-semibold text-ink text-[14px]">{titre}</h3>
        <span className="text-[11px] text-ghost tabular-nums shrink-0">
          {t('admin.veille.config.compteur_termes', { n: termes.length })}
        </span>
      </div>
      <p className="text-[12.5px] text-dim mb-2.5">{aide}</p>

      <div className="flex gap-2 mb-2.5">
        <input
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouter() } }}
          placeholder={t('admin.veille.config.ajouter_placeholder')}
          className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-app border border-edge text-[13px] text-ink placeholder:text-ghost focus:outline-none focus:border-primary transition"
        />
        <button
          type="button"
          onClick={ajouter}
          disabled={!saisie.trim()}
          className="flex-none inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-subtle border border-edge text-[13px] font-medium text-ink hover:border-primary transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={14} aria-hidden="true" />
          {t('admin.veille.config.ajouter')}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {termes.length === 0 && (
          <span className="text-[12.5px] text-ghost italic">{t('admin.veille.config.liste_vide')}</span>
        )}
        {termes.map((terme) => (
          <span
            key={terme}
            className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-subtle border border-edge text-[12.5px] text-ink"
          >
            {terme}
            <button
              type="button"
              onClick={() => onChange(termes.filter((x) => x !== terme))}
              disabled={obligatoire && termes.length === 1}
              aria-label={t('admin.veille.config.retirer', { terme })}
              className="p-0.5 rounded-full text-ghost hover:text-primary hover:bg-primary/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ConfigVeille() {
  const { t } = useTranslation()
  const [ouvert, setOuvert] = useState(false)

  // La configuration n'est demandée qu'à l'ouverture : la page de veille sert
  // d'abord à lire les résultats, et cet appel n'a rien à y faire tant que
  // personne ne veut régler quoi que ce soit.
  const { data, isLoading } = useVeilleConfig({ enabled: ouvert })
  const enregistrer = useUpdateVeilleConfig()

  const [recherches, setRecherches] = useState([])
  const [mots, setMots] = useState({ benin: [], metier: [], occasion: [] })
  const [modifie, setModifie] = useState(false)

  // Le formulaire ne se réaligne sur le serveur que tant qu'il n'a pas été
  // touché : un rafraîchissement en arrière-plan effacerait sinon une saisie
  // en cours sans prévenir.
  useEffect(() => {
    if (!data || modifie) return
    setRecherches(data.recherches ?? [])
    setMots({
      benin: data.mots_cles?.benin ?? [],
      metier: data.mots_cles?.metier ?? [],
      occasion: data.mots_cles?.occasion ?? [],
    })
  }, [data, modifie])

  const majRecherches = (v) => { setRecherches(v); setModifie(true) }
  const majMots = (axe) => (v) => { setMots((m) => ({ ...m, [axe]: v })); setModifie(true) }

  const reinitialiser = () => {
    setRecherches(data?.recherches ?? [])
    setMots({
      benin: data?.mots_cles?.benin ?? [],
      metier: data?.mots_cles?.metier ?? [],
      occasion: data?.mots_cles?.occasion ?? [],
    })
    setModifie(false)
  }

  // Fermer en abandonnant : la saisie non enregistrée est rendue au serveur,
  // sans quoi la fenêtre rouvrirait sur des termes qui n'existent nulle part.
  const fermer = () => { reinitialiser(); setOuvert(false) }

  const soumettre = () => {
    enregistrer.mutate({ recherches, mots_cles: mots }, { onSuccess: () => setModifie(false) })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="flex-none inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-edge text-[13px] font-medium text-ink hover:border-primary transition"
      >
        <SlidersHorizontal size={14} aria-hidden="true" />
        {t('admin.veille.config.titre')}
      </button>

      <Modal
        isOpen={ouvert}
        onClose={fermer}
        title={t('admin.veille.config.titre')}
        size="xl"
        footer={
          <>
            {modifie && (
              <button
                type="button"
                onClick={reinitialiser}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-edge text-[13px] text-dim hover:text-ink transition mr-auto"
              >
                <RotateCcw size={14} aria-hidden="true" />
                {t('commun.annuler')}
              </button>
            )}
            {enregistrer.isError && (
              <span className="self-center text-[12.5px] text-primary mr-auto">
                {t('admin.veille.config.echec')}
              </span>
            )}
            <button
              type="button"
              onClick={soumettre}
              disabled={!modifie || enregistrer.isPending}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition',
                'bg-primary text-inverse hover:bg-primary-600',
                'disabled:opacity-40 disabled:cursor-not-allowed',
              )}
            >
              <Save size={14} aria-hidden="true" />
              {enregistrer.isPending ? t('commun.enregistrement') : t('commun.enregistrer')}
            </button>
          </>
        }
      >
        <p className="text-[12.5px] text-dim mb-4">{t('admin.veille.config.sous_titre')}</p>

        {isLoading ? (
          <p className="text-dim text-sm">{t('commun.chargement')}</p>
        ) : (
          <>
            <ListeTermes
              titre={t('admin.veille.config.recherches')}
              aide={t('admin.veille.config.recherches_aide')}
              termes={recherches}
              onChange={majRecherches}
              obligatoire
            />

            <div className="h-px bg-edge my-5" />

            <ListeTermes
              titre={t('admin.veille.config.axe_benin')}
              aide={t('admin.veille.config.axe_benin_aide')}
              termes={mots.benin}
              onChange={majMots('benin')}
              obligatoire
            />
            <ListeTermes
              titre={t('admin.veille.config.axe_metier')}
              aide={t('admin.veille.config.axe_metier_aide')}
              termes={mots.metier}
              onChange={majMots('metier')}
              obligatoire
            />
            <ListeTermes
              titre={t('admin.veille.config.axe_occasion')}
              aide={t('admin.veille.config.axe_occasion_aide')}
              termes={mots.occasion}
              onChange={majMots('occasion')}
            />

            <p className="text-[12px] text-ghost mt-4">{t('admin.veille.config.prise_en_compte')}</p>
          </>
        )}
      </Modal>
    </>
  )
}
