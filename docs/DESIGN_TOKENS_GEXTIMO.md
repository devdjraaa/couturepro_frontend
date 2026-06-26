# Gextimo — Design Tokens (prêts à coder)

> Source : **Charte Graphique Officielle Gextimo** (NOVAFRIQ · 2026).
> Palette officielle = **rouge / noir / blanc / blanc cassé**. Le bordeaux/ocre des anciennes maquettes est **abandonné**.
> Polices : **Inter** (interface) · **Playfair Display** (institutionnel / éditorial).

---

## 1. Palette

| Token | HEX | Rôle |
|---|---|---|
| `rouge` | `#D00B0B` | **Signature / actions** : boutons primaires, KPI, badges actifs, liens d'action. **≤ 30 % de la surface d'un écran.** |
| `noir` | `#0D0D0D` | Textes, en-têtes, icônes inactives, bordures structurelles, fond institutionnel. |
| `blanc` | `#FFFFFF` | Textes sur fond sombre, surfaces (cards). |
| `bgApp` | `#F8F5F0` | **Fond principal** de toute interface (blanc cassé). |
| `vert` | `#1FA855` | État succès / badge « Livré » (outline). *(à confirmer côté client si nuance imposée)* |
| `bordeaux` | *à fournir* | Fond institutionnel autorisé du logo — **HEX non défini dans la charte**. |

**Règles d'or**
- Le rouge `#D00B0B` est **le seul rouge autorisé** (aucune autre teinte).
- **Jamais** de rouge pour le corps de texte — uniquement labels, valeurs critiques, actions.
- Fond d'interface = `#F8F5F0`, surfaces = blanc, texte = noir.

---

## 2. Variables CSS (`:root`)

```css
:root{
  /* Couleurs officielles */
  --gx-rouge:        #D00B0B;   /* signature / actions (≤30% écran) */
  --gx-rouge-hover:  #B00909;   /* survol bouton primaire */
  --gx-rouge-soft:   #FCEAEA;   /* fond rouge très clair (alertes douces) */
  --gx-noir:         #0D0D0D;   /* textes, en-têtes, institutionnel */
  --gx-blanc:        #FFFFFF;   /* surfaces / textes sur sombre */
  --gx-bg:           #F8F5F0;   /* fond principal interface (blanc cassé) */
  --gx-vert:         #1FA855;   /* succès / badge Livré */

  /* Neutres dérivés (déclinaisons fonctionnelles) */
  --gx-gris:         #6F635E;   /* texte secondaire */
  --gx-gris-3:       #9CA3AF;   /* texte tertiaire / placeholder */
  --gx-line:         #EBE4DA;   /* bordures / séparateurs */
  --gx-surface-2:    #F1ECE4;   /* surface alternée / hover léger */

  /* Typographie */
  --gx-font-ui:      'Inter', system-ui, Arial, sans-serif;
  --gx-font-display: 'Playfair Display', Georgia, serif;

  /* Rayons & ombres */
  --gx-radius:    14px;
  --gx-radius-sm: 8px;
  --gx-shadow:    0 10px 26px -18px rgba(13,13,13,.45);
}

body{
  background: var(--gx-bg);
  color: var(--gx-noir);
  font-family: var(--gx-font-ui);
}
h1,h2,h3,.display{ font-family: var(--gx-font-display); }
```

Import des polices (HTML `<head>`) :

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 3. Config Tailwind (`tailwind.config.js`)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gx: {
          rouge:   '#D00B0B',
          'rouge-hover': '#B00909',
          'rouge-soft':  '#FCEAEA',
          noir:    '#0D0D0D',
          bg:      '#F8F5F0',   // fond principal (blanc cassé)
          vert:    '#1FA855',
          gris:    '#6F635E',
          line:    '#EBE4DA',
          surface: '#F1ECE4',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],     // interface (défaut)
        display: ['"Playfair Display"', 'Georgia', 'serif'], // titres / éditorial
      },
      borderRadius: { gx: '14px' },
      boxShadow: { gx: '0 10px 26px -18px rgba(13,13,13,.45)' },
    },
  },
  plugins: [],
}
```

Exemples d'usage :
```html
<body class="bg-gx-bg text-gx-noir font-sans">
  <h1 class="font-display">Découvrez les créateurs</h1>
  <button class="bg-gx-rouge hover:bg-gx-rouge-hover text-white rounded-gx px-5 py-3">
    Demander un devis
  </button>
  <span class="text-gx-vert border border-gx-vert rounded px-2">Livré</span>
</body>
```

---

## 4. Composants — rappel charte

| Élément | Style |
|---|---|
| Bouton **primaire** (Nouvelle commande, Partager WhatsApp) | rouge plein |
| Bouton **primaire alt** (Démarrer l'essai) | rouge outline |
| Bouton **destructif** (Supprimer) | rouge plein |
| Bouton **secondaire** (Exporter PDF, Sauvegarder) | noir plein |
| Bouton **tertiaire** (Voir détails / En savoir plus) | rouge ou noir outline |
| Bouton **neutre** (Annuler) | gris/noir outline |
| Badge **Livré** | vert outline |
| Badge **En cours** | rouge outline |
| Badge **Retard / Premium / VIP** | rouge plein |
| Badge **Essayage** | noir plein |

**Icônes** : style outline, grille 24×24, couleur `#D00B0B` sur fond `#F8F5F0`.
**Logo** : largeur min 120 px ; espace de protection = hauteur du « g » ; fonds autorisés = noir, blanc ou bordeaux uniquement.
**Ton rédactionnel** : **vouvoiement** systématique.

---

## 5. Points à confirmer avec le client
- **HEX du Bordeaux** (fond institutionnel) — non défini dans la charte.
- **Nuance exacte du Vert** succès — non définie (proposé : `#1FA855`).
- Domaine officiel : la charte indique `gextimo.app`, le déploiement réel est `gextimo.novafriq.africa` → harmoniser.
