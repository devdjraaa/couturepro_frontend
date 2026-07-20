# Roadmap Frontend — Vitrine Gextimo & NovAfriq

> Dernière mise à jour : 2026-07-10
> Périmètre : tâches 100 % frontend, classées en sprints d'une semaine.
> Bugs = bloquants, priorisés en tête de sprint.

---

## Sprint 1 — Corrections rapides (Jours 1–2)

> Objectif : éliminer les bugs visibles sans nouvelle UI à construire.

---

### 🌐 Vitrine Gextimo

#### P125 — Retirer le point après « gextimo » sur l'accueil
- **Fichier** : `src/pages/vitrine/VitrineChrome.jsx` → composant `VitrineLogo`
- **Étape 1** : Localiser le `<span>` qui contient `gextimo<span className="text-primary">.</span>`
- **Étape 2** : Supprimer le `<span className="text-primary">.</span>` (point rouge)
- **Étape 3** : Vérifier dans la navbar et dans le footer (le composant est réutilisé aux deux endroits)
- **Critère de validation** : le mot « gextimo » apparaît sans point dans la navbar et le footer

#### P133 — Profil créateur s'ouvre au milieu de la page (pas en haut)
- **Fichier** : `src/pages/vitrine/VitrineCreateur.jsx` (ou équivalent)
- **Étape 1** : Ajouter `useEffect(() => { window.scrollTo(0, 0) }, [])` en haut du composant de la page profil
- **Étape 2** : Vérifier que le scroll s'applique aussi quand on navigue d'un profil à l'autre (dépendance sur l'`id` du créateur dans le `useEffect`)
- **Critère de validation** : la page profil s'affiche toujours depuis le haut lors de l'ouverture

---

### 🏠 NovAfriq

#### P191 — Bouton « Se connecter » dépasse l'écran sur mobile
- **Fichier** : composant header / navbar NovAfriq
- **Étape 1** : Inspecter le bouton sur viewport < 375px
- **Étape 2** : Ajouter `overflow-hidden` ou `max-w-full` sur le conteneur parent
- **Étape 3** : Si le bouton est en `position: absolute`, passer à `position: static` sur mobile via media query
- **Critère de validation** : bouton entièrement visible sur iPhone SE (375px) et Galaxy A (360px)

#### P192 — Nouvelle phrase d'accroche de la vitrine
- **Fichier** : fichier de traduction `src/lang/fr.json` + `en.json` → clé `vitrine.hero.title_*` ou équivalent NovAfriq
- **Étape 1** : Identifier la clé i18n de la phrase actuelle
- **Étape 2** : Mettre à jour le texte FR → nouvelle accroche validée par djraa
- **Étape 3** : Mettre à jour la version EN de façon cohérente
- **Critère de validation** : nouvelle accroche visible en FR et EN sans clé manquante

#### P193 — Ajouter la phrase « né en Afrique, pour le monde »
- **Fichier** : même fichier que P192, section hero ou sous-titre
- **Étape 1** : Ajouter une clé `vitrine.hero.tagline` (ou similaire) dans `fr.json` / `en.json`
- **Étape 2** : Intégrer la phrase sous le titre principal dans le JSX
- **Étape 3** : Styler en `text-dim` italic ou petit caps selon la charte
- **Critère de validation** : phrase visible sur desktop et mobile, traduite en EN

#### P187 — Texte d'accueil de la page inscription
- **Fichier** : page inscription NovAfriq (ex. `/inscription`)
- **Étape 1** : Localiser le texte introductif actuel
- **Étape 2** : Remplacer par le texte validé (à fournir par djraa)
- **Étape 3** : Vérifier la version EN
- **Critère de validation** : nouveau texte affiché, aucune clé i18n manquante

---

## Sprint 2 — Composants UI & Layout (Jours 3–5)

> Objectif : construire les éléments d'interface manquants et corriger le responsive.

---

### 🌐 Vitrine Gextimo

#### P178 — Mention « Bientôt / Soon » sur les fonctions non prêtes
- **Fichier** : composants concernés (ex. boutons ou sections désactivés)
- **Étape 1** : Identifier toutes les fonctions non encore disponibles (liste à valider avec djraa)
- **Étape 2** : Créer un petit badge réutilisable `<SoonBadge />` → `text-[10px] font-bold uppercase text-ghost border border-edge rounded-full px-2 py-0.5`
- **Étape 3** : Appliquer le badge sur chaque élément concerné
- **Étape 4** : Ajouter les clés i18n `vitrine.soon` (FR : « Bientôt », EN : « Soon »)
- **Critère de validation** : les sections non prêtes sont clairement marquées et non cliquables

---

### 🏠 NovAfriq

#### P131 — Bouton « S'inscrire » absent sur mobile
- **Fichier** : navbar NovAfriq
- **Étape 1** : Vérifier si le bouton est masqué par une classe `hidden lg:block` sans équivalent mobile
- **Étape 2** : Ajouter le bouton dans le menu burger (drawer mobile) s'il n'y est pas
- **Étape 3** : Tester sur 360px, 375px, 414px
- **Critère de validation** : bouton accessible depuis la navbar sur tout écran mobile

#### P132 — Header / bouton retour sur les pages inscription et connexion
- **Fichier** : pages `/inscription` et `/login` NovAfriq
- **Étape 1** : Ajouter un header minimal (logo + bouton retour `←`) sur ces deux pages
- **Étape 2** : Le bouton retour appelle `navigate(-1)` ou redirige vers `/`
- **Étape 3** : Masquer la navbar principale sur ces pages si elle génère un doublon
- **Critère de validation** : l'utilisateur peut revenir à l'accueil depuis les pages auth sans le bouton système

#### P194 — Logo plus à gauche, bouton connexion plus à droite
- **Fichier** : header / navbar NovAfriq
- **Étape 1** : Vérifier le layout actuel (`flex`, `grid`, ou position)
- **Étape 2** : Passer en `grid grid-cols-[auto_1fr_auto]` ou `flex justify-between`
- **Étape 3** : S'assurer que le logo est en `justify-start` et les boutons en `justify-end`
- **Étape 4** : Tester sur desktop (1280px+) et tablette (768px)
- **Critère de validation** : logo calé à gauche, boutons calés à droite, nav centrée

#### P180 — Barre de contact fine (téléphone + WhatsApp)
- **Fichier** : `VitrineChrome.jsx` NovAfriq ou composant header
- **Étape 1** : Créer un composant `<ContactBar />` — bandeau fin (32–36px) au-dessus de la navbar
- **Étape 2** : Contenu : numéro de téléphone commençant par **01** + lien WhatsApp
- **Étape 3** : Style `data-theme="dark"` fond `bg-inset`, texte `text-xs text-dim`
- **Étape 4** : Masquer sur mobile (`hidden md:flex`) pour ne pas surcharger
- **Étape 5** : Ajouter les clés i18n pour le numéro et le texte WhatsApp
- **Critère de validation** : barre visible sur desktop, cachée sur mobile, numéro correct

---

## Sprint 3 — Navigation & Menus (Jours 6–7)

> Objectif : compléter la navigation NovAfriq avec les menus déroulants manquants.

---

### 🏠 NovAfriq

#### P181 — Menu déroulant « Solutions »
- **Fichier** : navbar NovAfriq
- **Étape 1** : Créer un composant `<NavDropdown label="Solutions" items={[...]} />`
- **Étape 2** : Items du menu (à valider avec djraa) — ex. Vitrine créateurs, Gestion atelier, Facturation
- **Étape 3** : Comportement : survol desktop → dropdown, clic mobile → accordion dans le burger
- **Étape 4** : Fermeture au clic extérieur (`useRef` + `mousedown` listener)
- **Étape 5** : Ajouter les clés i18n pour chaque item
- **Critère de validation** : menu s'ouvre / se ferme proprement sur desktop et mobile

#### P182 — Menu déroulant « Tarifs »
- **Fichier** : navbar NovAfriq (réutiliser `<NavDropdown />` créé en P181)
- **Étape 1** : Items — ex. Gratuit, Standard, Premium, Magnat (avec prix indicatifs)
- **Étape 2** : Chaque item pointe vers `/premium#plan-x`
- **Étape 3** : Mettre en évidence le plan recommandé (badge « Populaire »)
- **Étape 4** : Ajouter les clés i18n
- **Critère de validation** : menu fonctionnel, liens ancrés corrects

#### P183 — Menu « Documentation » (cartes + page)
- **Fichier** : navbar NovAfriq + nouvelle page `/documentation`
- **Étape 1** : Ajouter l'entrée « Documentation » dans la navbar (lien simple ou dropdown)
- **Étape 2** : Créer la page `/documentation` avec une grille de cartes (ex. Guide démarrage, FAQ, API, Tutoriels)
- **Étape 3** : Chaque carte → icône + titre + courte description + lien
- **Étape 4** : Responsive : 1 colonne mobile, 2 tablette, 3–4 desktop
- **Étape 5** : Ajouter les clés i18n (titres + descriptions des cartes)
- **Critère de validation** : page accessible depuis la navbar, cartes affichées proprement sur tous les écrans

---

## Récapitulatif

| Sprint | Durée | Tâches | Priorité |
|--------|-------|--------|----------|
| Sprint 1 | Jours 1–2 | P125, P133, P191, P192, P193, P187 | 🔴 Bugs + contenu rapide |
| Sprint 2 | Jours 3–5 | P178, P131, P132, P194, P180 | 🟠 UI & responsive |
| Sprint 3 | Jours 6–7 | P181, P182, P183 | 🟡 Navigation & menus |

**Total : 14 tâches — 1 semaine.**

---

> ⚠️ Toutes les nouvelles chaînes de texte passent par `t()` (react-i18next).
> ⚠️ Aucune couleur Tailwind brute — uniquement les tokens sémantiques (`bg-card`, `text-ink`, `text-dim`, `text-ghost`, `border-edge`, `bg-primary`, `text-inverse`…).
> ⚠️ Valider le contenu textuel (accroches, menus, numéros) avec djraa avant intégration.
