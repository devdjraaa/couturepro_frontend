import { useEffect, useState } from 'react'
import { Plus, X, Save, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useVeilleConfig, useUpdateVeilleConfig } from '@/hooks/admin/useVeilleConfig'
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
 * Les RECHERCHES déterminent ce qui est ramené, les MOTS-CLÉS ce qui est jugé
 * pertinent une fois ramené. Les deux sont montrés côte à côte parce qu'ajouter
 * un terme de recherche sans le mot-clé correspondant remonte des articles que
 * la notation écartera aussitôt.
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
    <div className="mb-5">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <h3 className="font-semibold text-ink text-[14px]">{titre}</h3>
        <span className="text-[11px] text-ghost tabular-nums">
          {t('admin.veille.config.compteur_termes', { n: termes.length })}
        </span>
      </div>
      <p className="text-[12.5px] text-dim mb-2.5">{aide}</p>

      <div className="flex flex-wrap gap-1.5 mb-2.5">
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

      <div className="flex gap-2">
        <input
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouter() } }}
          placeholder={t('admin.veille.config.ajouter_placeholder')}
          className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-card border border-edge text-[13px] text-ink placeholder:text-ghost focus:outline-none focus:border-primary transition"
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
    </div>
  )
}

export default function ConfigVeille() {
  const { t } = useTranslation()
  const { data, isLoading } = useVeilleConfig()
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

  const annuler = () => {
    setRecherches(data?.recherches ?? [])
    setMots({
      benin: data?.mots_cles?.benin ?? [],
      metier: data?.mots_cles?.metier ?? [],
      occasion: data?.mots_cles?.occasion ?? [],
    })
    setModifie(false)
  }

  const soumettre = () => {
    enregistrer.mutate({ recherches, mots_cles: mots }, { onSuccess: () => setModifie(false) })
  }

  if (isLoading) {
    return <p className="text-dim text-sm">{t('commun.chargement')}</p>
  }

  return (
    <div className="bg-card border border-edge rounded-2xl mb-5 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-edge">
        <h2 className="font-semibold text-ink text-[15px]">{t('admin.veille.config.titre')}</h2>
        <p className="text-[12.5px] text-dim mt-0.5">{t('admin.veille.config.sous_titre')}</p>
      </div>

      <div className="p-5">
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

        <div className="flex items-center gap-2.5 pt-1">
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

          {modifie && (
            <button
              type="button"
              onClick={annuler}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-edge text-[13px] text-dim hover:text-ink transition"
            >
              <RotateCcw size={14} aria-hidden="true" />
              {t('commun.annuler')}
            </button>
          )}

          {enregistrer.isError && (
            <span className="text-[12.5px] text-primary">{t('admin.veille.config.echec')}</span>
          )}
          {!modifie && enregistrer.isSuccess && (
            <span className="text-[12.5px] text-dim">{t('admin.veille.config.enregistre')}</span>
          )}
        </div>

        <p className="text-[12px] text-ghost mt-3.5">{t('admin.veille.config.prise_en_compte')}</p>
      </div>
    </div>
  )
}
