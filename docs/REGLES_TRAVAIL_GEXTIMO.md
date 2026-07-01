# Règles de travail — projet Gextimo (CouturePro)

Ces règles sont **prioritaires** et s'appliquent à chaque tâche, sans exception.

## 1. Toujours vérifier l'existant AVANT d'agir

Avant **toute** action (écrire, modifier ou supprimer du code), vérifier ce qui existe
déjà — **des deux côtés** :

- **Backend** (`couturepro_backend`) : consulter `routes/api.php` et `routes/admin.php`
  pour connaître les endpoints réellement disponibles, leurs paramètres et leurs réponses.
- **Frontend** (`couturepro_frontend`) : consulter les `src/services/*` (méthodes déjà
  présentes), les pages/composants existants, et les clés i18n (`src/lang/fr.json` /
  `src/lang/en.json`).

Règle simple :
- **Un appel réseau** → l'endpoint backend doit exister. **Ne jamais inventer d'endpoint.**
- **Un texte affiché** → passer par i18n (`useTranslation` + `fr.json`/`en.json`).
  **Jamais de chaîne de caractères en dur dans le JSX.**
- **Une fonctionnalité** → vérifier si elle existe déjà avant de la recréer ou de la retirer.

## 2. Ne jamais défaire l'existant à l'aveugle

Ne pas supprimer ni réécrire une fonctionnalité existante sans avoir vérifié qu'elle n'est
pas déjà branchée (UI + backend + RBAC). Si du code semble « inutile », vérifier d'abord
ses dépendances avant de le retirer.

## 3. En cas de doute ou de décision → demander d'abord

Si une décision mérite discussion (retirer une feature, changer un comportement, un choix
d'architecture ou de produit), **ne pas trancher seul** : envoyer un message à **djraa**
d'abord, à chaque fois, et attendre sa réponse avant de procéder.

## 4. Zéro hardcoding (règle absolue du projet)

Ne jamais coder en dur une valeur destinée à changer : textes (→ i18n), prix / offres /
seuils / flags de fonctionnalités (→ config éditable depuis l'admin / la base). Tout doit
rester paramétrable sans avoir à revenir dans le code.

## 5. Git

Faire `git pull` avant de toucher un fichier partagé (notamment `MaVitrinePage`, les
services, les fichiers de langue). Committer/pousser régulièrement pour éviter les
divergences.

---

## État actuel du projet (à connaître avant de coder)

Ces éléments sont **faits, branchés et fonctionnels** — bâtir dessus, ne pas les défaire :

- **Facturation Designer** : backend réel (`/factures…`) + page branchée + **intégration
  e-MECeF** (normalisation DGI) prête côté code (en attente d'un jeton de test).
- **Demande de devis**, **vérification créateur**, **sponsorisation self-service** :
  UI + backend + écrans admin.
- **RBAC par abonnement (config-driven)** : chaque fonctionnalité s'active/désactive par
  plan via le `config` du plan (flags `facturation`, `facturation_normalisee`,
  `devis_vitrine`, `sponsorisation`). Côté front, utiliser `usePlanFeature` / `FeatureGate`
  — pas de blocage codé en dur.
- **i18n complet de l'espace app** : Facturation, MaVitrine, Premium, ArtisanApp, Galerie,
  Notifications, NouvelleCommande, NouvelleCommandeGroupee, CommandeGroupeDetail sont 100 %
  FR/EN. Toute nouvelle chaîne passe obligatoirement par i18n.

## Namespaces i18n existants (réutiliser, ne pas dupliquer)

`commun`, `auth`, `nav`, `commandes` (avec `commandes.groupe`, `commandes.groupe_form`,
`commandes.creation`), `facturation`, `ma_vitrine`, `premium`, `artisan_app`, `galerie`,
`notifications`, `abonnement`, `theme`, `vitrine`. Vérifier ces clés avant d'en créer de
nouvelles.
```
