# Gextimo — Plan de sprints (Vitrine web + Mobile)

> Découpage du travail défini dans [REVUE_VITRINE_GEXTIMO.md](REVUE_VITRINE_GEXTIMO.md).
> Version cochable en HTML (locale) : [../public/suivi-sprints.html](../public/suivi-sprints.html).
> **En ligne (après déploiement)** : https://gextimo.novafriq.africa/suivi-sprints.html
> Socle : Web **v5** · App **v5**. Chaque sprint est livrable indépendamment (produit évolutif).

---

## Sprint 0 — Cadrage & fondations
**But :** poser les bases techniques et les livrables bloquants avant tout développement.

- [ ] Obtenir la **charte graphique** (couleur primaire, secondaire, police principale)
- [ ] Obtenir le **HTML du footer définitif** (avec deadline fixée)
- [ ] Mettre en place le **design system** + composants de base (thème clair/sombre)
- [ ] Initialiser le **repo de la vitrine web** + CI/CD
- [ ] Modéliser les **données** (profil créateur, création, collection, commande, devis, facture, reçu)
- [ ] Définir la **matrice rôles & permissions**
- [ ] Définir la **liste des pages & états UI**

## Sprint 1 — Authentification & profils designer
**But :** un designer peut s'inscrire sur le web, se connecter et gérer son profil.

- [ ] Formulaire d'**inscription designer web** (champs obligatoires : nom, email, mdp, ville/pays, spécialité)
- [ ] Acceptation **CGU + politique de confidentialité** (bloquant)
- [ ] **Connexion designer** → ouverture de l'espace personnel
- [ ] **Connexion artisan** → message « espace réservé à l'application mobile »
- [ ] **Édition du profil** designer depuis le web (champs facultatifs : photo, logo, bio, réseaux)
- [ ] **Statuts de profil** (non vérifié / vérifié / suspendu / désactivé)
- [ ] **Vérification** : upload pièce/lien → validation manuelle (5 j. ouvrés) → **badge vérifié**

## Sprint 2 — Vitrine publique : accueil & navigation
**But :** la page publique est en ligne, multilingue, multidevise, avec mode sombre.

- [ ] **En-tête** (logo, Connexion/Inscription, sélecteurs thème/devise/langue)
- [ ] Barre de **recherche** + **message rotatif** + **bannière publicitaire**
- [ ] **Menu principal** (Comment ça marche, Artisans, Collections, Designers, Suivi, Support, Qui sommes-nous)
- [ ] **Page d'accueil** : hero + parcours **3 étapes**
- [ ] Sections accueil : galerie, collections, géoloc, avantages, **témoignages (vraies photos)**, stats discrètes
- [ ] **Footer** (4 rubriques + NovAfrique centré + paramètres cookies)
- [ ] **Multilingue FR/EN**
- [ ] **Multidevise** (API taux quotidien + popup 1ʳᵉ visite + cookies + mention « prix indicatifs »)
- [ ] **Mode sombre** + bandeau cookies

## Sprint 3 — Créations, collections & galerie
**But :** publier des créations, les organiser en collections, les retrouver via la galerie/recherche.

- [ ] **CRUD créations** : publier / mettre en brouillon / **retirer** / modifier
- [ ] Règles minimales de publication + **limite gratuit (10 créations)**
- [ ] **CRUD collections**
- [ ] **Galerie publique** + catégories + tri
- [ ] **Profil designer public** (créations, collections, infos, photos réelles)
- [ ] **Recherche avancée** + filtres (type, style, occasion, ville, prix, délai, note, dispo)
- [ ] **Recherche géolocalisée** (rayon défini)

## Sprint 4 — Conversion & relation client
**But :** transformer la visite en contact, devis puis commande suivie.

- [ ] **Favoris** (enregistrer sans engagement)
- [ ] **Contact direct** (message / appel / WhatsApp)
- [ ] **Demande de devis** (description, budget, délai)
- [ ] **Confirmation de commande** + acompte (hors paiement en ligne au lancement)
- [ ] **Suivi de commande** (page dédiée + recherche par n°)
- [ ] **Avis clients** (soumission conditionnée + validation 48h + signalement)
- [ ] **CRM espace designer** (visites, consultations, contacts, créations publiées, visibilité)

## Sprint 5 — Monétisation & modération
**But :** activer les revenus dès le lancement et sécuriser les contenus.

- [ ] **Abonnement Premium** (mensuel / annuel)
- [ ] **Mise en avant sponsorisée** (7 / 15 / 30 jours)
- [ ] **Bannière publicitaire** (gérée / vendue aux designers)
- [ ] **Niveaux de visibilité** (gratuit / sponsorisé / premium)
- [ ] **Signalements** (profil / création / avis) + délais 72h / 24h
- [ ] **Blocage automatique** + gestion des **litiges** via Support

## Sprint 6 — Facturation & documents
**But :** générer devis/factures/reçus et habiller la facture normalisée DGI pour WhatsApp.

- [ ] **Devis** PDF A5 (`DEV-`) + bon pour accord + validité 15 j.
- [ ] **Facture commerciale** PDF A5 (`FAC-`) + totaux + mode de paiement
- [ ] **Statuts facture** (non payée / acompte / soldée / **ANNULÉE** sans suppression)
- [ ] **Reçu** PDF A5 (`REC-`) acompte/solde/complet/informel + montant en lettres
- [ ] **Codes de traçage** + **QR** + page de vérification
- [ ] **Gabarits** Standard / Personnalisé × sans / avec design
- [ ] **Facture normalisée DGI** : upload du PDF officiel
- [ ] **Overlay** `habillerFacture()` (FPDI + TCPDF) : en-tête structure + pied Gextimo
- [ ] Multi-pages + A5/A4 + **envoi WhatsApp** + garde-fou homologation DGI

## Sprint 7 — Application mobile (profil designer)
**But :** intégrer le profil designer et les fonctions métier dans l'app v5.

- [ ] **CGU + confidentialité** bloquantes à l'inscription
- [ ] **Écrans d'orientation** avant le choix du profil
- [ ] **Changement de type de compte** (paramètres + confirmation)
- [ ] **Écran de bienvenue** + ajout du **logo professionnel**
- [ ] **Import contacts** garanti pour le designer + **dédoublonnage** par numéro
- [ ] Fonctions métier (croquis, fiches techniques, mesures, patrons, moodboards) — *itératif*
- [ ] Suivi commandes/projets · export PDF · partage WhatsApp/Instagram · offline · bibliothèque

## Sprint 8 — Finitions, QA & lancement
**But :** fluidité, partage, tests et mise en production.

- [ ] **Onboarding** utilisateur fluide
- [ ] **Partage social** + SEO
- [ ] **Performance** & fluidité mobile
- [ ] **Tests E2E** + recette client
- [ ] **Déploiement production**
- [ ] **Documentation** & livrables finaux

---

### Livrables bloquants à obtenir du client
- Charte graphique (couleurs + police)
- HTML du footer définitif
- Confirmation URL/wordmark du pied de facture
- Validation DGI/SFE pour l'habillage de la facture normalisée
