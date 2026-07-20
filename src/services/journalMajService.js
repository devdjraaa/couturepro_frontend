import { API_BASE_URL } from '@/constants/config'

/**
 * CLI-1 — Journal des mises à jour (« Quoi de neuf »).
 *
 * Il n'existait qu'une LIGNE de texte dans une variable d'environnement,
 * affichée par la fenêtre de mise à jour puis perdue. Un professionnel qui
 * fermait cette fenêtre ne pouvait plus jamais savoir ce qui avait changé.
 *
 * L'appel est public et volontairement sans jeton : la liste des nouveautés
 * n'a rien de confidentiel, et l'écran doit rester lisible quand la session a
 * expiré — c'est même le moment où l'on cherche à comprendre ce qui a changé.
 */

const CLE_VUE = 'gx_maj_vue'

export const journalMajService = {
  async getAll() {
    try {
      const r = await fetch(`${API_BASE_URL}/app/journal-maj`, { headers: { Accept: 'application/json' } })
      if (!r.ok) return []
      const d = await r.json()

      return Array.isArray(d?.entrees) ? d.entrees : []
    } catch {
      // Hors ligne : pas de journal. Un écran vide vaut mieux qu'une erreur sur
      // une page purement informative.
      return []
    }
  },

  /** Dernière version que cet appareil a déjà consultée. */
  derniereVue() {
    try {
      return localStorage.getItem(CLE_VUE)
    } catch {
      return null
    }
  },

  marquerVue(version) {
    try {
      if (version) localStorage.setItem(CLE_VUE, version)
    } catch {
      // Sans mémoire, la pastille réapparaîtra : dégradation acceptable.
    }
  },

  /**
   * Y a-t-il du nouveau depuis la dernière consultation ?
   *
   * La comparaison porte sur la VERSION la plus récente et non sur un
   * décompte : ajouter une ligne à une version déjà lue ne doit pas rallumer
   * la pastille, sinon la moindre correction de faute de frappe en admin
   * repasse tout le monde en « non lu ».
   */
  aDuNouveau(entrees) {
    const derniere = entrees?.[0]?.version

    return Boolean(derniere) && derniere !== this.derniereVue()
  },
}
