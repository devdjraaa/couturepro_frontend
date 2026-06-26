# Feuille de route — Frontend Gextimo

**Tâches du développeur frontend — Vitrine web (React) + écrans Application mobile**

> Mise à jour du 24 juin 2026 — version **à jour** tenant compte de tout ce qui a déjà été
> développé. Découpage aligné sur le Suivi des sprints (9 sprints / 65 tâches).

---

## ⚡ Avancement & cadrage du travail (à lire en premier)

**La vitrine publique et l'espace Designer (« Ma Vitrine ») sont déjà construits ET branchés à
l'API réelle** (pas de mock). Concrètement :

- Tout est **intégré dans le projet `couturepro_frontend`** (pas de projet vitrine séparé). Sur le
  **web**, `/` = la vitrine publique ; l'app reste sous `/app`. Sur **mobile** (Capacitor), rien ne
  change. C'est le flag `IS_NATIVE` (`src/constants/routes.js`) qui décide.
- Les **Sprints 2, 3 et 4 sont faits**, le **Sprint 5 en grande partie**. Les écrans existent et
  consomment de vraies données.

**👉 Le rôle du dev front est désormais surtout :**

1. **Une refonte VISUELLE / UX** de l'existant — le design actuel est volontairement brut
   (fonctionnel mais pas fignolé). C'est le gros du travail.
2. **Finir les quelques points partiels** listés ci-dessous.
3. **Construire les rares écrans manquants** (Sprint 5 partiel, Sprints 6 et 7).

**🚨 Règle absolue : ne rien inventer côté API.** Avant tout appel réseau, **consulter les routes
réellement disponibles** (section « Routes API disponibles » en fin de doc, ou
`couturepro_backend/routes/api.php`). Réutiliser le pattern existant : `src/services/*`,
`src/pages/vitrine/vitrineApi.js`. **Aucun endpoint ne doit être supposé.**

---

## Périmètre

Ce document ne liste **que les tâches frontend** (composants, écrans, formulaires, états UI,
navigation, thème, i18n, intégrations côté client).

**Stack** : React + Tailwind v4 (vitrine web) ; écrans de l'application mobile (app v5).

**Hors périmètre (backend / autres rôles)** : modélisation des données, API et logique métier
(Laravel), génération PDF serveur (`habillerFacture()`, FPDI + TCPDF), intégration paiement serveur,
API de taux de change, workflows de modération / validation manuelle, homologation DGI, CI/CD.
Le front **consomme** ces services, il ne les implémente pas.

---

## 0. Déjà livré côté frontend (espace Artisan — web)

Pour mémoire : l'ensemble de l'**interface web de l'espace Artisan** est livré et opérationnel —
authentification, carnet clients, mesures & catalogue, commandes, paiements & facturation,
abonnements, fidélité, équipe & permissions, multi-ateliers, module Caisse, notifications, panel
d'administration, FR (EN à finaliser), mode sombre/clair, >60 retours UX corrigés. Rebranding
**CouturePro → Gextimo** appliqué partout.

La suite concerne la **phase Designer + vitrine web + mobile Designer**.

---

## Sprint 0 — Fondations frontend — 🟡 En grande partie

**Livré** : charte graphique intégrée aux tokens · design system + composants de base + **thème
clair/sombre** · projet vitrine initialisé (intégré dans `couturepro_frontend`, pas séparé) · états
UI (chargement / vide / erreur) présents sur la vitrine.

**Reste à finir** :
- Intégrer le **HTML du footer définitif** une fois fourni par le client.
- Généraliser les **états UI standard** (loading / vide / erreur / succès) sur tous les écrans.
- Affiner l'**affichage conditionnel par rôle** (`IS_NATIVE` web/mobile déjà en place).

---

## Sprint 1 — Authentification & profils Designer — 🟡 En grande partie

**Livré** : connexion Designer → ouverture de l'espace personnel · **édition de profil complète**
(logo/photo, spécialité, bio, liens réseaux) dans l'écran **« Ma Vitrine »** · inscription = page
`/inscription` « Téléchargez l'application » (décision validée : l'inscription se fait sur l'app) ·
badge **« vérifié »** affiché.

**Reste à finir** :
- Bloc **CGU + confidentialité bloquant** (écran mobile d'inscription).
- Connexion **Artisan** → message « espace réservé à l'application mobile » (colonne `type` existe
  côté backend, logique UI à brancher).
- Affichage des **statuts** suspendu / désactivé.
- Interface d'**upload de pièce / lien** pour la demande de vérification (la validation est côté admin).

---

## Sprint 2 — Vitrine publique : accueil & navigation — ✅ Fait

**Livré** : en-tête (logo, Connexion / Inscription, sélecteurs **thème / devise / langue**) · barre
de **recherche** + message rotatif + **bannière** · **menu principal** · **page d'accueil** (hero +
parcours 3 étapes) · sections galerie / géolocalisation / témoignages (avis réels) / statistiques ·
**footer 4 rubriques** + NovAfrique centré + paramètres cookies · **multilingue FR / EN** ·
**multidevise** (taux du jour via API + mention « prix indicatifs ») · **mode sombre** + bandeau
cookies.

**À peaufiner** :
- **Popup de 1ʳᵉ visite** proposant langue + devise (aujourd'hui : sélecteurs seuls).
- Sections accueil **« collections »** et **« avantages »** dédiées (les collections existent sur le
  profil Designer, pas en section d'accueil).

---

## Sprint 3 — Créations, collections & galerie — ✅ Fait

**Livré** : **CRUD créations** (publier / retirer / modifier + upload d'images) · **quota gratuit
(10 créations)** (message UI + valeur lue depuis le plan d'abonnement) · **CRUD collections** ·
**galerie publique** + catégories · **profil Designer public** · **recherche + filtres** (nom /
spécialité, ville, vérifiés) · **recherche géolocalisée « Près de moi »** (tri par distance + km).

**À peaufiner** :
- **Filtres avancés** complets (type, style, occasion, prix, délai, note, disponibilité).
- **Sélecteur de rayon / carte** pour la géolocalisation.
- Options de **tri** de la galerie.

---

## Sprint 4 — Conversion & relation client — ✅ Fait

**Livré** : **favoris** (bouton + page `/favoris`) · **contact WhatsApp** (opt-in côté créateur) ·
**suivi de commande public** (recherche par n° `GEX-…` + étapes réelles) · **avis clients**
(formulaire de dépôt + bouton de signalement) · tableau de bord **CRM Designer** (visites, contacts,
créations — données **réelles** via `/vitrine-stats`).

**Reste à finir** :
- **Contact par message / appel** (en plus du WhatsApp déjà fait).
- **Formulaire de demande de devis** dédié (aujourd'hui : message WhatsApp pré-rempli).
- Écran de **confirmation de commande + acompte** (hors paiement en ligne).

---

## Sprint 5 — Monétisation & modération — 🟡 En grande partie

**Livré** : **bannières publicitaires** (affichage navbar + éditeur admin) · **différenciation des
niveaux de visibilité** (créateurs sponsorisés remontés + badge ★) · **sponsorisation** (activable
côté admin) · **signalements** (profil / création / avis) + **file de modération admin** ·
**vérification** (bouton admin) · plans config-driven + **éditeur de plans flexible** (l'admin édite
prix / limites / n'importe quelle clé sans code).

**Reste à construire** :
- **Page publique de souscription Premium** (offres mensuel/annuel, comparatif, parcours côté UI).
- Interface d'**achat de mise en avant sponsorisée** en self-service par le designer (7 / 15 / 30 j).
- Affichage public des **statuts de modération** (bloqué / en litige). *(La logique de blocage
  automatique et les litiges sont côté backend / module Support.)*

---

## Sprint 6 — Facturation & documents (UI Designer) — ⬜ À construire

> Le gros (PDF, overlay DGI, FPDI + TCPDF) est **backend**. *NB : la facturation de l'espace Artisan
> est déjà livrée — ici c'est le volet Designer.* Côté front :

- Formulaires **devis / facture / reçu** (saisie, totaux, mode de paiement).
- Affichage des **statuts de facture** (non payée / acompte / soldée / ANNULÉE).
- **Sélecteur de gabarit** (Standard / Personnalisé × sans / avec design).
- **Upload de la facture normalisée DGI** (PDF officiel).
- **Prévisualisation** + bouton d'**envoi WhatsApp**.
- Affichage du **QR / code de traçage** + lien vers la page de vérification.

---

## Sprint 7 — Application mobile : profil Designer (écrans) — ⬜ À construire

> Frontend mobile (app v5). À confirmer si même développeur que la vitrine web.

- **CGU + confidentialité** bloquant à l'inscription · **écrans d'orientation** avant le choix du
  profil · **changement de type de compte** · **écran de bienvenue** + logo pro · **import des
  contacts** (dédoublonnage par numéro) · écrans **fonctions métier** (croquis, fiches techniques,
  mesures, patrons, moodboards — itératif) · **suivi commandes/projets**, **export PDF**, **partage
  WhatsApp/Instagram**, **offline**, **bibliothèque**.

---

## Sprint 8 — Finitions, QA & lancement (front) — 🟡 Partiel

- Parcours d'**onboarding** fluide · optimisation **partage social** (Open Graph) et **SEO** (limité
  pour une SPA — à traiter) · **performances / fluidité** · **tests end-to-end** · **recette
  client** · **documentation** front.

---

## Routes API disponibles (⚠️ ne rien inventer)

Source de vérité : `couturepro_backend/routes/api.php` et `routes/admin.php`.

### Publiques — `/api/vitrine/*` (sans authentification)
- `GET createurs` — liste des créateurs (les comptes « Free » non visibles dans la galerie sont exclus)
- `GET createurs/{atelier}` — profil + `creations`, `collections`, `avis`, `reseaux`, `whatsapp`,
  `sponsorise`, `logo_url`, `note`, `avis` (compteur)
- `POST createurs/{atelier}/avis` — déposer un avis `{ auteur_nom, note, texte }`
- `POST createurs/{atelier}/evenement` — tracking `{ type: 'visite' | 'contact' }`
- `POST avis/{avis}/signaler` — signaler un avis
- `POST signaler` — signaler `{ type: 'profil'|'creation'|'avis', cible_id, motif? }`
- `GET suivi/{reference}` — suivi public d'une commande (modèle, atelier, étape, statut)
- `GET banniere` — bannière publicitaire active

### Designer connecté (Sanctum — `Authorization: Bearer …`)
- `GET auth/me` — propriétaire + atelier complet (`logo_url`, `specialite`, `bio`, `instagram`,
  `facebook`, `site_web`, `contact_public`, `sponsorise`, `type`, `verifie`, `latitude`, `longitude`)
- `GET dashboard` — stats de l'atelier · `GET vitrine-stats` — visites + contacts (total / ce mois)
- `GET vetements` · `POST vetements` · `PUT/POST vetements/{id}` · `DELETE vetements/{id}`
- `POST vetements/{id}/publication` `{ publie }` · `POST vetements/{id}/collection` `{ collection_id }`
- `GET/POST collections` · `PUT/DELETE collections/{id}`
- `GET avis` (les miens) · `POST avis/{id}/moderation` `{ statut: 'valide'|'rejete' }`
- `PUT parametres/atelier` `{ nom, adresse, ville, contact_public, specialite, bio, instagram,
  facebook, site_web, latitude, longitude }` · `POST parametres/atelier/logo` (multipart)
- `POST commandes/{id}/etape` `{ etape }` — avancer l'étape de suivi
- `GET abonnement/plans` · `GET abonnement/current` · `POST abonnement/activer-code`

### Admin — `/api/admin/*`
- `POST ateliers/{id}/verifier` · `POST ateliers/{id}/sponsoriser` `{ jours }`
- `GET/POST plans` · `PUT plans/{id}` · `POST plans/{id}/toggle` (config = tableau libre)
- `GET signalements` · `POST signalements/{id}/traiter`
- `GET/PUT vitrine/banniere` `{ actif, texte, lien }`

---

## Données mockées

Le front peut avancer sur les écrans non branchés avec des données mockées (toggle `VITE_USE_MOCKS`
+ repli démo dans `vitrineApi.js`), puis brancher l'API au fur et à mesure — **en s'appuyant sur les
routes ci-dessus**, jamais sur des endpoints supposés.

---

## Livrables bloquants qui impactent le front

- ~~**Charte graphique**~~ → ✅ reçue et intégrée
- **HTML du footer définitif** → un footer 4 rubriques est en place en attendant le HTML officiel
- **Confirmation URL / wordmark** du pied de facture → impacte la prévisualisation facture (Sprint 6)
