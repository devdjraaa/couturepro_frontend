# Gextimo — Grille tarifaire abonnements (provisoire)

> ⚠️ **Tous les tarifs ci-dessous sont PROVISOIRES** — à réviser après la phase de test terrain.
> **Principe non négociable** : prix, limites et options doivent rester **éditables depuis l'admin**
> (config en base `niveaux_config`), **jamais codés en dur** côté app/vitrine. La flexibilité du
> module d'abonnement est essentielle (les prix changeront).
> Source : grille envoyée par le client (Discord), version retenue ci-dessous.

## Plans (version canonique — Free / Atelier / Master)

| Plan | Prix /mois | Prix /an | Badge |
|---|---|---|---|
| **Free** (Découverte) | 0 FCFA | — | — |
| **Atelier** (Recommandé) | **1 200** FCFA | **12 000** FCFA (2 mois offerts) | Recommandé |
| **Master** (Premium) | **2 500** FCFA | **25 000** FCFA (2 mois offerts) | Premium |

### Free — 0 FCFA (permanent, sans CB)
- **App** : 10 clients max · 10 commandes/mois · mesures · caisse basique · 5 facturations avec logo · alertes WhatsApp · ❌ pas d'assistant · ❌ pas de cloud.
- **Galerie web** : 5 photos publiables · page profil active · bouton WhatsApp · 1 suppression/mois · ❌ invisible dans la galerie · ❌ pas de stats.

### Atelier — 1 200 /mois · 12 000 /an
- **App** : 50 clients/mois · 50 commandes/mois · mesures + catalogue complet · 1 assistant inclus · caisse complète · facturation illimitée · alertes WhatsApp · sauvegarde cloud · ❌ pas de rapport PDF.
- **Galerie web** : 15 photos publiables · visible dans la galerie · suppression libre · searchable (nom/tenue) · stats (vues + clics WhatsApp).

### Master — 2 500 /mois · 25 000 /an
- **App** : 150 clients/mois · 150 commandes/mois · mesures + catalogue · 2 assistants inclus · 1 membre/lecteur inclus · caisse complète · facturation illimitée · WhatsApp · cloud.
- **Galerie web** : 30 photos publiables · visible + **prioritaire** · suppression libre · stats complètes.
- **Options débloquées** : rapport PDF mensuel · 1 atelier supplémentaire.

## Options supplémentaires (plan Master uniquement)

| Option | Prix |
|---|---|
| Rapport PDF mensuel automatique | 500 FCFA/mois |
| 1 atelier supplémentaire (max 1) | 1 000 FCFA/mois |
| 1 assistant supplémentaire | 500 FCFA/mois |
| 1 membre / lecteur supplémentaire | 300 FCFA/mois |
| Pack 10 photos supplémentaires (galerie) | 300 FCFA/mois |

## Boost / mise en avant (vitrine)
- **Boost visibilité Explorer — 7 jours : 1 000 FCFA / boost** (issu de la 1ʳᵉ version de la grille).
  → correspond à la « mise en avant sponsorisée » (déjà implémentée : `sponsor_jusqu_a`, activation manuelle).

## NB versions
- Une **1ʳᵉ version** existait (Free / Atelier / **Studio**, 2 500 / 5 000 FCFA) — **remplacée** par la version Free / Atelier / **Master** ci-dessus (à confirmer si besoin).
