# CouturePro — État d'avancement (26 avril 2026)

> Document généré à partir des commits git et de l'analyse du code source.
> Backend : historique complet. Frontend : commits depuis le 25 avril 2026.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Backend — Ce qui est fait](#2-backend--ce-qui-est-fait)
3. [Frontend — Ce qui est fait](#3-frontend--ce-qui-est-fait)
4. [Connexion backend ↔ frontend](#4-connexion-backend--frontend)
5. [Ce qui reste à faire — Frontend](#5-ce-qui-reste-à-faire--frontend)
6. [Ce qui reste à faire — Backend](#6-ce-qui-reste-à-faire--backend)
7. [Sprints MVP1 restants](#7-sprints-mvp1-restants)

---

## 1. Vue d'ensemble

| Élément | Backend | Frontend |
|---|---|---|
| Commits | 25 (depuis création) | 16 (depuis 25 avril) |
| Pages | — | 35 (18 user + 15 admin + 2 auth) |
| Controllers API | 18 | — |
| Controllers Admin | 11 | — |
| Routes API | ~55 endpoints | — |
| Modèles | 29 | — |
| Services frontend | — | 13 métier + 10 admin + 4 infra |
| Hooks custom | — | 27 |
| Composants | — | 61 fichiers / 13 dossiers |
| Migrations | 43 | — |

---

## 2. Backend — Ce qui est fait

### 2.1 Authentification

| Feature | Endpoint | État |
|---|---|---|
| Inscription propriétaire | `POST /auth/inscription` | ✅ |
| Vérification OTP | `POST /auth/verifier-otp` | ✅ |
| Renvoi OTP | `POST /auth/renvoyer-otp` | ✅ |
| Login propriétaire | `POST /auth/login` | ✅ |
| Login membre équipe | `POST /auth/equipe/login` | ✅ |
| Récupération (5 étapes) | `POST /auth/recuperation/*` | ✅ |
| Logout | `POST /auth/logout` | ✅ |
| Me (session) | `GET /auth/me` | ✅ |

### 2.2 API métier

| Domaine | Endpoints | État |
|---|---|---|
| Clients | CRUD + archiver | ✅ |
| Mesures | CRUD par client | ✅ |
| Vêtements | CRUD + image upload | ✅ |
| Commandes | CRUD + paiements par commande | ✅ |
| Équipe | GET / POST / DELETE membre | ✅ |
| Fidélité | GET solde + convertir | ✅ |
| Paiements FedaPay | Initier / retour / status | ✅ |
| Abonnement | Plans + current (auto-expiry) | ✅ |
| Notifications | GET + mark-as-read | ✅ |
| Support tickets | CRUD + répondre | ✅ |
| Paramètres | Profil / Atelier / Communications / Mot de passe | ✅ |
| WhatsApp rappel | GET rappel client | ✅ |
| Sync | push + pull | ✅ |
| Webhooks | POST (FedaPay callback) | ✅ |

### 2.3 API Admin

| Domaine | Endpoints | État |
|---|---|---|
| Auth admin | login / logout / me | ✅ |
| Ateliers | list / detail / geler / dégeler / demo / trial | ✅ |
| Plans (NiveauConfig) | CRUD + toggle actif | ✅ |
| Transactions (codes) | list / create / delete | ✅ |
| Paiements | list / valider / rembourser (DB only, FedaPay manuel) | ✅ |
| Tickets | list / detail / assigner / répondre / fermer / rouvrir | ✅ |
| Offres spéciales | CRUD | ✅ |
| Liste noire | list / create / delete | ✅ |
| Audit log | list | ✅ |
| Fidélité atelier | GET + ajuster | ✅ |
| Notifications broadcast | POST | ✅ |

### 2.4 Modèles (29)

`Abonnement`, `Admin`, `AdminAuditLog`, `Atelier`, `Client`, `Commande`, `CommandePaiement`, `CommunicationsConfig`, `DemandeRecuperation`, `EquipeMembre`, `Fonctionnalite`, `ListeNoire`, `Mesure`, `NiveauConfig`, `NiveauConfigChangelog`, `NotificationSysteme`, `OffreSpeciale`, `OtpToken`, `Paiement`, `ParametresAtelier`, `PhotoVip`, `PointsFidelite`, `PointsHistorique`, `Proprietaire`, `QuotaMensuel`, `TicketMessage`, `TicketSupport`, `TransactionAbonnement`, `Vetement`

### 2.5 Commandes Artisan

| Commande | Planification | Rôle |
|---|---|---|
| `app:check-pending-payments` | toutes les 15 min | Vérifie les paiements FedaPay en attente |
| `app:expire-stale-payments` | toutes les heures | Expire les paiements expirés |
| `app:process-bonus-expiry` | toutes les heures | Expire les bonus de points |
| `app:notify-abonnement-expiry` | quotidien 08h00 | Notifie à J-7, J-3, J-1 |
| `app:reset-trial {atelier_id}` | manuelle (dev) | Remet un atelier en période d'essai |

### 2.6 Comportements notables

- **Auto-expiry sur lecture** : `AbonnementController::current()` expire en DB si `timestamp_expiration` est passé
- **-1 = illimité** : convention dans `plan.config` pour les limites infinies
- **device_id** : les membres équipe sont limités à un appareil (verrouillage par `device_id`)
- **Remboursement FedaPay** : API FedaPay ne supporte pas le remboursement REST → DB seulement, remboursement manuel depuis le dashboard FedaPay via le `fedapay_transaction_id` retourné

---

## 3. Frontend — Ce qui est fait

### 3.1 Commits depuis le 25 avril (16 commits)

```
72e052a  feat: enhance PlanCard, EquipePage, and LoginPage
d855f16  feat: add FeatureGate, countdown, subscription features
7371c09  feat: ExpiryBanner and SubscriptionWall components
b8ab3b5  feat: payment return page and status verification
cba64ad  feat: CommandeForm and Vetement with image handling
e693669  feat: refactor Mesure components
8248054  feat: update Commande/CommandeDetail with pricing fields
6c9a41d  feat: support ticket detail page
0525ca9  feat: theme selection and language support
c213e31  feat: support page
773e745  feat: WhatsApp reminder and demo mode
30f8efa  feat: admin pages (offers, plans, tickets, transactions)
0a22e2e  feat: restructure mock data and services
f2a9d80  feat: implement feature X (misc)
4d59c36  step 10-11
fc3f117  yarn
```

### 3.2 Pages implémentées (35)

#### Pages utilisateur (18)
| Page | Route | État |
|---|---|---|
| LoginPage | `/login` | ✅ (2 onglets : propriétaire + équipe) |
| RegisterPage | `/register` | ✅ |
| OnboardingPage | `/onboarding` | ✅ |
| DashboardPage | `/` | ✅ (données mock) |
| ClientsPage | `/clients` | ✅ |
| ClientDetailPage | `/clients/:id` | ✅ |
| CommandesPage | `/commandes` | ✅ |
| CommandeDetailPage | `/commandes/:id` | ✅ |
| CataloguePage | `/vetements` | ✅ |
| EquipePage | `/equipe` | ✅ (create + code_acces modal) |
| ParametresPage | `/parametres` | ✅ (countdown temps réel) |
| NotificationsPage | `/notifications` | ✅ |
| PointsPage | `/points` | ✅ |
| CommunicationsPage | `/communications` | ✅ |
| SupportPage | `/support` | ✅ |
| SupportTicketDetailPage | `/support/:id` | ✅ |
| ThemePage | `/theme` | ✅ |
| PaiementRetourPage | `/paiement/retour` | ✅ |

#### Pages admin (15)
| Page | Route | État |
|---|---|---|
| AdminLoginPage | `/admin/login` | ✅ |
| AdminDashboardPage | `/admin` | ✅ |
| AteliersPage | `/admin/ateliers` | ✅ |
| AtelierDetailPage | `/admin/ateliers/:id` | ✅ |
| PlansPage | `/admin/plans` | ✅ (formulaire structuré, -1 = illimité) |
| TransactionsPage | `/admin/transactions` | ✅ |
| AdminPaiementsPage | `/admin/paiements` | ✅ |
| TicketsPage | `/admin/tickets` | ✅ |
| TicketDetailPage | `/admin/tickets/:id` | ✅ |
| OffresPage | `/admin/offres` | ✅ |
| ListeNoirePage | `/admin/liste-noire` | ✅ |
| AuditPage | `/admin/audit` | ✅ |
| AdminNotificationsPage | `/admin/notifications` | ✅ |

### 3.3 Services connectés au vrai backend

| Service | État |
|---|---|
| `authService.js` | ✅ Réel (login, register, OTP, récupération) |
| `equipeService.js` | ✅ Réel (GET / POST / DELETE) |
| `abonnementService.js` | ⚠️ Partiellement réel (plans + current réels, activation par code = TODO) |
| Tous les services admin | ✅ Réels (via adminApi) |

### 3.4 Services encore en mock

| Service | Nb occurrences mock/TODO |
|---|---|
| `commandeService.js` | 19 |
| `clientService.js` | 13 |
| `vetementService.js` | 11 |
| `photoVipService.js` | 9 |
| `parametresService.js` | 8 |
| `abonnementService.js` | 7 |
| `mesureService.js` | 6 |
| `notificationService.js` | 6 |
| `quotaService.js` | 6 |
| `ticketService.js` | 6 |
| `pointsService.js` | 5 |
| `whatsappService.js` | 4 |
| `paiementService.js` | 4 |

### 3.5 Infrastructure technique

- **AuthContext** : user, atelier, login/equipeLogin/logout, permissions par rôle (`can()`)
- **SubscriptionWall** : overlay bloquant sur routes protégées si `statut === 'expire' | 'gele'` (exempt : `/parametres`, `/paiement/retour`)
- **ExpiryBanner** : bandeau jaune si `statut === 'essai'` et `jours_restants <= 5`
- **FeatureGate** : composant qui bloque une feature si non incluse dans le plan (variants `card` / `inline`)
- **useSubscriptionGate** : hook central pour l'état de l'abonnement
- **useCountdown** : timer temps réel `setInterval(1000)` → `{ days, hours, minutes, seconds }`
- **usePlanFeature / usePlanLimit** : hooks de feature-gating, -1/null = illimité
- **TanStack Query** : `staleTime: 30s`, `refetchInterval: 60s` pour l'abonnement
- **device_id** : UUID stable dans `localStorage('cp_device_id')` pour login équipe

---

## 4. Connexion backend ↔ frontend

### Connecté et fonctionnel ✅
- Auth complète (propriétaire + équipe + admin)
- Abonnement : plans, current, auto-expiry, countdown, SubscriptionWall, FeatureGate
- Équipe : liste, création (avec code_acces modal), révocation
- Admin : toutes les pages admin utilisent les vrais services

### Connecté mais à valider ⚠️
- `PaiementRetourPage` : lit `?transaction_id` et appelle `/paiements/{id}/status` — à tester avec FedaPay sandbox
- `abonnementService.activateCode()` : TODO commenté, endpoint backend manquant

### Non connecté (mock) ❌
Voir tableau section 3.4 — clients, commandes, vêtements, mesures, notifications, tickets, points, paramètres, quota, photos VIP, WhatsApp

---

## 5. Ce qui reste à faire — Frontend

### 5.1 PlaceholderPages (routes définies, page vide)

| Route | Page attendue |
|---|---|
| `/otp` | Vérification OTP après inscription |
| `/forgot-password` | Demande de récupération (étape 1) |
| `/recover-account` | Récupération compte (étapes 2-5) |
| `/profil` | Profil propriétaire (modifier nom, tel, mdp) |
| `/apropos` | À propos de l'app |
| `/historique` | Historique actions locales (Sprint 12) |
| `/faq` | FAQ (10 items statiques, Sprint 12) |
| `/contact` | Liens contact (Sprint 12) |
| `/photos-vip` | Module photos VIP (Sprint 2+, derrière FeatureGate) |

### 5.2 Fonctionnalités incomplètes

| Fonctionnalité | Problème |
|---|---|
| Activation abonnement par code | `activateCode()` → TODO, pas d'endpoint backend |
| Photos VIP | `photoVipService.js` → `non_disponible`, pas de controller backend |
| Quota clients | `quotaService.js` → TODO, pas de route `/quotas` |
| Dashboard stats réelles | `useDashboard` utilise des données mock |
| Sync offline | `SyncController` existe en backend, non utilisé en frontend |

### 5.3 Connexion des services mock au backend

Par priorité MVP1 :
1. `clientService.js` — route `GET/POST/PUT/DELETE /clients` existe ✅
2. `commandeService.js` — routes commandes existent ✅
3. `mesureService.js` — routes mesures existent ✅
4. `vetementService.js` — routes vêtements existent ✅
5. `notificationService.js` — routes notifications existent ✅
6. `ticketService.js` — routes tickets existent ✅
7. `pointsService.js` — routes fidélité existent ✅
8. `parametresService.js` — routes paramètres existent ✅
9. `whatsappService.js` — route rappel existe ✅
10. `paiementService.js` — routes paiement existent ✅

---

## 6. Ce qui reste à faire — Backend

| Feature | État | Notes |
|---|---|---|
| Endpoint activation par code transaction | ❌ Manquant | Needed for `activateCode()` frontend |
| Controller PhotoVip | ❌ Manquant | Modèle `PhotoVip` existe, pas de routes |
| Endpoint quotas mensuels | ❌ Manquant | Modèle `QuotaMensuel` existe, pas de route GET |
| Dashboard stats agrégées | ❌ Manquant | Pas d'endpoint `/dashboard/stats` |
| Export PDF mesures | Hors scope backend | Généré côté frontend (jsPDF) |

---

## 7. Sprints MVP1 restants

Référence : `docs/sprints-restants-mvp1.md`

| Sprint | Nom | État | Priorité |
|---|---|---|---|
| S8 | Dashboard 3 indicateurs + alertes livraison | 🔲 À faire | Haute |
| S9 | Photos profil client + photos tissu commande + notes | 🔲 À faire | Haute |
| S10 | Export PDF mesures + 20 modèles vêtements | 🔲 À faire | Moyenne |
| S11 | Activation abonnement par code transaction | 🔲 À faire | Haute (bloque les paiements) |
| S12 | Communications WhatsApp + Historique + FAQ + Contact | 🔲 À faire | Moyenne |

### Détail rapide

**S8** — 3 cartes dashboard : "En retard", "Dans 48h", "En cours" + badge sur icône Commandes  
**S9** — Avatar client (7 par type) + photo tissu en base64 local + champ note interne  
**S10** — jsPDF/html2canvas pour export mesures + 20 modèles vêtements pré-chargés  
**S11** — Saisie code transaction → activation jours d'abonnement (besoin endpoint backend)  
**S12** — 3 toggles WhatsApp indépendants + historique localStorage 8 jours + 10 FAQ statiques + liens contact

### Hors scope MVP1 (Phase 2+)
- WatermelonDB offline-first
- Capacitor / timer natif
- Module caisse avancé
- Multi-atelier
- Photos VIP sur Cloudflare R2
- Rapports PDF mensuels multi-ateliers
- i18n anglais
- SMS reminders

---

*Dernière mise à jour : 26 avril 2026*
