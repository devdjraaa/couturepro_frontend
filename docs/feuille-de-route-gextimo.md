# Feuille de route — Gextimo (anciennement CouturePro)

**La plateforme des professionnels de la mode — Artisans & Designers (Afrique francophone)**

> Période couverte : 18 avril 2026 → 12 juin 2026 (~8 semaines de développement)
> Document mis à jour le 12 juin 2026

---

## 1. Vue d'ensemble

Gextimo est pensée comme la plateforme de référence pour deux profils de professionnels de la mode :

- les **Artisans** (couturiers, ateliers de couture) : Gextimo remplace le carnet papier et couvre l'ensemble de leur activité — clients, mesures, commandes, paiements, équipe, abonnement, panel d'administration ;
- les **Designers** (créateurs de collections) : Gextimo doit devenir leur vitrine professionnelle et le pont qui les relie aux ateliers capables de réaliser leurs créations.

Aujourd'hui, **l'espace Artisan est quasi complet** : une version web opérationnelle a été livrée, et la version mobile (Android/iOS) est en cours de mise à niveau. **L'espace Designer reste entièrement à construire** — c'est la prochaine grande étape du produit, avec comme première brique visible du grand public une **vitrine publique réservée aux Designers**, que les Artisans pourront consulter depuis leur espace pour découvrir leur travail.

> Note de cadrage : cette feuille de route se concentre volontairement sur les espaces **Artisan** et **Designer** (les deux comptes professionnels de la plateforme). L'ouverture d'un espace pour le client final (recherche publique, suivi de commande sans connexion, avis, etc.) fera l'objet d'une réflexion et d'une feuille de route dédiées, dans un second temps.

---

## 2. État d'avancement global

| Espace / Volet | État |
|---|---|
| **Espace Artisan** — Application Web | ✅ Quasi complète — utilisable en production |
| **Espace Artisan** — Panel d'administration | ✅ Complet |
| **Espace Artisan** — Application mobile Android/iOS (hors-ligne) | 🟡 Base technique posée — à resynchroniser avec les dernières fonctionnalités web |
| **Espace Designer** | 🔴 Non démarré — prochaine grande étape du produit |
| **Vitrine publique** (Designer, consultable par les Artisans) | 🔴 Non démarré — espace de publication réservé aux Designers |
| Traductions Français / Anglais | ✅ Structure en place — français complet, anglais à finaliser |

---

## 3. Espace Artisan — ce qui a été réalisé

Le projet a démarré par une phase de cadrage (cahier des charges, identité visuelle, spécifications des écrans), suivie d'un développement continu qui a permis de livrer une **version web complète et opérationnelle** de l'espace Artisan, ainsi que d'entamer sa **version mobile (Android/iOS)**.

### Étape 1 — Cadrage du projet
- Cahier des charges fonctionnel et technique, affiné en plusieurs versions
- Identité visuelle et guide de style (couleurs, typographies, composants)
- Spécifications détaillées de chaque écran de l'application
- Choix d'une architecture centralisée (React + Laravel sur serveur dédié), plus simple et plus économique à maintenir que la solution initialement envisagée

### Étape 2 — Authentification et accès
- Connexion et inscription du gérant d'atelier
- Procédure de récupération de mot de passe simplifiée (téléphone → code reçu par e-mail → nouveau mot de passe)
- Connexion de l'équipe (assistants / membres) via un code d'accès individuel
- Espace de connexion séparé pour l'équipe d'administration
- Messages d'erreur clairs (distinction entre problème de connexion internet et identifiants incorrects)

### Étape 3 — Carnet de clients
- Ajout, modification, recherche et archivage des clients
- Import direct des contacts du téléphone (sélection multiple, contrôle anti-doublons)
- Photo de profil (depuis la galerie) ou avatar généré automatiquement
- Catégorisation des clients (VIP, régulier, occasionnel)

### Étape 4 — Mesures et catalogue de vêtements
- Fiches de mesures personnalisées par client
- Export des mesures en PDF et envoi direct par WhatsApp
- Export des mesures au format tableau (CSV)
- Catalogue de 20 modèles de vêtements types (mode ouest-africaine), plus possibilité de créer des modèles personnalisés avec photos

### Étape 5 — Gestion des commandes
- Création de commandes avec statut (en cours, essai, livrée, annulée), date de livraison, niveau d'urgence et photo du tissu
- Commandes à plusieurs articles : plusieurs vêtements dans une même commande, quantités et total calculés automatiquement
- Commandes groupées : plusieurs sous-commandes pour un même client avec récapitulatif consolidé (total, acompte, reste à payer)
- Échéances de livraison : ajout, suivi et marquage comme livré
- Filtres et compteurs par statut sur la liste des commandes

### Étape 6 — Paiements et facturation
- Enregistrement des acomptes et des soldes, plusieurs modes de paiement
- Reçus et relevés de paiement générés en PDF, envoyables par WhatsApp
- Module de facturation complet : factures standards et personnalisées (logo de l'atelier, IFU, RCCM, pied de page), pour les commandes simples comme groupées
- Paramétrage des informations de facturation de l'atelier

### Étape 7 — Abonnements et paiement en ligne
- Période d'essai gratuite de 14 jours
- Plusieurs formules d'abonnement (Starter, Pro, Magnat) déverrouillant progressivement les fonctionnalités
- Paiement en ligne intégré (FedaPay) et activation par code
- Mise en avant des avantages de l'offre supérieure lorsqu'une fonctionnalité est verrouillée

### Étape 8 — Programme de fidélité
- Accumulation automatique de points sur les commandes
- Conversion des points en abonnement bonus
- Niveaux de fidélité (Bronze → Argent → Or → Platine → Diamant) avec barre de progression visuelle

### Étape 9 — Équipe et permissions
- Ajout de membres d'équipe (assistants / membres) avec code d'accès individuel
- Révocation des accès en un clic
- Gestion fine des droits par rôle : ce que chaque membre peut voir, créer, modifier ou supprimer (clients, commandes, mesures, factures...)

### Étape 10 — Multi-ateliers
- Gestion de plusieurs ateliers depuis un même compte
- Sélecteur d'atelier et création de nouveaux ateliers (sous-ateliers)

### Étape 11 — Module Caisse
- Tableau de bord financier : total encaissé, montants en attente, commandes soldées
- Suivi des clients débiteurs (montants restant dus)
- Export du rapport mensuel en PDF

### Étape 12 — Communications automatiques et notifications
- Messages WhatsApp configurables et envoyés automatiquement : confirmation de commande, rappel avant livraison, commande prête
- Centre de notifications interne avec compteur de non-lus
- Réception des notifications push sur mobile

### Étape 13 — Panel d'administration
- Gestion des ateliers, des plans d'abonnement, des transactions et des paiements
- Gestion des tickets de support (pièces jointes, notes internes)
- Liste noire, journal d'audit et notifications globales
- Comptes administrateurs avec rôles différenciés (super admin / admin / support)

### Étape 14 — Traduction et confort d'utilisation
- Système de traduction mis en place (français complet, anglais en préparation)
- Sélecteur de langue disponible partout, y compris dans le panel admin
- Mode sombre / clair
- Listes rafraîchissables par glissement, états de chargement et messages d'écran vide avec actions claires

### Étape 15 — Corrections et finitions (mai - juin 2026)
- Plus de 60 retours d'utilisation analysés et corrigés (formulaires, navigation, affichages, alertes)
- Bouton retour physique Android synchronisé avec la navigation de l'application
- Renforcement des validations de formulaires (limites de caractères, champs obligatoires, etc.)

### Étape 16 — Changement de marque
- Renommage complet de l'application **CouturePro → Gextimo** sur l'ensemble des écrans, traductions et supports

---

## 4. Version mobile de l'espace Artisan (Android / iOS) — chantier en parallèle

Un chantier dédié à l'application mobile native a été engagé en parallèle de la version web :
- Mise en place du projet Android
- Intégration des fonctions natives : appareil photo, notifications, partage, identifiant d'appareil
- Mise en place du fonctionnement **hors connexion internet** (base de données locale + synchronisation différée), avec des sessions longue durée (30 jours pour le gérant, 7 jours pour l'équipe)
- Premiers scripts de génération de l'application Android (APK)

⚠️ **Point d'attention** : ce chantier mobile doit maintenant être **mis à jour** avec toutes les fonctionnalités livrées récemment côté web (Module Caisse, multi-ateliers, facturation PDF, changement de marque Gextimo, traductions) avant d'aller plus loin.

---

## 5. Espace Designer — le prochain grand chantier

L'espace Designer est un **nouveau profil professionnel** sur Gextimo, complémentaire de l'espace Artisan : il permet à un créateur de présenter ses collections et de s'appuyer sur un réseau d'ateliers pour les réaliser.

### Étape 17 — Rôle et inscription Designer
- Introduction d'un nouveau profil **Designer** dans le système, en complément des rôles existants (Propriétaire / Assistant / Membre d'atelier)
- Parcours d'inscription adapté : choix du profil (Artisan ou Designer) dès la création de compte
- Tableau de bord dédié, distinct de celui d'un atelier, avec ses propres menus et statistiques

### Étape 18 — Gestion des collections
- Création et gestion de collections (nom, thème ou saison, description, visuel de couverture)
- Ajout de pièces à une collection, avec fiche technique par pièce (tissus, tailles disponibles, prix indicatif, photos)
- Mise en avant des collections (collection vedette, archivage des collections passées)

### Étape 19 — Mise en relation Designer ↔ Atelier
- Un designer peut associer ses créations à un ou plusieurs ateliers partenaires capables de les réaliser
- Réception et suivi par le designer des demandes de réalisation transmises aux ateliers
- Visibilité croisée : un atelier Gextimo peut afficher les collections de designers qu'il réalise pour lui

### Étape 20 — Statistiques et visibilité du Designer
- Tableau de bord : nombre de vues par collection, pièces les plus demandées, taux de conversion des demandes
- Historique des demandes reçues et de leur statut

---

## 6. Vitrine publique — l'espace de publication des Designers

La vitrine publique est un espace de **publication réservé aux Designers** : une page de présentation professionnelle, accessible sans connexion, où ils mettent en avant leurs collections. Les Artisans n'ont pas leur propre vitrine et ne peuvent rien y publier, mais ils peuvent **consulter** celles des Designers depuis leur espace Gextimo — pour s'inspirer ou repérer un partenaire potentiel.

### Étape 21 — Page vitrine publique automatique (Designers)
- Génération automatique d'une page publique pour chaque Designer (consultable sans compte Gextimo)
- Contenu : présentation, ville, spécialités, photo de couverture, années d'expérience
- Catalogue public des collections, avec photos
- Côté Artisan : un espace "Découvrir les Designers" permet de consulter ces vitrines en lecture uniquement, directement depuis l'application

### Étape 22 — Réputation et avis
- Indicateurs de réputation affichés sur la vitrine d'un Designer : note moyenne, nombre d'avis, ponctualité, nombre de créations en ligne
- Collecte simplifiée d'avis : lien envoyé au client après livraison pour laisser une note, sans création de compte côté client

### Étape 23 — Partage et mise en contact
- URL personnalisée et partageable (réseaux sociaux, carte de visite numérique, code QR)
- Bouton de contact direct par WhatsApp depuis la vitrine, vers le Designer

---

## 7. Autres prochaines étapes — espace Artisan

### Étape 24 — Mise à niveau de la version mobile
Reporter sur l'application mobile l'ensemble des fonctionnalités livrées récemment côté web (Caisse, multi-ateliers, facturation, rebranding, traductions).

### Étape 25 — Finalisation du mode hors-ligne
Fiabiliser la synchronisation des données entre l'application mobile et le serveur, avec un indicateur visuel de l'état de synchronisation pour l'utilisateur.

### Étape 26 — Tests et première application installable
Tests sur appareils Android réels, puis génération des premières versions installables (APK) ; préparation du chantier iOS.

### Étape 27 — Finitions abonnement
Finaliser l'affichage du quota de factures envoyées par WhatsApp selon la formule d'abonnement souscrite.

### Étape 28 — Fonctionnalités complémentaires
- Gestion du stock de tissu / fil (suivi des chutes de matière)
- Rappels par SMS pour les clients ne disposant pas de WhatsApp
- Étude de l'élargissement de la facturation à toutes les formules d'abonnement
- Catalogue d'inspiration visuelle pour les modèles (type « mood board »)

### Étape 29 — Préparation au lancement public
- Finalisation et validation juridique des Conditions Générales d'Utilisation et de la Politique de Confidentialité
- Vérifications de sécurité avant ouverture au public
- Traduction complète de l'application en anglais

---

## 8. En résumé

En l'espace de huit semaines, Gextimo est passé d'un cahier des charges à une plateforme web quasi complète pour l'**espace Artisan**, couvrant l'ensemble du parcours d'un atelier de couture — du client à la facture, en passant par les mesures, les commandes, les paiements, l'abonnement, l'équipe et la gestion multi-ateliers — avec un panel d'administration pleinement opérationnel.

La prochaine grande étape consiste à ouvrir Gextimo aux **Designers**, avec un espace dédié (profil, collections, mise en relation avec les ateliers) et une **vitrine publique réservée aux Designers** — consultable en lecture par les Artisans depuis leur espace —, qui constituera la première brique visible par le grand public. En parallèle, la mise à niveau et la finalisation de la **version mobile hors-ligne** de l'espace Artisan reste une priorité pour une utilisation sur le terrain sans dépendance à une connexion internet permanente.
