/**
 * Système de composition des documents PDF — V2 (refonte du 20/07).
 *
 * En V1, chacun des 7 exports embarquait ses propres couleurs et sa propre
 * structure : violet pour la caisse, vert pour les relevés, gris Tailwind
 * ailleurs. Aucun ne portait la charte Gextimo, et deux documents du même
 * atelier n'avaient pas l'air de venir de la même maison.
 *
 * Ce module est la SOURCE UNIQUE de l'apparence des documents. Les exports
 * composent avec ces briques ; ils ne redéfinissent plus ni couleur ni marge.
 * Un futur document hérite de l'identité sans une ligne de style.
 *
 * Choix de fond : le papier n'est pas l'écran. Fond blanc franc, rouge de marque
 * sur les filets et les intitulés, rouge appuyé sur les totaux. Pas d'aplat
 * pleine page : l'encre coûte cher et cela se voit sur une impression bon
 * marché — la couleur passe par des filets fins, pas par des blocs.
 */

/* ── Jetons (miroir de la charte applicative) ─────────────────────────────── */
export const T = {
  rouge:      '#D00B0B',
  rougeSombre:'#8E0707',
  or:         '#CDA662',
  orSombre:   '#A87F3E',
  orPale:     '#F5EDDD',

  encre:      '#1A1614',   // texte principal — pas de noir pur, moins dur à l'impression
  encreDoux:  '#5B534E',
  gris:       '#8A817B',
  filet:      '#E4DDD5',
  fondDoux:   '#FBF9F6',
  blanc:      '#FFFFFF',

  vert:       '#1F7A5A',   // encaissé / payé
  ambre:      '#B4791A',   // en attente

  /* Accent STRUCTUREL (filets, intitulés d'atelier, encarts).
     ROUGE de marque — arbitrage direction du 20/07, après comparaison des deux
     jeux sur les 8 documents : un document reconnaissable au premier coup d'œil
     vaut mieux qu'un document plus discret, surtout au lancement.
     `setAccent('or')` reste disponible pour comparer. */
  accent:       '#D00B0B',
  accentSombre: '#8E0707',
  accentPale:   '#FBE9E9',

  // Une seule famille sur toute la plateforme, écrans ET documents (demande
  // direction). Arial est présente partout, donc les PDF s'impriment à
  // l'identique quel que soit l'appareil — plus de police absente remplacée en
  // silence par une autre au moment de l'impression.
  serif:      "Arial, Helvetica, sans-serif",
  sans:       "Arial, Helvetica, sans-serif",

  // A4 à 72 dpi (unité de jsPDF) : 595 × 842 pt.
  largeur:    595,
  marge:      44,
}

/**
 * Bascule l'accent structurel de tous les documents.
 * @param {'or'|'rouge'} nom
 */
export function setAccent(nom) {
  const jeux = {
    or:    { accent: '#CDA662', accentSombre: '#A87F3E', accentPale: '#F5EDDD' },
    rouge: { accent: '#D00B0B', accentSombre: '#8E0707', accentPale: '#FBE9E9' },
  }
  Object.assign(T, jeux[nom] ?? jeux.or)
}

/* ── Briques ──────────────────────────────────────────────────────────────── */

/**
 * En-tête de document : nom de l'atelier en capitales espacées, titre en
 * Bodoni, filet d'accent. C'est la signature visuelle commune aux 8 documents.
 */
export function enTete({ atelierNom, titre, sousTitre = '', reference = '', date = null }) {
  const d = (date ?? new Date()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  return `
  <header style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;
                 padding-bottom:14px;border-bottom:1px solid ${T.filet};margin-bottom:6px;">
    <div style="min-width:0;">
      <p style="margin:0 0 10px;font:600 9px/1 ${T.sans};letter-spacing:.18em;
                text-transform:uppercase;color:${T.accentSombre};">${esc(atelierNom)}</p>
      <h1 style="margin:0;font:400 27px/1.1 ${T.serif};color:${T.encre};">${esc(titre)}</h1>
      ${sousTitre ? `<p style="margin:7px 0 0;font:500 13px/1.3 ${T.sans};color:${T.encreDoux};">${esc(sousTitre)}</p>` : ''}
    </div>
    <div style="text-align:right;white-space:nowrap;">
      ${reference ? `<p style="margin:0 0 4px;font:700 11px/1 ${T.sans};color:${T.encre};">${esc(reference)}</p>` : ''}
      <p style="margin:0;font:400 10px/1 ${T.sans};color:${T.gris};">${d}</p>
    </div>
  </header>
  <div style="height:2px;background:linear-gradient(90deg,${T.accent} 0%,${T.accentPale} 62%,transparent 100%);
              margin-bottom:26px;"></div>`
}

/** Titre de section : petites capitales espacées, sobre. */
export function section(titre) {
  return `<p style="margin:26px 0 12px;font:700 9px/1 ${T.sans};letter-spacing:.16em;
                    text-transform:uppercase;color:${T.gris};">${esc(titre)}</p>`
}

/**
 * Paire libellé / valeur. `colonnes: 2` donne la grille des fiches de mesures.
 * Les valeurs numériques passent en chiffres tabulaires : sans cela les
 * colonnes de chiffres ne s'alignent pas verticalement.
 */
export function paires(entrees, { colonnes = 2 } = {}) {
  const cases = entrees.map(([libelle, valeur]) => `
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;
                padding:9px 0;border-bottom:1px solid ${T.filet};">
      <span style="font:500 11px/1.3 ${T.sans};color:${T.encreDoux};">${esc(libelle)}</span>
      <span style="font:600 13px/1 ${T.sans};color:${T.encre};font-variant-numeric:tabular-nums;
                   white-space:nowrap;">${esc(valeur)}</span>
    </div>`).join('')

  return `<div style="display:grid;grid-template-columns:repeat(${colonnes},1fr);gap:0 30px;">${cases}</div>`
}

/**
 * Tableau. `aligne: 'droite'` sur les colonnes de montants — un montant aligné
 * à gauche est illisible dès qu'on compare deux lignes.
 */
export function tableau({ colonnes, lignes, total = null }) {
  const th = colonnes.map(c => `
    <th style="padding:0 0 9px;text-align:${c.aligne === 'droite' ? 'right' : 'left'};
               font:700 9px/1 ${T.sans};letter-spacing:.12em;text-transform:uppercase;
               color:${T.gris};border-bottom:1px solid ${T.encre};">${esc(c.titre)}</th>`).join('')

  const tr = lignes.map((ligne, i) => `
    <tr style="background:${i % 2 ? T.fondDoux : 'transparent'};">
      ${ligne.map((cel, j) => `
        <td style="padding:10px 0;text-align:${colonnes[j]?.aligne === 'droite' ? 'right' : 'left'};
                   font:${colonnes[j]?.aligne === 'droite' ? '600' : '400'} 11.5px/1.4 ${T.sans};
                   color:${T.encre};font-variant-numeric:tabular-nums;
                   border-bottom:1px solid ${T.filet};">${esc(cel)}</td>`).join('')}
    </tr>`).join('')

  const pied = total ? `
    <tr>
      <td colspan="${colonnes.length - 1}" style="padding:14px 0 0;text-align:right;
          font:700 10px/1 ${T.sans};letter-spacing:.12em;text-transform:uppercase;color:${T.gris};">
        ${esc(total.libelle)}
      </td>
      <td style="padding:14px 0 0;text-align:right;font:700 17px/1 ${T.sans};
          color:${T.rouge};font-variant-numeric:tabular-nums;white-space:nowrap;">
        ${esc(total.valeur)}
      </td>
    </tr>` : ''

  return `<table style="width:100%;border-collapse:collapse;table-layout:auto;">
    <thead><tr>${th}</tr></thead><tbody>${tr}${pied}</tbody></table>`
}

/** Encart de note ou de mention (fond crème, filet d'accent à gauche). */
export function encart(titre, texte) {
  return `
  <div style="margin-top:22px;background:${T.fondDoux};border-left:2px solid ${T.accent};
              padding:13px 16px;">
    ${titre ? `<p style="margin:0 0 5px;font:700 9px/1 ${T.sans};letter-spacing:.14em;
                          text-transform:uppercase;color:${T.accentSombre};">${esc(titre)}</p>` : ''}
    <p style="margin:0;font:400 11.5px/1.55 ${T.sans};color:${T.encreDoux};">${esc(texte)}</p>
  </div>`
}

/** Pastille de statut (payé, en attente…). */
export function pastille(texte, ton = 'neutre') {
  const couleurs = {
    valide:  [T.vert, '#E8F3EE'],
    attente: [T.ambre, '#FBF2E0'],
    fort:    [T.rouge, '#FBE9E9'],
    neutre:  [T.encreDoux, T.fondDoux],
  }[ton] || [T.encreDoux, T.fondDoux]

  return `<span style="display:inline-block;padding:4px 11px;border-radius:999px;
    background:${couleurs[1]};color:${couleurs[0]};font:700 9px/1 ${T.sans};
    letter-spacing:.1em;text-transform:uppercase;">${esc(texte)}</span>`
}

/**
 * Conteneur de page. Retourne le nœud à passer à html2canvas ; l'appelant le
 * retire du DOM après capture.
 */
export function page(contenu) {
  const el = document.createElement('div')
  el.style.cssText = `position:fixed;left:-9999px;top:0;width:${T.largeur}px;
    padding:${T.marge}px ${T.marge}px ${T.marge + 18}px;background:${T.blanc};
    color:${T.encre};font-family:${T.sans};-webkit-font-smoothing:antialiased;`
  el.innerHTML = contenu
  document.body.appendChild(el)

  return el
}

/** Échappement : les données viennent de la saisie utilisateur. */
export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}
