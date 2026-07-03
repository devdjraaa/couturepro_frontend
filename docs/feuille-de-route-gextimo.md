# Feuille de route — Gextimo

**La plateforme des professionnels de la mode — Artisans & Designers (Afrique francophone)**

> Document mis à jour le 3 juillet 2026
> Cette feuille de route décrit **ce sur quoi nous travaillons actuellement** et **ce qui reste à
> faire**. Les grands chantiers déjà livrés (espace Artisan web + admin, espace Designer, vitrine
> publique) sont résumés en tête pour mémoire, puis le document se concentre sur la suite.

---

## 1. Où en est le produit (résumé)

| Volet | État |
|---|---|
| **Espace Artisan — Web** (clients, mesures, commandes, paiements, facturation, caisse, équipe, multi-ateliers, fidélité, abonnement) | ✅ Livré, opérationnel |
| **Panel d'administration** (ateliers, plans, transactions, support, modération, audit) | ✅ Livré |
| **Espace Designer** (« Ma Vitrine », créations, collections, profil public, outils créatifs) | ✅ Construit et **branché à l'API réelle** |
| **Vitrine publique** (createurs, recherche, géoloc, avis, suivi de commande, multilingue/multidevise) | ✅ Construite et branchée |
| **Application mobile (Android)** | 🟡 **En test sur téléphone réel + finitions UX** ← *sprint en cours* |
| **Application iOS** | ⬜ Non démarrée (nécessite un Mac/Xcode — plus tard) |
| Traductions FR / EN | ✅ FR complet · 🟡 EN à finaliser |

> En clair : la **plateforme web** (Artisan + Admin) et l'**espace Designer + vitrine** sont faits.
> Le chantier du moment est de **fiabiliser et polir l'application mobile Android** sur de vrais
> appareils, avant élargissement.

---

## 2. Sprint en cours — Finition & fiabilisation de l'app mobile Android

Objectif : une application mobile **propre, cohérente et testée sur un vrai téléphone**, prête à être
distribuée aux premiers utilisateurs.

### 2.1 Fait dans ce sprint ✅
- [x] **Tests sur appareil réel** (téléphone Android physique en USB) avec rechargement instantané
      du code (live reload) — remplace l'émulateur.
- [x] **Affichage plein écran corrigé** : la barre d'état (heure/batterie) ne masque plus l'en-tête,
      plus d'espace vide en haut (gestion « edge-to-edge » + zones de sécurité).
- [x] **Import des contacts du téléphone réparé** : autorisations manquantes ajoutées, import par
      lots (gros carnets de plusieurs centaines de contacts), gestion des contacts sans nom.
- [x] **Bouton d'action flottant** (menu « + » en bas à droite) : accès direct à *Nouveau client* et
      *Importer des contacts*, désormais bien visibles.
- [x] **Abonnement visible sur l'accueil** : rappel discret du forfait et des jours d'essai restants,
      d'un simple coup d'œil.
- [x] **Bouton de synchronisation** (en ligne / hors-ligne) de retour sur le tableau de bord.
- [x] **Notifications à l'image de Gextimo** : logo et couleur de la marque dans la barre de notifs.
- [x] **Langues limitées au Français et à l'Anglais** (les langues non finalisées sont masquées).
- [x] **Correctifs serveur bloquants** : plusieurs erreurs empêchaient la connexion et la création de
      commandes/clients — corrigées et déployées.

### 2.2 En cours 🔧
- [ ] **Deux applications distinctes** :
  - **Gextimo** (app des Artisans / Stylistes / Designers) → destinée au grand public / Play Store ;
  - **Gextimo Admin** (console interne réservée à l'équipe, quelques comptes) → non publiée.
  *Aujourd'hui une seule app mélange les deux identités : on les sépare proprement.*
- [ ] **Numéro de téléphone unifié** : enregistrer et rechercher le numéro sous une seule forme
      normalisée, pour éviter tout échec de connexion dû à un espace ou un format différent.
- [ ] **Zones de sécurité (dernières versions Android)** : intégrer le composant dédié pour un
      affichage parfait sur les téléphones les plus récents (Android 15+).

### 2.3 Reste à finir dans ce sprint ⏳
- [ ] Généraliser le nouveau bouton flottant et les états d'écran vide sur les autres listes.
- [ ] Passe de finition visuelle des barres d'onglets (Paramètres, Outils créatifs) sur petits écrans.
- [ ] Finaliser la traduction anglaise.

---

## 3. Notifications — stratégie retenue

- **Notifications locales** (rappels, confirmations d'action) : ✅ en place et à l'image de Gextimo.
- **Notifications push** (recevoir une alerte **application fermée**) : **reportées**. Elles
  nécessiteraient un service tiers (Firebase). Pour l'instant on s'appuie sur les notifications
  locales + une actualisation à l'ouverture de l'app. Le push « app fermée » sera étudié plus tard,
  si le besoin se confirme.

---

## 4. Prochaines grandes étapes (après ce sprint)

### 4.1 Espace Designer & vitrine — finitions
Le socle est construit et branché. Restent des finitions ciblées : page publique d'abonnement
Premium, achat de mise en avant en self-service, filtres avancés de la galerie, formulaire de devis
dédié, et une passe générale de **refonte visuelle** (le design actuel est fonctionnel mais brut).

### 4.2 Mode hors-ligne mobile
Fiabiliser la synchronisation données ↔ serveur avec indicateur d'état, sessions longue durée
(30 j gérant / 7 j équipe).

### 4.3 Distribution
Générer les versions installables des **deux** apps, puis préparer la publication de **Gextimo** sur
le Play Store. **iOS** : à ouvrir plus tard (nécessite un environnement Mac/Xcode).

### 4.4 Compléments produit
Facturation Designer (devis/facture/reçu + DGI), gestion du stock tissu/fil, rappels SMS (clients
sans WhatsApp), catalogue d'inspiration (« mood board »).

### 4.5 Préparation au lancement public
CGU + politique de confidentialité validées, vérifications de sécurité, traduction EN complète.

---

## 5. En résumé

La plateforme **web** (Artisan + Admin) et l'**espace Designer + vitrine publique** sont construits et
fonctionnels. Le travail du moment porte sur la **fiabilisation et la finition de l'application mobile
Android**, testée directement sur un vrai téléphone : affichage plein écran, import de contacts,
visibilité de l'abonnement, notifications à la marque, et la **séparation en deux applications**
(Gextimo pour les professionnels, Gextimo Admin en interne). Viennent ensuite la finalisation du
hors-ligne, la distribution (Play Store), puis l'ouverture iOS.
