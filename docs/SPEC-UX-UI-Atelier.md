# 📐 Spécification UX/UI — App de Gestion d'Atelier de Couture

> **Document destiné à Claude Code**
> Refonte UX/UI complète d'une application mobile de gestion pour ateliers de couture (Afrique de l'Ouest, devise XOF).
> Objectif : transformer une app fonctionnelle mais générique en une expérience **fluide, métier, et émotionnellement engageante**.

---

## 0. Contexte & Diagnostic

### 0.1 Ce qui existe (état actuel)
L'app actuelle propose 5 onglets : **Accueil, Clients, Commandes, Catalogue, Réglages**.
Structure correcte, mais souffre de plusieurs problèmes UX critiques :

| Problème observé | Impact utilisateur |
|---|---|
| Hero bleu massif qui mange 30% de l'écran sans densité d'info | Perte d'espace utile |
| 4 cartes stats toutes à zéro, sans contexte ni call-to-action | Écran mort pour un nouvel utilisateur |
| Bouton FAB `+` non contextuel (même icône partout) | Action ambiguë |
| États vides génériques ("Aucune commande") sans onboarding | Le tailleur ne sait pas par où commencer |
| Pas de hiérarchie entre actions principales et secondaires | Charge cognitive élevée |
| Navigation par onglets uniquement (pas de recherche globale, pas de raccourcis) | Friction quotidienne |
| Pas de notion de **mesures**, **délais**, **essayages**, **acomptes** — pourtant cœur du métier | L'app est un CRM générique, pas un outil d'atelier |

### 0.2 Persona cible
**Le tailleur·euse / patron·ne d'atelier**
- Gère 20 à 200 clients actifs
- 5 à 30 commandes simultanées avec délais serrés (mariages, fêtes)
- Travaille au téléphone, souvent debout, en atelier bruyant
- Note encore beaucoup sur papier — l'app doit être **plus rapide que le carnet**
- Reçoit acomptes en espèces / Mobile Money (MTN, Moov, Wave)
- Communique majoritairement via **WhatsApp**

### 0.3 Principes directeurs de la refonte
1. **Métier d'abord** : chaque écran sert un geste réel d'atelier (prendre mesures, fixer délai, encaisser acompte, rappeler client).
2. **Trois tap maximum** pour les 5 actions les plus fréquentes.
3. **Densité intelligente** : un coup d'œil suffit pour savoir « qu'est-ce qui presse aujourd'hui ».
4. **Onboarding actif** : tant que le compte est vide, chaque écran guide vers la prochaine action utile.
5. **Voix locale** : copy en français clair, ton chaleureux, sans jargon SaaS.

---

## 1. Système de Design

### 1.1 Palette
Remplacer le violet saturé unique par un système plus respirant.

```
--bg-primary:     #FAF8F5   /* crème, fond principal */
--bg-surface:     #FFFFFF   /* cartes */
--bg-elevated:    #F4F1EC   /* zones secondaires */

--ink-900:        #1A1A1F   /* titres */
--ink-700:        #3D3D45   /* corps */
--ink-500:        #6B6B75   /* meta */
--ink-300:        #B8B8C0   /* placeholders */

--brand-700:      #2D1B6B   /* indigo profond — header, branding */
--brand-500:      #5546E8   /* CTA principal */
--brand-100:      #ECEAFE   /* fonds de bouton secondaire */

--accent-gold:    #C8941F   /* statut "à recouvrer", premium */
--accent-success: #1F7A4D   /* livré, payé */
--accent-warn:    #C8541F   /* retard, urgent */
--accent-info:    #1F6BC8   /* en cours */
```

### 1.2 Typographie
- **Display / titres** : `Instrument Serif` ou `Fraktion Sans` — quelque chose qui évoque l'artisanat
- **Corps / UI** : `Inter` (taille 15px base mobile, jamais < 13px)
- **Chiffres / montants** : `Geist Mono` ou `JetBrains Mono` (tabulaires, alignement parfait pour les XOF)
- Échelle : 13 / 15 / 17 / 20 / 28 / 40

### 1.3 Espacement & Rayons
- Grille de 4px : 4, 8, 12, 16, 20, 24, 32, 48
- Cartes : `border-radius: 20px` (généreux, doux)
- Boutons : `border-radius: 14px`
- Tags / pills : `border-radius: 999px`

### 1.4 Composants atomiques à créer
- `<MoneyAmount value currency size />` — format XOF avec séparateur d'espace fine, devise en small caps
- `<StatusPill kind="enCours|livré|retard|annulé|brouillon" />`
- `<ClientAvatar name color />` — initiales sur fond pastel auto-généré depuis le nom
- `<EmptyState illustration title body primaryAction secondaryAction />`
- `<MeasureChip label value unit />` — pour afficher les mesures (Tour de taille : 78 cm)
- `<CountdownBadge dueDate />` — « J-3 », « En retard », « Aujourd'hui »
- `<QuickActionTile icon label badge onPress />`

---

## 2. Architecture de l'information (revue)

### 2.1 Nouvelle structure de navigation
La bottom bar passe de 5 à **4 onglets** + 1 FAB central contextuel.

```
[ Aujourd'hui ]  [ Commandes ]  ⊕  [ Clients ]  [ Atelier ]
```

- **Aujourd'hui** (ex-Accueil) : agenda du jour, alertes, KPIs
- **Commandes** : pipeline visuel kanban
- **⊕** (FAB central, contextuel) :
  - Sur Aujourd'hui → ouvre la sheet « Que voulez-vous créer ? »
  - Sur Commandes → « + Nouvelle commande »
  - Sur Clients → « + Nouveau client »
  - Sur Atelier (catalogue) → « + Modèle / Mesure type »
- **Clients** : carnet
- **Atelier** : fusion **Catalogue + Réglages + Mes ateliers** dans un menu profil/atelier unifié

Pourquoi ? Réglages a une fréquence d'usage très faible — pas justifié dans la bottom bar. Catalogue + paramètres atelier sont sémantiquement proches.

### 2.2 Header global
- Hauteur réduite (56px au lieu de ~120px)
- Pas de hero bleu plein écran sauf sur l'Accueil
- Élément avatar à gauche (cliquable → drawer compte), titre centré, actions à droite (recherche globale + notifications)
- **Recherche globale** ajoutée (icône loupe) : cherche dans clients, commandes, modèles depuis n'importe quel écran. Indispensable.

---

## 3. Écrans détaillés

### 3.1 Écran Aujourd'hui (refonte de Accueil)

**Objectif** : en un coup d'œil, savoir ce qui doit être fait *aujourd'hui*.

**Structure verticale** :

1. **Salutation contextuelle** (12pt date + 20pt prénom)
   - Pas de bandeau bleu massif. Juste du texte sur fond crème.
   - Sous-titre dynamique : *« 3 essayages prévus, 1 livraison à faire »*

2. **Carte "Caisse du jour"** (la seule carte teintée brand)
   - Solde encaissé aujourd'hui, gros chiffre en mono
   - Mini sparkline 7 jours
   - Lien « Voir le détail → »
   - **Si zéro :** afficher *« Vos premiers acomptes s'afficheront ici »* + bouton « Enregistrer un paiement »

3. **Bloc "À faire aujourd'hui"** (liste verticale, pas de grille)
   - Items triés par urgence avec `CountdownBadge`
   - Ex : `[J-0] Livraison boubou — Adissa Koné — 14:00`
   - Ex : `[J-1] Essayage — M. Dossou — demain 10:00`
   - Ex : `[Retard] Solde restant 15 000 XOF — Mme Adjovi`
   - Tap → ouvre la commande/client correspondant
   - **Si vide :** illustration douce + *« Journée libre. Prenez de l'avance ? »* + bouton « Voir toutes les commandes »

4. **KPIs secondaires** (rangée horizontale scrollable, plus discrète)
   - En attente de paiement : `45 000 XOF` (gold accent)
   - Commandes actives : `7`
   - Livrées ce mois : `12`
   - Nouveaux clients (30j) : `+4`
   - Format : petits chiffres, labels en small caps, pas de cartes lourdes

5. **Actions rapides** (3 tuiles principales seulement)
   - `+ Nouvelle commande`  ·  `+ Client`  ·  `Encaisser acompte`
   - Supprimer la 4e action — moins c'est mieux

**Suppressions par rapport à l'existant** :
- ❌ Hero bleu plein largeur (remplacé par texte simple)
- ❌ 4 cartes vides « 0 » sans contexte
- ❌ FAB violet flottant qui chevauche le contenu (remplacé par FAB central de la nav)

---

### 3.2 Écran Commandes — Vue **Pipeline Kanban horizontal**

C'est le cœur de l'app. Refonte majeure.

**Au lieu d'une liste plate avec des tabs (Toutes / En cours / Livré / Annulé)**, proposer **2 modes de vue** togglables :

#### Mode A — Pipeline (par défaut)
Colonnes horizontales scrollables, façon Trello mobile :
```
[ À démarrer ] → [ Coupe ] → [ Couture ] → [ Essayage ] → [ Prête ] → [ Livrée ]
```
- Chaque colonne montre le nombre + somme à encaisser
- Cartes commandes draggables entre colonnes (long press → drag)
- Carte commande contient :
  - Avatar client + nom (1 ligne)
  - Modèle (ex: « Boubou brodé »)
  - Badge de délai (`J-3` doré, `Retard` rouge)
  - Montant total · acompte versé (mini barre de progression paiement)

#### Mode B — Liste chronologique (toggle)
Triée par date de livraison croissante, groupée par jour : *Aujourd'hui · Demain · Cette semaine · Plus tard*.

**Filtres rapides** (chips horizontales au-dessus) :
`Urgentes`  `Impayées`  `À livrer cette semaine`  `Mes favoris`

**Recherche** : champ persistant en haut, recherche dans nom client + modèle + numéro de commande.

**Empty state amélioré** :
> 🪡 *Votre atelier est calme*
> Créez une commande pour commencer à suivre vos délais, vos paiements et vos essayages.
> [Créer une commande] (CTA) · [Importer depuis WhatsApp] (secondaire)

---

### 3.3 Écran Création de Commande — flow multi-étape

**Avant** : sans doute un long formulaire monolithique.
**Après** : assistant en 4 étapes courtes, avec **progress dots** en haut.

#### Étape 1 — Client
- Sélection rapide depuis carnet (avec recherche)
- Ou *« + Nouveau client »* inline (mini-form 3 champs : nom, téléphone, genre)
- Récents en haut

#### Étape 2 — Modèle & Mesures
- Choix dans le catalogue (cartes visuelles avec photo)
- Ou *« Modèle libre »* (texte + photo)
- Mesures :
  - Si le client a déjà des mesures → propose de les réutiliser, modifiable
  - Sinon → grille de saisie rapide (Poitrine, Taille, Hanches, Épaule, Manche, Longueur…)
  - Champ photo : *« Ajouter un croquis ou photo de référence »* (caméra + galerie)
  - Champ tissu : *« Fourni par le client » | « Fourni par l'atelier »* + note

#### Étape 3 — Délai & Essayages
- Date de livraison (date picker)
- Date d'essayage (optionnel, picker)
- Toggle « Urgent » → mise en évidence dans pipeline
- Note interne (textarea)

#### Étape 4 — Prix & Acompte
- Prix total (numpad XOF, formatage live avec espaces)
- Acompte versé (numpad)
- Mode de paiement : `Espèces` · `Mobile Money` · `Virement` (chips)
- Reste à payer : affiché en doré, calculé en live
- **Toggle « Envoyer reçu WhatsApp au client »** (activé par défaut)

**Bouton final** : `Créer la commande` (full width, brand-500)
Confirmation : toast + sheet *« Commande #042 créée. Voulez-vous envoyer un récap WhatsApp ? »*

---

### 3.4 Écran Détail Commande

Onglets internes : **Aperçu · Mesures · Paiements · Historique**

#### Aperçu
- Hero : photo modèle + nom client + statut pill + countdown
- Boutons d'action rapide horizontaux : `WhatsApp` · `Appeler` · `Modifier statut` · `Encaisser`
- Section Délais (essayage, livraison) avec icônes
- Section Tissu + note
- Bouton secondaire `Imprimer fiche atelier`

#### Mesures
- Grille des mesures sauvegardées (chips éditables)
- Bouton « Mettre à jour les mesures » (le client a changé)

#### Paiements
- Timeline verticale : chaque acompte avec date, montant, mode
- Solde restant en gros, doré si > 0, vert si soldé
- CTA `+ Enregistrer un paiement`

#### Historique
- Journal d'événements : créée, statut changé, paiement reçu, message envoyé

---

### 3.5 Écran Clients

**Liste** :
- Recherche persistante en haut
- Tri : Récents · Alphabétique · Commandes actives
- Item client :
  - Avatar coloré (initiales)
  - Nom + téléphone
  - Meta droite : nombre de commandes actives · solde dû en doré si > 0
- Section « Favoris » en haut (épinglés)
- Index alphabétique flottant à droite (A-Z) si > 30 clients

**Empty state** :
> 👤 *Votre carnet est vide*
> Importez vos contacts en un tap, ou ajoutez votre premier client manuellement.
> [Importer depuis le téléphone] · [Ajouter un client]

**Détail client** :
- En-tête : grand avatar, nom, téléphone (tap → appeler), bouton WhatsApp
- 3 tabs : **Commandes** (historique) · **Mesures** (fiche unique réutilisable) · **Notes**
- Stats client : nombre total commandes, CA généré, fidélité (badge si > 5 commandes)

---

### 3.6 Écran Atelier (fusion Catalogue + Réglages)

Liste verticale de sections rangées comme un menu iOS Settings :

```
[Avatar atelier]
Atelier SAGBOHAN
Cotonou · 3 employés

— MON CATALOGUE —
🪡  Modèles de vêtements          (12)  >
📏  Fiches de mesures types        (5)  >

— MON ATELIER —
🏪  Informations de l'atelier           >
👥  Mes employés                        >
📍  Mes ateliers                   (2)  >

— PARAMÈTRES —
🎨  Apparence & thème                   >
💬  Communications WhatsApp             >
🌐  Langue                       FR    >
💳  Abonnement                  Pro    >
🔒  Sécurité                            >
❓  Support & aide                      >

[ Se déconnecter ]
```

#### Catalogue (sous-écran)
- Grille 2 colonnes de cartes modèles avec photo de référence
- Chaque carte : photo, nom (« Boubou homme »), durée moyenne, prix de base
- Tap → édition du modèle + ses mesures par défaut
- Empty state : *« Créez vos modèles pour les réutiliser à chaque commande »*

---

### 3.7 Écran Notifications

Refonte de l'écran actuel (trop vide) :

**Catégories en chips** : `Toutes` · `Commandes` · `Paiements` · `Rappels`

**Items groupés par jour** :
- Icône colorée selon type
- Titre + corps + horodatage relatif (« il y a 5 min »)
- Items non lus avec point bleu
- Swipe gauche → marquer lu / supprimer

**Types de notifs à supporter** :
- 🔔 Rappel : essayage demain à 10h — M. Dossou
- 💰 Acompte reçu : 15 000 XOF de Mme Adjovi
- ⏰ Retard : commande #038 dépasse la date de livraison
- ✅ Livraison confirmée par WhatsApp
- 📩 Nouveau message client

---

## 4. Micro-interactions & motion

- **Transitions d'écrans** : slide latéral natif iOS/Android (pas de fade)
- **Tap feedback** : scale(0.97) + haptic léger sur tout bouton primaire
- **FAB central** : rotation 45° → croix quand sheet ouverte
- **Skeleton loaders** : pour clients/commandes au chargement (jamais de spinner plein écran)
- **Pull-to-refresh** sur listes : custom avec icône aiguille qui tourne
- **Toast** : slide depuis le bas, auto-dismiss 3s, action « Annuler » sur les opérations destructives
- **Empty states** : illustrations vectorielles douces (aiguille, bobine, mètre ruban) — pas d'emoji 3D, pas de stock photos
- **Drag & drop kanban** : carte se soulève (élévation 12), ombre douce, snap aux colonnes

---

## 5. États vides — règle d'or

Chaque empty state DOIT contenir :
1. Une illustration simple et thématique (couture)
2. Un titre humain (pas « Aucune donnée »)
3. Une phrase qui explique *pourquoi c'est utile* de remplir
4. Un CTA primaire
5. (Optionnel) Un CTA secondaire (importer, exemple)

❌ « Aucune commande en cours »
✅ « Pas encore de commandes. Créez la première pour voir vos délais s'organiser ici. »

---

## 6. Accessibilité & robustesse

- **Cibles tactiles** ≥ 44×44 px
- **Contraste** AA minimum (vérifier la pastille violet sur fond crème)
- **Mode sombre** : prévoir tokens duals dès le départ
- **Hors-ligne** : afficher banner discret en haut + queue d'actions à syncer
- **Tailles de police** respectant les réglages système
- **i18n** : tout texte via i18n FR + préparation EN/Yoruba/Fon

---

## 7. Stack technique recommandée

> À adapter selon l'existant. Si React Native déjà en place, conserver.

- **React Native / Expo** (mobile-first)
- **Navigation** : `expo-router` (file-based) ou React Navigation
- **State** : Zustand ou Jotai (léger)
- **Persistance locale** : WatermelonDB ou MMKV + offline-first
- **Forms** : `react-hook-form` + `zod` pour validation
- **UI** : composants custom (pas de Material/Antd) pour fidélité au design system
- **Animations** : `react-native-reanimated` v3
- **Date** : `date-fns` avec locale `fr`
- **Money** : utilitaire custom XOF (séparateur espace fine)
- **WhatsApp** : `Linking.openURL('whatsapp://send?phone=…&text=…')`

---

## 8. Livrables attendus de Claude Code

1. **Structure de dossiers** propre :
   ```
   /app
     /(tabs)
       index.tsx          # Aujourd'hui
       commandes.tsx
       clients.tsx
       atelier.tsx
     /commande
       [id].tsx
       nouvelle.tsx       # wizard 4 étapes
     /client
       [id].tsx
   /components
     /atoms
     /molecules
     /screens
   /design-system
     tokens.ts
     theme.ts
   /lib
     money.ts
     date.ts
     whatsapp.ts
   /stores
   ```

2. **Design tokens** dans un fichier TypeScript (palette, typographie, espacements, radii, shadows).

3. **Tous les écrans listés ci-dessus** en composants fonctionnels typés.

4. **États vides** illustrés et conformes à la règle d'or (§5).

5. **Wizard nouvelle commande** entièrement implémenté avec validation et persistance progressive (en cas de reload, ne pas perdre les saisies).

6. **Pipeline kanban** avec drag & drop fonctionnel et persistance du statut.

7. **Recherche globale** opérationnelle depuis n'importe quel onglet.

8. **Mode démo** : un bouton dans Paramètres → Support permet d'injecter ~15 clients et ~25 commandes d'exemple, pour tester sans saisir.

9. **README** avec captures de chaque écran, commandes de lancement, structure de données.

---

## 9. Priorisation (sprints)

**Sprint 1 — Fondations**
- Design system (tokens, composants atomiques)
- Navigation 4 onglets + FAB central
- Écran Aujourd'hui complet
- Écran Clients (liste + détail + création)

**Sprint 2 — Cœur métier**
- Wizard nouvelle commande (4 étapes)
- Écran Commandes pipeline + liste
- Écran détail commande (4 tabs)

**Sprint 3 — Atelier & finitions**
- Écran Atelier (fusion catalogue + paramètres)
- Notifications
- Mode démo + onboarding
- Recherche globale
- Mode sombre

---

## 10. Anti-patterns à éviter explicitement

- ❌ Empiler des cartes vides « 0 » sur l'écran d'accueil
- ❌ Mettre 5 onglets dans la bottom bar
- ❌ Un FAB violet flottant qui couvre du contenu utile
- ❌ Hero bleu plein écran sans valeur informationnelle
- ❌ Empty states génériques type « Aucune donnée »
- ❌ Formulaires monolithiques d'une page sans découpage en étapes
- ❌ Tabs au-dessus de listes vides (rien à filtrer)
- ❌ Boutons « Se déconnecter » rouges sang en bas de page (utiliser un rouge plus doux, ou les enfouir dans un sous-menu Sécurité)
- ❌ Iconographie violette uniforme sans hiérarchie visuelle
- ❌ Watermark « Activer Windows » 😅 (penser à un build mobile propre)

---

## 11. Mesures de succès

L'app est réussie si :
- Un tailleur peut **créer une commande complète en < 60 secondes**
- Le tap pour **encaisser un acompte** est accessible en **≤ 2 taps** depuis n'importe où
- L'écran Aujourd'hui répond en < 1 seconde à la question *« Qu'est-ce qui presse ? »*
- 0 écran vide sans CTA clair
- Aucune action destructive sans confirmation/undo

---

*Fin du document. Bonne implémentation.*
