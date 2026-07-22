import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '@/services/api'
import AideContextuelle from '@/components/ui/AideContextuelle'

/**
 * Explique ce que chaque rôle d'équipe permet réellement.
 *
 * Le patron choisissait « assistant » ou « membre » dans une liste sans savoir
 * ce qu'il accordait. Le seul indice affiché — « Création & archivage » pour
 * l'assistant — était même devenu FAUX : ses droits ont été élargis le 20/07
 * (modification des clients, commandes et mesures, encaissement des paiements)
 * sans que la mention suive.
 *
 * D'où le choix de tout lire au SERVEUR, là où les droits sont appliqués,
 * plutôt que d'écrire une description ici : elle dériverait de nouveau au
 * premier changement. Et le serveur les renvoie ATELIER PAR ATELIER — un patron
 * qui a resserré les siens verrait autrement une liste qui ne le concerne pas.
 *
 * Ce qui est REFUSÉ est montré autant que ce qui est accordé : « ne peut rien
 * supprimer » est souvent ce qui décide à confier un rôle plutôt qu'un autre.
 */
export default function AideRoles() {
  const { t } = useTranslation()
  const [roles, setRoles] = useState(null)
  const [erreur, setErreur] = useState(false)

  useEffect(() => {
    let vivant = true
    api.get('/equipe/roles')
      .then(({ data }) => { if (vivant) setRoles(data?.roles ?? []) })
      .catch(() => { if (vivant) setErreur(true) })

    return () => { vivant = false }
  }, [])

  const Liste = ({ cles, accorde }) => (
    <ul className="space-y-1 mt-1.5">
      {cles.map((cle) => (
        <li key={cle} className="flex items-start gap-1.5">
          {accorde
            ? <Check size={13} className="text-success shrink-0 mt-0.5" aria-hidden="true" />
            : <X size={13} className="text-ghost shrink-0 mt-0.5" aria-hidden="true" />}
          <span className={accorde ? 'text-ink' : 'text-ghost'}>
            {/* Repli sur la clé brute : une permission ajoutée côté serveur
                avant sa traduction reste lisible, plutôt que d'afficher un vide. */}
            {t(`permissions.${cle}`, { defaultValue: cle })}
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <AideContextuelle titre={t('aide.role_titre')}>
      <p className="mb-3">{t('aide.role_intro')}</p>

      {erreur && <p className="text-ghost">{t('aide.indispo')}</p>}
      {!erreur && roles === null && <p className="text-ghost">{t('aide.chargement')}</p>}

      {(roles ?? []).map((r) => (
        <div key={r.role} className="mb-4 last:mb-0">
          <p className="font-semibold text-ink text-[14px] mb-1">{t(`equipe.roles.${r.role}`)}</p>

          <p className="text-[12px] font-medium text-dim mt-2">{t('aide.accorde')}</p>
          <Liste cles={r.accorde ?? []} accorde />

          {(r.refuse ?? []).length > 0 && (
            <>
              <p className="text-[12px] font-medium text-dim mt-2.5">{t('aide.refuse')}</p>
              <Liste cles={r.refuse} accorde={false} />
            </>
          )}
        </div>
      ))}
    </AideContextuelle>
  )
}
