# Gextimo — Note de revue
### Plateforme web « vitrine » & application mobile

> **Objet** : synthèse de travail consolidée à partir des maquettes Web v1→v5, App v3→v5, des gabarits Devis/Factures/Reçus, de la Spec Facture v4, et des retours client.
> **Socle retenu** : Web **v5** (plateforme publique) · App Mobile **v5** (mobile).
> **Statut** : **décisions validées** — document de référence pour le développement.

---

## 0. Vision générale

Gextimo est un écosystème dédié à la **mode africaine**, premier ancrage au **Bénin**, vocation d'expansion en Afrique de l'Ouest. Édité par **NovAfrique**.

Deux profils principaux :
- **Artisan / créateur de mode** : tailleur, couturier, atelier.
- **Designer** : styliste, modéliste, patronnier.

**Répartition des usages**
- L'**application mobile** est l'outil central de l'artisan.
- La **plateforme web** sert surtout de **vitrine** au designer.
- Le web permet de **présenter, publier et valoriser** les créations, et de faciliter contacts et demandes.
- Le designer **ne conçoit pas** ses croquis/patrons dans la plateforme : il y **expose** son travail abouti.

**Principe directeur** — le projet évolue par étapes : base solide d'abord, enrichissements ensuite, sans bloquer le démarrage.

---

## 1. Ce qui fonctionne déjà bien

Séparation web/mobile · vitrine des créateurs · collections · suivi de commande · mode sombre · multilingue FR/EN · multidevise · témoignages · espace designer connecté.

La structure est bonne. Le prochain niveau dépend de la capacité du produit à **inspirer confiance, convertir et fidéliser**.

---

## 2. En-tête & navigation web

**En-tête**
- Logo à gauche.
- À droite : **Connexion** (action principale) + **Inscription** (secondaire).
- Sélecteur **thème** clair/sombre · sélecteur **devise** · sélecteur **langue** FR/EN.
- Barre de recherche (modèles, collections, créateurs, catégories).
- **Message rotatif** en en-tête.
- **Bannière publicitaire** permanente en haut.
- **NovAfrique en pied de page uniquement.**

**Menu principal**
- Comment ça marche · Artisans · Collections · Designers / Découvrir les créateurs · **Suivi de commande** (page dédiée) · **Support** (contient la FAQ) · **Qui sommes-nous** (lien menu + page dédiée).

**Retiré définitivement** : Roadmap · Tendances du moment · Sélection publique Client/Artisan/Designer.

---

## 3. Connexion & inscription web

- **Connexion artisan** → message : « Cet espace est destiné à l'application mobile. »
- **Connexion designer** → accès direct à l'espace personnel.
- **Inscription designer** → **formulaire directement sur le web**, sans passer par l'app mobile. *(Décision tranchée.)*

**Champs obligatoires à l'inscription** : nom & prénom · email valide · mot de passe · ville & pays · spécialité (styliste / modéliste / patronnier) · acceptation **CGU + politique de confidentialité**.

**Champs facultatifs (plus tard)** : photo de profil · logo professionnel · biographie · liens réseaux sociaux · portfolio initial.

---

## 4. Page d'accueil web

1. Bannière publicitaire en haut.
2. Hero avec message rotatif.
3. **Comment ça marche — 3 étapes** : Créer son compte / Publier ses créations / Recevoir des commandes.
4. Trouver un styliste / Découvrir les créateurs.
5. **Galerie centralisée de modèles** (section dédiée, après le hero).
6. Collections mises en avant.
7. Recherche géolocalisée.
8. Pourquoi Gextimo / Avantages.
9. Témoignages **avec vraies photos**.
10. Statistiques discrètes.

---

## 5. Découvrir les créateurs

Liste publique de designers, chaque fiche avec un bouton **Visiter le profil**.

Le profil public présente : créations & collections · **avis clients (texte + photos réelles)** · informations professionnelles (spécialité, ville, expérience) · **contact direct** (message, appel, WhatsApp) · **demande de devis** · bouton **Enregistrer en favoris**.

---

## 6. Confiance & crédibilité

**Vérification des profils**
- À l'inscription : profil **non vérifié** par défaut.
- Le designer soumet une pièce d'identité ou un lien professionnel pour demander la vérification.
- Validation **manuelle** par l'équipe Gextimo sous **5 jours ouvrés** max.
- **Badge vérifié** affiché sur le profil public et dans les résultats de recherche.
- Manuel au lancement, automatisé quand le volume le justifie.

**Vérification des avis clients**
- Un avis ne peut être soumis que par un utilisateur ayant eu un **échange ou une commande** avec le designer.
- Publié après validation sous **48h** max.
- Le designer peut **signaler** un avis abusif, mais ne peut pas le supprimer lui-même.

**Éléments de confiance visibles** : badge vérifié · historique des créations · avis (texte + photos) · identité professionnelle complète · photos réelles partout.

---

## 7. Recherche & découverte

Filtres : type de vêtement · style · occasion · ville/localisation · fourchette de prix · délai de réalisation · note/avis · disponibilité.

**Recherche géolocalisée** disponible pour artisans et designers (rayon défini depuis l'app mobile).

---

## 8. Conversion — du visiteur à la commande

**4 niveaux d'action** : **Favori** (sans engagement) · **Contact** (message/appel/WhatsApp) · **Devis** (demande formelle : description, budget, délai) · **Commande** (accord des deux parties sur termes, délai, modalités).

**Parcours complet**
1. Le visiteur découvre un designer (galerie ou recherche).
2. Il visite le profil, consulte les créations, lit les avis.
3. Il choisit une action : favori, contact direct ou demande de devis.
4. Le designer reçoit la demande dans son espace connecté et répond.
5. Les deux parties s'accordent sur les termes.
6. Le designer confirme la commande et demande un acompte si souhaité.
7. Le **suivi de commande** s'active pour les deux parties.

**Paiement & confirmation**
- Au lancement, la plateforme **ne gère pas** le paiement directement.
- Paiement, acompte et confirmation finale **hors plateforme** (virement, mobile money, espèces).
- La plateforme enregistre **la confirmation de commande** et **active le suivi**.
- Intégration de paiement en ligne prévue **plus tard**.

**Boutons d'action** sur chaque profil/création : Demander un devis · Contacter · Enregistrer en favoris · Partager.

---

## 9. Statuts d'une création

| Statut | Visibilité | Actions possibles |
|---|---|---|
| Brouillon | Designer uniquement | Modifier, publier |
| Publiée | Visible publiquement | Modifier, retirer |
| Retirée | Designer uniquement | Republier, modifier |

**Règles de publication** : publication libre par tout designer inscrit (vérifié ou non) · minimum requis : titre, photo, catégorie, prix ou « sur devis » · retrait automatique si signalée non conforme · un designer suspendu ne peut plus publier.

---

## 10. Statuts d'un profil designer

| Statut | Description |
|---|---|
| Non vérifié | Profil actif, visible, sans badge |
| Vérifié | Badge affiché, meilleure visibilité |
| Suspendu | Profil masqué temporairement (signalement) |
| Désactivé | Compte fermé à la demande du designer |

---

## 11. Visibilité — gratuit, sponsorisé, premium

| Niveau | Accès | Visibilité | Limites |
|---|---|---|---|
| Gratuit | Inscription simple | Standard dans la recherche | Max **10 créations** publiées |
| Sponsorisé | Paiement ponctuel | Position haute (galerie + recherche) | Durée définie (7/15/30 jours) |
| Premium | Abonnement mensuel/annuel | Position maximale, badge en avant | Créations illimitées, stats avancées, export, relances |

---

## 12. Modération des contenus

**Publié sans validation** : créations d'un designer inscrit (si règles minimales respectées) · modifications de profil.

**Nécessite validation** : avis clients (48h) · demande de badge vérifié (5 j. ouvrés) · contenus signalés.

**Blocage automatique** : contenu avec mots/images interdits (liste interne) · profil depuis un email déjà suspendu · publication pendant une suspension active.

**Signalements** : tout utilisateur peut signaler profil/création/avis · traitement **72h** (standard) / **24h** (urgent : offensant, usurpation) · contenu non conforme → retrait immédiat + notification · récidive → suspension.

**Litiges** : soumis via le Support · traitement manuel au lancement · automatisé plus tard.

---

## 13. Multidevise & multilingue

- Popup à la première visite : **langue** (FR/EN) + **devise** (FCFA, Naira, Dollar, Euro…).
- Conversion automatique via **API externe** (ExchangeRate-API ou Open Exchange Rates), MAJ quotidienne.
- Avertissement discret : « Prix indicatifs, convertis automatiquement. »
- Préférences mémorisées via **cookies**.

---

## 14. Mode sombre & cookies

- Mode sombre depuis l'en-tête.
- Bandeau cookies à la première visite + paramètres accessibles.
- Mémorisation : langue, devise, thème.

---

## 15. Pied de page

4 rubriques : **Plateforme · Entreprise · Support · Légal**.
- Mentions légales · Droits réservés.
- **« Une solution NovAfrique – Tous droits réservés »** — centré, séparé par une ligne.
- Paramètres cookies · lien **Qui sommes-nous**.

> Charte graphique minimale (couleur primaire, secondaire, police principale) à **fournir avant l'intégration**. **HTML du footer définitif** à livrer avec **deadline fixée**.

---

## 16. Espace designer connecté

- **Menu latéral** : Tableau de bord · Mes créations · Mes collections · Commandes · Statistiques · Paramètres · Profil.
- **Suivi d'activité** : visites & consultations · contacts reçus · créations publiées · évolution de la visibilité.
- **Gestion des créations** : Publier · Mettre en brouillon · **Retirer** · Modifier.
- **Profil** : modifiable directement depuis le web, sans dépendre de l'app.

---

## 17. Monétisation

**Lancement** : Abonnement **Premium** (mensuel/annuel) · **Mise en avant sponsorisée** (7/15/30 j.) · **Bannière publicitaire** (vendue aux designers).
**Plus tard** : commission sur commande · services professionnels.

---

## 18. Effet réseau & croissance

Galerie d'inspiration riche et bien classée · collections saisonnières mises en avant · partage social depuis chaque création/profil · onboarding fluide · visibilité renforcée pour les créateurs actifs · contenu régulièrement mis à jour.

---

## 19. Suivi de commande

Page dédiée accessible depuis le menu. Recherche par **numéro de commande**. **Pas** de section sur la page d'accueil.

---

## 20. Application mobile

Base : **App v5**, enrichie progressivement.

- **Inscription** : CGU + politique de confidentialité **obligatoires** (blocage sans validation).
- **Orientation utilisateur** : écrans explicatifs **avant** le choix du profil. **Changement de type de compte possible** depuis les paramètres en cas de mauvais choix, avec confirmation des conséquences. *(Décision tranchée.)*
- **Première connexion** : écran de bienvenue, saisie nom & prénom · ajout du **logo professionnel** (designer).
- **Fonctions attendues** : croquis de modèles · fiches techniques · gestion des mesures · génération/adaptation de patrons · moodboards · suivi commandes/projets · export PDF · partage WhatsApp/Instagram · sauvegarde hors ligne · bibliothèque (tissus, accessoires, poses de mannequins).

---

## 21. Facturation, devis & reçus

> Ajout suite aux gabarits **Devis/Factures A5 (v3)**, **Reçu A5 (v1)** et **Spec Facture v4 (overlay DGI)**.

### 21.1 Deux familles de documents
1. **Documents commerciaux Gextimo** — générés par l'app, **non normalisés DGI** (devis, facture commerciale, reçu).
2. **Facture normalisée DGI** — émise par l'utilisateur sur **sygmef**, que Gextimo se contente **d'habiller** (en-tête + pied) sans en modifier le contenu.

### 21.2 Documents commerciaux Gextimo (PDF A5)
- **Numérotation à séries séparées** : `DEV-AAAA-xxxx` · `FAC-AAAA-xxxx` · `REC-AAAA-xxxx`.
- **Code de traçage** sur chaque document (`GEX-AAAA-XXXXXX-XX`), vérifiable en base (prouve l'émetteur) ; **QR** sur la facture.
- **Gabarits** : **Standard** (logo Gextimo + nom atelier) ou **Personnalisé** (logo de la structure/designer + « Propulsé par gextimo. ») — chacun en variante **« sans design »** ou **« avec design »** (motifs décoratifs couture).

**Devis** (`DEV-AAAA-xxxx`)
- Étape « le client demande un prix → avant accord ».
- Mention **« Valable 15 jours »**, conditions (acompte 50 % à la commande · solde à la livraison).
- Bloc **« Bon pour accord »** (date + signature client) · **total estimé**.

**Facture commerciale** (`FAC-AAAA-xxxx`)
- Totaux : sous-total / acompte versé / **reste à payer** / total · mode de paiement (Mobile Money MTN/Moov…).
- Bloc vérification : QR + **« Authenticité — Non normalisée DGI »** + « Scannez pour vérifier ».
- **Mention obligatoire** : « Document commercial de suivi de commande — ne constitue pas une facture normalisée (DGI / e-MECeF). »
- **Statuts** : non payée / acompte versé / soldée / **ANNULÉE**.
- **Règle erreur** : ne **jamais supprimer** → passer en **« ANNULÉE »** (conservé en base) + réémettre au numéro suivant.

**Reçu** (`REC-AAAA-xxxx`)
- Types : acompte / solde / paiement complet / informel (sans logo).
- Montant reçu **+ montant en lettres** + mode de paiement.
- Récap suivi commande (total / déjà versé / reste à payer · tag **SOLDÉ**).
- Bloc **« Pour acquit »** (signature/cachet) + code de traçage.

### 21.3 Facture normalisée DGI — habillage / overlay *(point souligné par le client)*
> Le template de la facture normalisée **se contente de poser l'en-tête et le pied de page** pour personnaliser la facture PDF, qui est ensuite **envoyée au client par WhatsApp**.

- **Principe** : Gextimo **ne reconstruit pas** la facture et **n'extrait aucun champ**. Il prend le **PDF officiel DGI tel quel**, le met à l'échelle (A5/A4) et l'habille :
  - **En-tête = identité de la structure** (logo de l'atelier/designer à gauche + nom à droite, depuis son profil).
  - **Pied = bande GEXTIMO** (crédit plateforme).
  - Le contenu officiel (**QR, codes MECeF, montants**) reste **strictement intact**.
- **Flux** : (1) émission sur `sygmef.impots.bj` → (2) bouton **« FACTURE PDF »** (PDF officiel) → (3) **upload** dans Gextimo → (4) **overlay auto** (en-tête + pied, mise à l'échelle) → (5) téléchargement / **envoi WhatsApp**.
- **Règles absolues** :
  - **R1** — Ne jamais toucher au contenu DGI (en-tête en marge haute, pied en marge basse uniquement).
  - **R2** — QR conservé tel quel (jamais redessiné).
  - **R3** — En-tête = structure ; pied = GEXTIMO (ne pas inverser). **Le logo Gextimo ne va PAS dans l'en-tête.**
  - **R4** — A5 par défaut, A4 possible.
  - **R5** — Multi-pages : en-tête + pied **sur chaque page**.
- **Implémentation backend (Laravel)** : **FPDI + TCPDF**, fonction `habillerFacture()` ; `useTemplate()` conserve le contenu vectoriel/texte à l'identique. **Aucune saisie, regex ni OCR.**
- **Données nécessaires** : PDF officiel (input) · logo & nom de la structure (profil) · format A5/A4.
- **Garde-fou** : faire **confirmer par la DGI** que l'ajout d'un en-tête/pied autour de la facture normalisée est accepté.
- **Pied (contenu fixe)** : « GEXTIMO · Application de gestion pour ateliers de couture » / « Bénin · Sénégal · Côte d'Ivoire » (3 pays pour l'instant) / `gextimo.novafriq.co`.
- **Réf.** : spec destinée à **Marcus KOUNOU** (backend Laravel) · contact **Patrick Dona ADJAHO** — patrick@novafriq.co — +229 01 66 55 29 92.

> **À confirmer** : URL/wordmark exacts du pied (`gextimo.novafriq.co` vs domaines réels `gextimo.novafriq.africa` / `gextimoapi.novafriq.africa`) · homologation **SFE/DGI** pour la facture normalisée.

---

## 22. Import des contacts clients — ✅ confirmé actif

- **Déjà implémenté** côté app (artisan) : [`src/pages/clients/ClientsPage.jsx`](../src/pages/clients/ClientsPage.jsx) via **`@capacitor-community/contacts`** (v7.2.0).
- **Flux** : demande de permission → liste des contacts du téléphone → **sélection multiple** → import en fiches clients (nom + téléphone).
- **À garantir** pour le profil **Designer** (et le web si pertinent), afin de **faciliter le renseignement des mesures** et autres infos.
- **Recommandation** : dédoublonnage par numéro de téléphone à l'import.

---

## 23. Ce qu'il reste à produire

- Matrice des **rôles & permissions**.
- Liste des **pages & états UI**.
- **Structure des données** d'un profil créateur.
- **Logique de monétisation** détaillée.

---

## 24. Ce qui est retiré définitivement

Roadmap · Tendances du moment · Choix public Client/Artisan/Designer à la connexion · NovAfrique dans l'en-tête · FAQ sur la page d'accueil.

---

## 25. Priorités absolues pour le lancement

1. Profils **vérifiés et crédibles**.
2. **Recherche avancée** avec filtres précis.
3. **Boutons de conversion** visibles (devis, contact, réservation).
4. Galerie riche, bien classée, facile à parcourir.
5. **Monétisation intégrée** dès le départ.
6. Expérience **mobile** très fluide.
7. Partage social & visibilité des créateurs.
8. Contenu régulièrement mis à jour.

---

> La force de Gextimo ne doit pas être seulement esthétique. Elle doit se voir dans sa capacité à **aider les artisans à travailler, valoriser les designers, rassurer les clients, et transformer la visibilité en commandes réelles.**
