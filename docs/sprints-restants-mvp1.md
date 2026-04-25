# CouturePro — Sprints restants MVP1

> Référence : cahier-des-charges-v1.3.md
> Chaque sprint est autonome et testable avant de passer au suivant.
> Coller chaque sprint dans une conversation Claude Code fraîche.

---

## Fait jusqu'ici (Sprints 1-7 complétés)

- Auth complète (inscription OTP, login, récupération 5 étapes)
- CRUD Clients / Commandes / Vêtements / Mesures par vêtement (libelles dynamiques)
- Dashboard basique (en cours, encaissé, en attente)
- Points fidélité (affichage solde + barre de progression + conversion)
- Notifications in-app (liste, mark-as-read, cloche header)
- Bouton WhatsApp rappel (Client + Commande)
- CommunicationsPage (toggle WhatsApp)
- Panel admin complet (ateliers, plans, tickets, paiements, etc.)
- Mode démo par atelier (activable depuis admin, flag `is_demo` via `mockFlag.js`)
- Durée d'essai configurable depuis admin (minutes / heures / jours)

---

## SPRINT 8 — Dashboard 3 indicateurs + Alertes livraisons

> CDC §9.2 + §9.9

### Objectif
Remplacer les stats génériques du dashboard par les 3 indicateurs métier réels + badges d'alerte.

### Frontend

**`DashboardPage.jsx`**
- Remplacer StatsGrid actuel par 3 cards :
  - "En retard" (date_livraison_prevue < aujourd'hui + statut != livre/annule) → fond rouge si > 0
  - "Dans 48h" (date_livraison_prevue dans les 2 prochains jours) → fond orange si > 0
  - "En cours" (statut = en_cours) → neutre
- Quick links : "Voir commandes en retard" → /commandes?filtre=retard | "Voir livraisons 48h" → /commandes?filtre=48h
- RecentCommandes reste en dessous

**`commandeService.js` / `useCommandes.js`**
- `useCommandesEnRetard()` — filtre côté client en mock, `GET /commandes?statut=en_cours&en_retard=1` en réel
- `useCommandesDans48h()` — idem

**`BottomNavigation.jsx` / `Header.jsx`**
- Badge rouge sur l'icône Commandes si `en_retard > 0 || dans48h > 0`

**Mock**
- Ajouter dans `mockCommandes` 1-2 commandes avec `date_livraison_prevue` dans le passé et 1-2 dans les 48h prochaines

### Critères de succès
- Dashboard affiche 3 compteurs corrects
- Badge rouge/orange visible sur l'icône commandes si applicable
- Clic quick link → filtre actif dans CommandesPage

---

## SPRINT 9 — Photo profil client + Photo tissu commande + Note interne

> CDC §9.3 + §9.4 + §12.1

### Objectif
Permettre d'attacher une photo de tissu à chaque commande et une photo/avatar à chaque client. Exposer la note interne dans l'UI commande.

### Frontend — Photo profil client

**Types de profil** : `homme | femme | enfant | mixte` (CDC §9.3)
- Renommer `type_profil` dans le form client si besoin
- Avatars préinstallés : 7 avatars par type (homme, femme, enfant) sous forme d'images SVG/PNG locales dans `public/avatars/`
- Sélecteur d'avatar dans `ClientForm` (galerie de 7 icons cliquables par type)
- Option "Uploader une photo" via `<input type="file" accept="image/*">` → compression auto via `canvas` → stockage en base64 dans localStorage key `client_photo_{id}`
- Anti-doublon : bloquer si Nom+Prénom identiques simultanément dans clientService.create

**Composants**
- `AvatarPicker.jsx` — sélecteur avatar/photo dans ClientForm
- `Avatar.jsx` existant → ajouter support `src` base64 local

### Frontend — Photo tissu commande

- Dans `CommandeDetailPage`, bouton "Ajouter photo du tissu" visible pour tous les niveaux
- `<input type="file" accept="image/*">` → compression canvas → stockage localStorage key `commande_tissu_{id}`
- Affichage miniature sous le bouton si photo présente
- Suppression possible
- Jamais envoyé au backend (local uniquement per CDC §12.1)

### Frontend — Note interne commande

- `CommandeDetailPage` : afficher/éditer `note_interne` dans un bloc séparé (label "Note interne — visible par l'équipe uniquement")
- `CommandeForm.jsx` : ajouter le champ note interne
- Le champ existe déjà dans mockCommandes

### Critères de succès
- Sélection avatar + photo client locale : s'affiche dans ClientCard et ClientDetail
- Photo tissu commande : s'attache, s'affiche, se supprime
- Note interne visible et éditable dans CommandeDetail

---

## SPRINT 10 — Export PDF mesures (jsPDF) + 20 templates vêtements

> CDC §9.7 + §9.5 + Annexe B

### Objectif
Export fiche mesures client en PDF local partageable via WhatsApp. Compléter les templates vêtements à 20.

### Frontend — Export PDF mesures

**Dépendance à installer**
```bash
yarn add jspdf html2canvas
```

**`pdfService.js`** (nouveau)
- `exportMesuresClient(client, vetements, mesures)` — génère un PDF 100% local
- Contenu : Nom atelier, date export, infos client (nom/prénom/téléphone/type_profil), tableau des mesures par vêtement
- Via `jsPDF` + `html2canvas` sur un composant React monté hors DOM (`createPortal` dans un div caché)

**`ClientDetailPage.jsx`**
- Bouton "Exporter mesures PDF" dans l'onglet Mesures (tous niveaux)
- Au clic : génère le PDF → propose "Télécharger" ou "Partager" (via `navigator.share` si disponible sur mobile)

**`MesurePDFTemplate.jsx`** (nouveau)
- Composant HTML caché qui sert de source à html2canvas
- Design simple : logo, infos client, tableau à 2 colonnes par vêtement

### Frontend — 20 templates vêtements

- Compléter `mockVetements` avec les 20 modèles de l'Annexe B du CDC
- Chaque template avec ses `libelles_mesures` propres
- Chargement automatique à la première connexion (flag `onboarding_vetements_loaded` en localStorage)
- `vetementService.initTemplates()` — vérifie flag, crée les templates si absent

### Critères de succès
- Clic "Exporter" → PDF généré localement en < 3 secondes
- PDF contient toutes les mesures du client par vêtement
- Bouton "Partager" sur mobile ouvre le sélecteur natif (WhatsApp disponible)
- 20 templates disponibles à la création d'un nouveau compte

---

## SPRINT 11 — Abonnement : activation par ID transaction

> CDC §6.1 + §6.2 + §6.4

### Objectif
Permettre au Gérant d'activer son abonnement en saisissant un ID de transaction reçu par email après paiement.

### Frontend

**`AbonnementPage.jsx`** (remplace PlaceholderPage)
- Onglets : "Mon abonnement" | "Activer"
- **Onglet Mon abonnement** :
  - Jours restants (grand chiffre, dégradé selon urgence)
  - Niveau actif
  - Alertes expiration : 7j → info, 3j → warning, 1j → danger (CDC §6.4)
  - Si bonus actif : "Bonus en cours — X jours"
- **Onglet Activer** :
  - Input "Code de transaction"
  - Bouton "Activer les jours"
  - `POST /abonnement/activer` avec `{ transaction_id: string }`
  - Succès : affiche +X jours ajoutés, rafraîchit `refreshAtelier()`
- Niveaux disponibles en lecture seule (tableau des formules CDC §6.3)

**`abonnementService.js`**
- `activer(transactionId)` → `POST /abonnement/activer`
- Mock : retourne `{ jours_ajoutes: 31, nouveau_total: 316, message: 'Abonnement activé.' }`

**Alerte expiration dans AppLayout / Header**
- Si `atelier.abonnement.jours_restants <= 7` → banner discret en haut

### Critères de succès
- Saisie d'un code → +X jours crédités, timer mis à jour
- Alertes visuelles selon les seuils du CDC
- Page accessible uniquement au rôle Gérant (proprietaire)

---

## SPRINT 12 — Communications (3 modules WhatsApp) + Historique + FAQ + Contact

> CDC §9.8 + §9.11 + §9.12

### Objectif
Finaliser les pages placeholder restantes et rendre les rappels WhatsApp configurables par module.

### Frontend — Communications (3 modules)

**`CommunicationsPage.jsx`** (à réécrire — actuellement 1 seul toggle)
- 3 modules indépendants ON/OFF (défaut ON) :
  1. **Confirmation commande** — envoyé à la création
  2. **Rappel livraison J-2** — envoyé 2 jours avant la date prévue
  3. **Commande prête** — envoyé quand statut passe à "livré"
- Chaque toggle sauvegardé dans `parametresService.updateAtelier({ confirmation_on, rappel_j2_on, commande_prete_on })`
- mockAtelier : ajouter ces 3 champs (défaut `true`)

**Intégration avec WhatsApp**
- Dans `CommandeDetailPage` : déclencher le deep-link WhatsApp selon le module actif
  - À la création d'une commande : si `confirmation_on` → proposer le deeplink
  - Quand statut → "livré" : si `commande_prete_on` → proposer le deeplink

### Frontend — Historique (lecture seule, local)

**`HistoriquePage.jsx`** (remplace PlaceholderPage)
- Journal des actions des 8 derniers jours stocké localement en localStorage key `historique_actions`
- Entrées tracées : ajout/modif/suppression client, ajout/modif/suppression commande, export PDF mesures
- Affichage : liste chronologique inverse, icône par type d'action, auteur, date
- `historiqueService.js` (nouveau) — `log(action)`, `getAll()`, purge > 8 jours
- Appeler `historiqueService.log(...)` depuis les hooks useMutation onSuccess des entités clés

### Frontend — FAQ + Contact

**`FaqPage.jsx`** (remplace PlaceholderPage)
- Accordéon de 10 questions fréquentes (hard-codées, pas d'API)
- Questions tirées des fonctionnalités clés (mesures, abonnement, sync, récupération, équipe)

**`ContactPage.jsx`** (remplace PlaceholderPage)
- Liens directs : WhatsApp support, Facebook, YouTube, LinkedIn, Twitter
- Numéro SAV : +229 01 66 55 29 92 (CDC Art. 10 bis)
- Lien `mailto:` vers email support

### Critères de succès
- 3 toggles Communications → deep-link déclenché si activé
- Historique : chaque action CRUD tracée et visible pendant 8 jours
- FAQ accessible offline
- Contact : tous les liens s'ouvrent dans les apps natives

---

## Récapitulatif

| Sprint | Contenu principal                                  | Phase |
|--------|----------------------------------------------------|-------|
| S8     | Dashboard 3 indicateurs + badges alertes livraison | MVP1  |
| S9     | Photo profil client + photo tissu + note interne   | MVP1  |
| S10    | Export PDF mesures (jsPDF) + 20 templates          | MVP1  |
| S11    | AbonnementPage (activation ID transaction)         | MVP1  |
| S12    | Communications 3 modules + Historique + FAQ + Contact | MVP1 |

---

## Ce qui est délibérément hors MVP1 (Phase 2+)

- WatermelonDB / offline-first réel (actuellement : API directe)
- Plugin Capacitor timer natif (SystemClock)
- Module Caisse (suivi financier avancé)
- Multi-ateliers
- Photos VIP Cloudflare R2
- Rapport PDF mensuel multi-ateliers
- Internationalisation anglais
- Rappels SMS automatiques
