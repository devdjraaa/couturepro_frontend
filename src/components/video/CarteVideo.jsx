import { useState } from 'react'
import { Play, Video, ExternalLink, Trash2, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { analyserLienVideo, estFichierVideo } from '@/utils/videoEmbed'
import { cn } from '@/utils/cn'

/**
 * VID-1 — Carte vidéo : vignette, lecture sur place, format uniforme.
 *
 * Les vidéos s'affichaient en LISTE DE LIENS : une ligne de texte par vidéo,
 * qui ouvrait YouTube dans un autre onglet. Le créateur ne voyait pas ce qu'il
 * avait publié, et le visiteur quittait la vitrine pour ne pas forcément
 * revenir.
 *
 * Deux partis pris :
 *
 * 1. **Le cadre est toujours en 16/9**, quelle que soit la vignette. Des
 *    cartes de hauteurs différentes donnent une grille en escalier ; c'est ce
 *    que « cartes uniformes » veut dire.
 *
 * 2. **Le lecteur n'est chargé qu'au clic.** Poser six `iframe` YouTube dans
 *    une page, c'est six connexions et autant de traceurs avant même qu'on ait
 *    demandé à voir quoi que ce soit — sur une connexion mobile béninoise, ça
 *    se sent. La vignette est une simple image.
 */
/**
 * @param {object}   video      { url, titre, statut, motif_refus }
 * @param {function} [onRetirer] absent côté vitrine : un visiteur ne supprime rien
 */
export default function CarteVideo({ video, onRetirer }) {
  const { t } = useTranslation()
  const [joue, setJoue] = useState(false)
  const [vignetteKo, setVignetteKo] = useState(false)

  const info = analyserLienVideo(video.url)
  const fichier = estFichierVideo(video.url)
  const titre = video.titre || info?.fournisseur || video.url
  const enAttente = video.statut && video.statut !== 'publiee'

  return (
    <div className="bg-card border border-edge rounded-xl overflow-hidden flex flex-col">
      <div className="relative aspect-video bg-subtle">
        {fichier ? (
          // Fichier importé par le créateur : lecteur natif du navigateur.
          // `preload="metadata"` ne télécharge que l'entête, pas la vidéo.
          <video src={video.url} controls preload="metadata"
                 className="absolute inset-0 w-full h-full bg-black" />
        ) : joue && info ? (
          <iframe
            src={`${info.embed}?autoplay=1`}
            title={titre}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {info?.vignette && !vignetteKo ? (
              <img src={info.vignette} alt="" loading="lazy"
                   onError={() => setVignetteKo(true)}
                   className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              // Vimeo n'expose pas de vignette prévisible, et une image peut
              // avoir disparu : un fond neutre vaut mieux qu'une image cassée.
              <div className="absolute inset-0 flex items-center justify-center text-ghost">
                <Video size={28} aria-hidden="true" />
              </div>
            )}

            {info ? (
              <button type="button" onClick={() => setJoue(true)}
                      aria-label={t('studio.videos.lire', { titre })}
                      className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/35 transition">
                <span className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow">
                  <Play size={20} className="text-ink translate-x-[1px]" aria-hidden="true" />
                </span>
              </button>
            ) : (
              // Lien non reconnu : il reste un lien sortant ordinaire plutôt
              // qu'un cadre vide qui laisserait croire à une panne.
              <a href={video.url} target="_blank" rel="noopener noreferrer"
                 className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs text-primary bg-black/10">
                {t('studio.videos.ouvrir_lien')}<ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
          </>
        )}
      </div>

      <div className="p-2.5 flex items-start gap-2">
        <p className="text-[13px] text-ink leading-snug line-clamp-2 flex-1 min-w-0">{titre}</p>
        {onRetirer && (
          <button type="button" onClick={() => onRetirer(video)}
                  aria-label={t('commun.supprimer')}
                  className="text-ghost hover:text-danger shrink-0">
            <Trash2 size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {enAttente && (
        <p className={cn('flex items-center gap-1.5 text-2xs px-2.5 pb-2.5',
          video.statut === 'refusee' ? 'text-danger' : 'text-warning')}
           title={video.motif_refus || undefined}>
          <AlertTriangle size={11} className="shrink-0" aria-hidden="true" />
          {t(`studio.videos.statut.${video.statut}`)}
          {video.motif_refus && <span className="truncate">— {video.motif_refus}</span>}
        </p>
      )}
    </div>
  )
}
