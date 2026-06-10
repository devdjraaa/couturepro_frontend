# Feuille de route — Gextimo (anciennement CouturePro)

**Application de gestion pour ateliers de couture — Afrique francophone**

> Période couverte : 18 avril 2026 → 10 juin 2026 (~8 semaines de développement)
> Document mis à jour le 10 juin 2026

---

## 1. Vue d'ensemble

Gextimo est une application pensée pour remplacer le carnet papier des couturiers et ateliers de couture : gestion des clients, des mesures, des commandes, des paiements et de l'équipe, le tout intégré à un système d'abonnement et piloté depuis un panel d'administration centralisé.

Le projet a démarré par une phase de cadrage (cahier des charges, identité visuelle, spécifications des écrans), suivie d'un développement continu qui a permis de livrer une **version web complète et opérationnelle**, ainsi que d'entamer la **version mobile (Android/iOS)**.

---

## 2. État d'avancement global

| Volet | État |
|---|---|
| Application Web (en ligne) | ✅ Quasi complète — utilisable en production |
| Panel d'administration | ✅ Complet |
| Application mobile Android/iOS (mode hors-ligne) | 🟡 Base technique posée — à resynchroniser avec les dernières fonctionnalités web |
| Traductions Français / Anglais | ✅ Structure en place — français complet, anglais à finaliser |

---

## 3. Ce qui a été réalisé

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

## 4. Version mobile (Android / iOS) — chantier en parallèle

Un chantier dédié à l'application mobile native a été engagé en parallèle de la version web :
- Mise en place du projet Android
- Intégration des fonctions natives : appareil photo, notifications, partage, identifiant d'appareil
- Mise en place du fonctionnement **hors connexion internet** (base de données locale + synchronisation différée), avec des sessions longue durée (30 jours pour le gérant, 7 jours pour l'équipe)
- Premiers scripts de génération de l'application Android (APK)

⚠️ **Point d'attention** : ce chantier mobile doit maintenant être **mis à jour** avec toutes les fonctionnalités livrées récemment côté web (Module Caisse, multi-ateliers, facturation PDF, changement de marque Gextimo, traductions) avant d'aller plus loin.

---

## 5. Prochaines étapes

### Étape 17 — Mise à niveau de la version mobile
Reporter sur l'application mobile l'ensemble des fonctionnalités livrées récemment côté web (Caisse, multi-ateliers, facturation, rebranding, traductions).

### Étape 18 — Finalisation du mode hors-ligne
Fiabiliser la synchronisation des données entre l'application mobile et le serveur, avec un indicateur visuel de l'état de synchronisation pour l'utilisateur.

### Étape 19 — Tests et première application installable
Tests sur appareils Android réels, puis génération des premières versions installables (APK) ; préparation du chantier iOS.

### Étape 20 — Finitions abonnement
Finaliser l'affichage du quota de factures envoyées par WhatsApp selon la formule d'abonnement souscrite.

### Étape 21 — Fonctionnalités complémentaires
- Gestion du stock de tissu / fil (suivi des chutes de matière)
- Rappels par SMS pour les clients ne disposant pas de WhatsApp
- Étude de l'élargissement de la facturation à toutes les formules d'abonnement
- Catalogue d'inspiration visuelle pour les modèles (type « mood board »)

### Étape 22 — Préparation au lancement public
- Finalisation et validation juridique des Conditions Générales d'Utilisation et de la Politique de Confidentialité
- Vérifications de sécurité avant ouverture au public
- Traduction complète de l'application en anglais

---

## 6. En résumé

En l'espace de huit semaines, Gextimo est passé d'un cahier des charges à une plateforme web quasi complète, couvrant l'ensemble du parcours d'un atelier de couture — du client à la facture, en passant par les mesures, les commandes, les paiements, l'abonnement, l'équipe et la gestion multi-ateliers — avec un panel d'administration pleinement opérationnel.

La priorité immédiate est désormais de **mettre à niveau et finaliser la version mobile hors-ligne**, condition clé pour une utilisation sur le terrain sans dépendance à une connexion internet permanente.
