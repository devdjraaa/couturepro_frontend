// Données + client de l'API publique vitrine (avec repli démo si l'API n'est
// pas joignable / pas encore déployée).
import { API_BASE_URL } from '@/constants/config'

export const demoCreators = [
  { id: 'maison-zinsou', nom: 'Maison Zinsou', initiales: 'MZ', specialite: 'Haute couture', ville: 'Cotonou', note: '4.9', avis: 27, verifie: true, experience: '8 ans', gradient: 'linear-gradient(135deg,#D00B0B,#7a0606)' },
  { id: 'atelier-jaures', nom: 'Atelier Jaures', initiales: 'AJ', specialite: 'Tailleur', ville: 'Cotonou', note: '4.8', avis: 23, verifie: true, experience: '6 ans', gradient: 'linear-gradient(135deg,#1a1a1a,#444)' },
  { id: 'studio-fatou', nom: 'Studio Fatou', initiales: 'SF', specialite: 'Styliste', ville: 'Porto-Novo', note: '4.9', avis: 41, verifie: true, experience: '10 ans', gradient: 'linear-gradient(135deg,#6F635E,#2A2A2A)' },
  { id: 'atelier-moussa', nom: 'Atelier Moussa', initiales: 'AM', specialite: 'Modéliste', ville: 'Parakou', note: '4.7', avis: 12, verifie: false, experience: '4 ans', gradient: 'linear-gradient(135deg,#D00B0B,#1a1a1a)' },
  { id: 'maison-adama', nom: 'Maison Adama', initiales: 'MA', specialite: 'Couturière', ville: 'Abomey-Calavi', note: '4.6', avis: 18, verifie: true, experience: '5 ans', gradient: 'linear-gradient(135deg,#333,#D00B0B)' },
]

export const categories = [
  { key: 'all', label: 'Tous' },
  { key: 'robe', label: 'Robes' },
  { key: 'costume', label: 'Costumes' },
  { key: 'boubou', label: 'Boubous' },
  { key: 'enfant', label: 'Enfants' },
]

export const demoModels = [
  { id: 1, nom: 'Boubou Bazin', par: 'Atelier Jaures', prix: '25 000', cat: 'boubou', type: 'Sur mesure', gradient: 'linear-gradient(135deg,#D00B0B,#7a0606)' },
  { id: 2, nom: 'Robe Racines', par: 'Maison Zinsou', prix: '75 000', cat: 'robe', type: 'Sur mesure', gradient: 'linear-gradient(135deg,#1a1a1a,#444)' },
  { id: 3, nom: 'Costume Slim', par: 'Atelier Moussa', prix: '55 000', cat: 'costume', type: 'Sur mesure', gradient: 'linear-gradient(135deg,#333,#111)' },
  { id: 4, nom: 'Ensemble Enfant', par: 'Maison Adama', prix: '18 000', cat: 'enfant', type: 'Prêt-à-porter', gradient: 'linear-gradient(135deg,#6F635E,#2A2A2A)' },
  { id: 5, nom: 'Boubou Royal', par: 'Studio Fatou', prix: '45 000', cat: 'boubou', type: 'Sur mesure', gradient: 'linear-gradient(135deg,#D00B0B,#1a1a1a)' },
  { id: 6, nom: 'Robe Cocktail', par: 'Maison Zinsou', prix: '40 000', cat: 'robe', type: 'Sur mesure', gradient: 'linear-gradient(135deg,#444,#D00B0B)' },
  { id: 7, nom: 'Complet Wax', par: 'Atelier Jaures', prix: '32 000', cat: 'costume', type: 'Sur mesure', gradient: 'linear-gradient(135deg,#222,#555)' },
  { id: 8, nom: 'Robe Écolière', par: 'Maison Adama', prix: '10 000', cat: 'enfant', type: 'Prêt-à-porter', gradient: 'linear-gradient(135deg,#7a0606,#D00B0B)' },
]

export const demoReviews = [
  { nom: 'Rachida A.', date: '15 mai 2026', note: 5, texte: 'Excellent travail, finitions impeccables. Je recommande vivement !' },
  { nom: 'Kofi M.', date: '2 mai 2026', note: 5, texte: 'Très professionnel et ponctuel. Tissu de qualité, coupe parfaite.' },
  { nom: 'Aïssatou B.', date: '18 avr. 2026', note: 4, texte: 'Déjà ma 3ᵉ commande et toujours satisfaite. Merci !' },
]

async function safe(path) {
  try {
    const r = await fetch(`${API_BASE_URL}${path}`)
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  }
}

// Clé visiteur anonyme stable (P159/P173) : permet de liker / s'abonner sans compte,
// et de retrouver son état (liked / abonné) au rechargement. Stockée en localStorage.
export function getVisitorKey() {
  try {
    let k = localStorage.getItem('gx_visitor_key')
    if (!k) {
      k = (crypto?.randomUUID?.() || `v-${Date.now()}-${Math.random().toString(36).slice(2)}`).slice(0, 64)
      localStorage.setItem('gx_visitor_key', k)
    }
    return k
  } catch {
    return 'anon'
  }
}

async function postJson(path, body) {
  try {
    const r = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  }
}

// P159-160 : like/unlike public d'une création → { liked, likes }.
export function toggleLike(vetementId) {
  return postJson(`/vitrine/creations/${vetementId}/like`, { visitor_key: getVisitorKey() })
}

// P173 : s'abonner / se désabonner d'un créateur → { abonne, abonnes }.
export function toggleAbonnement(atelierId) {
  return postJson(`/vitrine/createurs/${atelierId}/abonnement`, { visitor_key: getVisitorKey() })
}

// P161-162 : achat d'un patron → { code_transaction, checkout_url } (redirection paiement).
export function acheterPatron(patronId, buyer) {
  return postJson(`/vitrine/patrons/${patronId}/acheter`, buyer)
}

// P162-163 : statut d'un achat par code de transaction (récupération).
export function getAchatStatut(code) {
  return safe(`/vitrine/patrons/achats/${encodeURIComponent(code)}`)
}

export async function getSuivi(reference) {
  return safe(`/vitrine/suivi/${encodeURIComponent(reference)}`)
}

// P204 : partenaires (liste par catégorie + catégories du formulaire).
export async function getPartenaires() {
  return safe('/vitrine/partenaires')
}

// P204 : partenaires « clés » pour le bandeau d'accueil.
export async function getPartenairesCles() {
  return safe('/vitrine/partenaires/cles')
}

// P204 : dépôt d'une candidature de partenariat. Retourne { ok, message }.
export async function candidaterPartenaire(payload) {
  try {
    const r = await fetch(`${API_BASE_URL}/vitrine/partenaires/candidature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await r.json().catch(() => ({}))
    return { ok: r.ok, message: data?.message }
  } catch {
    return { ok: false }
  }
}

export async function getBanniere() {
  return safe('/vitrine/banniere')
}

export async function getPlans() {
  return safe('/vitrine/plans')
}

export async function getSponsorisation() {
  const d = await safe('/vitrine/sponsorisation')
  return d ?? { actif: false, offres: [] }
}

export async function getCreators() {
  const d = await safe('/vitrine/createurs')
  return Array.isArray(d) && d.length ? d : demoCreators
}

export async function getCreations() {
  // Reco v1 (brief 16/07 pt 4) : si un client vitrine est connecté, on envoie son jeton →
  // le serveur remonte ses designers favoris en tête de galerie. Anonyme = inchangé.
  let d = null
  try {
    const token = localStorage.getItem('gx_client_token')
    const r = await fetch(`${API_BASE_URL}/vitrine/creations`, {
      headers: token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' },
    })
    d = r.ok ? await r.json() : null
  } catch { d = null }
  if (!Array.isArray(d) || !d.length) return demoModels
  return d.map((m) => ({
    id:          m.id,
    nom:         m.titre       ?? m.nom       ?? '',
    par:         m.atelier_nom ?? m.creator_nom ?? m.par ?? '',
    atelier_id:  m.atelier_id  ?? m.atelier_slug ?? m.createur_id ?? null,
    prix:        m.prix        ?? m.price      ?? null,
    cat:         m.categorie   ?? m.cat        ?? 'robe',
    type:        m.type        ?? (m.sur_mesure ? 'Sur mesure' : 'Prêt-à-porter'),
    gradient:    m.gradient    ?? m.atelier_gradient ?? 'linear-gradient(135deg,#1a1a1a,#444)',
    image_url:   m.image_url   ?? (Array.isArray(m.images_urls) ? m.images_urls[0] : null) ?? null,
  }))
}

export async function getCreator(slug) {
  const d = await safe(`/vitrine/createurs/${slug}?visitor_key=${encodeURIComponent(getVisitorKey())}`)
  if (d && d.id) return d
  const c = demoCreators.find((x) => x.id === slug)
  if (!c) return null
  return {
    ...c,
    creations: demoModels
      .filter((m) => m.par === c.nom)
      .map((m) => ({ id: m.id, nom: m.nom, prix: m.prix, type: m.type, cat: m.cat, gradient: m.gradient, image_url: null })),
  }
}
