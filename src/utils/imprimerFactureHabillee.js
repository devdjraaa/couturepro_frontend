// Façon A — « habillage » GEXTIMO d'une facture normalisée e-SFE.
// On NE reconstruit RIEN : le PDF officiel (déjà certifié par la DGI) est
// embarqué tel quel dans une iframe, avec un en-tête GEXTIMO au-dessus et le
// pied de vérification en dessous. GEXTIMO habille, il ne certifie pas.
//
// Le pied (URL officielle de vérification + disclaimer) reproduit le composant
// fourni : il complète le QR officiel, il ne le remplace pas.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
))

export function imprimerFactureHabillee(doc, atelier) {
  const pdfUrl = doc?.dgi_pdf_url
  if (!pdfUrl) return false

  const nom     = esc(atelier?.nom || 'Mon atelier')
  const logo    = atelier?.logo_url ? esc(atelier.logo_url) : null
  const ville   = esc(atelier?.ville || '')
  const contact = esc(atelier?.telephone || atelier?.contact_public || '')
  const numero  = esc(doc?.numero || '')

  const html = `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Facture ${numero} — ${nom}</title>
<style>
  :root{
    --gx-ink:#1f2937; --gx-muted:#6b7280;
    --gx-accent:#D00B0B;       /* charte GEXTIMO (rouge) */
    --gx-line:#e5e7eb; --gx-bg:#fafafa;
  }
  *{ box-sizing:border-box; }
  html,body{ margin:0; padding:0; background:#fff; color:var(--gx-ink);
    font-family:"DM Sans", Arial, sans-serif; }
  .gx-page{ max-width:800px; margin:0 auto; padding:16px; }

  /* En-tête GEXTIMO (habillage) */
  .gx-head{ display:flex; align-items:center; gap:14px;
    border-bottom:2px solid var(--gx-accent); padding-bottom:10px; margin-bottom:12px; }
  .gx-head img{ width:54px; height:54px; object-fit:contain; border-radius:8px; }
  .gx-head .gx-atelier b{ font-family:"Outfit",Arial,sans-serif; font-size:18px; color:var(--gx-ink); }
  .gx-head .gx-atelier span{ display:block; color:var(--gx-muted); font-size:11px; }
  .gx-head .gx-brand{ margin-left:auto; text-align:right; }
  .gx-head .gx-brand b{ font-family:"Outfit",Arial,sans-serif; font-weight:700; letter-spacing:.5px; color:var(--gx-accent); font-size:15px; }
  .gx-head .gx-brand span{ display:block; color:var(--gx-muted); font-size:10px; }

  /* PDF officiel e-SFE — embarqué INTACT, jamais modifié */
  .gx-doc{ width:100%; height:1000px; border:1px solid var(--gx-line); border-radius:6px; }

  /* Pied de vérification (complète le QR officiel) */
  .gx-footer{ border-top:2px solid var(--gx-accent); background:var(--gx-bg);
    padding:10px 16px; margin-top:12px; display:flex; align-items:center;
    justify-content:space-between; gap:16px; font-size:11px; line-height:1.45; }
  .gx-wordmark b{ font-family:"Outfit",Arial,sans-serif; font-weight:700; letter-spacing:.5px; font-size:15px; color:var(--gx-accent); }
  .gx-wordmark span{ color:var(--gx-muted); font-size:10px; }
  .gx-verify{ text-align:right; max-width:62%; }
  .gx-verify .gx-title{ font-weight:600; color:var(--gx-ink); }
  .gx-verify .gx-url{ color:var(--gx-accent); font-weight:600; text-decoration:none; }
  .gx-verify .gx-note{ color:var(--gx-muted); font-size:10px; margin-top:2px; }
  .gx-disclaimer{ font-size:9px; color:var(--gx-muted); text-align:center; padding:4px 16px 0; }

  .gx-print{ position:fixed; top:12px; right:12px; background:var(--gx-accent); color:#fff;
    border:0; padding:10px 16px; border-radius:10px; font-weight:600; cursor:pointer; }

  @media print{
    .gx-print{ display:none; }
    .gx-footer,.gx-disclaimer{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .gx-footer{ break-inside:avoid; }
    .gx-doc{ height:auto; min-height:900px; border:0; }
  }
</style></head>
<body>
  <button class="gx-print" onclick="window.print()">Imprimer</button>
  <div class="gx-page">
    <div class="gx-head">
      ${logo ? `<img src="${logo}" alt="${nom}" />` : ''}
      <div class="gx-atelier"><b>${nom}</b><span>${[ville, contact].filter(Boolean).join(' · ')}</span></div>
      <div class="gx-brand"><b>GEXTIMO</b><span>By Novafriq</span></div>
    </div>

    <!-- Facture normalisée e-SFE (DGI) — embarquée telle quelle -->
    <iframe class="gx-doc" src="${pdfUrl}" title="Facture normalisée"></iframe>

    <div class="gx-footer">
      <div class="gx-wordmark"><b>GEXTIMO</b><span>By Novafriq</span></div>
      <div class="gx-verify">
        <div class="gx-title">Facture normalisée certifiée e-MECeF — DGI Bénin</div>
        <div>Vérification : <a class="gx-url" href="https://sygmef.impots.bj/verification">sygmef.impots.bj/verification</a></div>
        <div class="gx-note">Saisir le <b>CODE MECeF/DGI</b> et le <b>NIM</b> figurant sur la facture ci-dessus.</div>
      </div>
    </div>
    <div class="gx-disclaimer">
      Mise en page GEXTIMO. Les éléments de sécurité (NIM, code MECeF/DGI, signature et QR code) sont
      exclusivement ceux de la facture normalisée e-MECeF reproduite ci-dessus, sans aucune modification.
    </div>
  </div>
</body></html>`

  const w = window.open('', '_blank')
  if (!w) return false // popup bloqué
  w.document.open()
  w.document.write(html)
  w.document.close()
  return true
}
