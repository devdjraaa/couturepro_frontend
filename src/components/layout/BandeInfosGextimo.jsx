import { Megaphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInfos } from '@/hooks/useInfos'

/**
 * Communications de Gextimo vers les professionnels, en tête du tableau de bord.
 *
 * Cette place était occupée par les annonces des CRÉATEURS : un professionnel
 * voyait donc les promotions de ses concurrents dans son propre espace de
 * travail — et croyait qu'elles venaient de la direction. Elles sont parties
 * sur la vitrine publique, là où le Boost qu'ils paient a un sens.
 *
 * Ici on affiche ce qu'on s'attend à y trouver : ce que Gextimo a à dire à ses
 * professionnels. Rien à dire, rien à afficher — une bande vide mangerait de la
 * place utile sur chaque écran.
 */
export default function BandeInfosGextimo() {
  const { t } = useTranslation()
  const { data } = useInfos()

  const infos = (data?.data ?? []).filter((i) => !i.lue).slice(0, 5)
  if (infos.length === 0) return null

  // Dupliquée pour que la boucle se referme sans saut visible.
  const suite = [...infos, ...infos]

  return (
    <div className="gx-marquee border-b border-edge bg-primary/[0.06]"
         role="region" aria-label={t('infos.titre')}>
      <div className="gx-marquee__track py-1.5">
        {suite.map((i, k) => (
          <span key={`${i.id}-${k}`} className="flex items-center gap-2 px-6 shrink-0 text-[13px]">
            <Megaphone size={13} className="text-primary shrink-0" aria-hidden="true" />
            <span className="font-semibold text-ink">{i.titre}</span>
            {i.contenu && <span className="text-dim">— {i.contenu}</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
