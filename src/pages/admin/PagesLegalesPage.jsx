// Pages légales du footer éditables — éditeur riche type Word (gras, titres, listes,
// liens…). Le contenu part en base ; la vitrine l'affiche immédiatement. Tant qu'une
// page n'est pas personnalisée, la vitrine garde son texte historique (fallback i18n),
// que l'on peut importer ici comme point de départ.
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, Eraser, Save, FileText, Download, CheckCircle2,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin'
import adminApi from '@/services/adminApi'
import i18n from '@/lang/i18n'
import { cn } from '@/utils/cn'

const INPUT = 'w-full border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

/* ── Éditeur riche (contentEditable + barre d'outils) ────────────────────── */
function RichEditor({ html, onChange }) {
  const { t } = useTranslation()
  const ref = useRef(null)

  // On n'écrase le DOM que si le contenu vient d'ailleurs (changement de page/onglet).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (html || '')) ref.current.innerHTML = html || ''
  }, [html])

  const cmd = (name, value = null) => {
    ref.current?.focus()
    document.execCommand(name, false, value)
    onChange(ref.current?.innerHTML || '')
  }
  const lien = () => {
    const url = window.prompt(t('admin.pages.lien_prompt'))
    if (url) cmd('createLink', url)
  }

  const BTN = 'p-1.5 rounded-lg text-dim hover:text-ink hover:bg-subtle transition'
  return (
    <div className="border border-edge rounded-xl overflow-hidden bg-card">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-edge bg-subtle/60 flex-wrap">
        <button type="button" onClick={() => cmd('bold')} title={t('admin.pages.gras')} className={BTN}><Bold size={15} /></button>
        <button type="button" onClick={() => cmd('italic')} title={t('admin.pages.italique')} className={BTN}><Italic size={15} /></button>
        <button type="button" onClick={() => cmd('underline')} title={t('admin.pages.souligne')} className={BTN}><Underline size={15} /></button>
        <span className="w-px h-4 bg-edge mx-1" />
        <button type="button" onClick={() => cmd('formatBlock', 'h2')} title={t('admin.pages.titre2')} className={BTN}><Heading2 size={15} /></button>
        <button type="button" onClick={() => cmd('formatBlock', 'h3')} title={t('admin.pages.titre3')} className={BTN}><Heading3 size={15} /></button>
        <button type="button" onClick={() => cmd('formatBlock', 'p')} title={t('admin.pages.paragraphe')} className={cn(BTN, 'text-[11px] font-bold w-7')}>P</button>
        <span className="w-px h-4 bg-edge mx-1" />
        <button type="button" onClick={() => cmd('insertUnorderedList')} title={t('admin.pages.liste')} className={BTN}><List size={15} /></button>
        <button type="button" onClick={() => cmd('insertOrderedList')} title={t('admin.pages.liste_num')} className={BTN}><ListOrdered size={15} /></button>
        <button type="button" onClick={lien} title={t('admin.pages.lien')} className={BTN}><LinkIcon size={15} /></button>
        <span className="w-px h-4 bg-edge mx-1" />
        <button type="button" onClick={() => cmd('removeFormat')} title={t('admin.pages.nettoyer')} className={BTN}><Eraser size={15} /></button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || '')}
        className="min-h-[380px] max-h-[60vh] overflow-y-auto p-4 text-[14px] text-ink leading-relaxed outline-none
                   [&_h2]:font-bold [&_h2]:text-[17px] [&_h2]:mt-4 [&_h2]:mb-1.5
                   [&_h3]:font-semibold [&_h3]:text-[15px] [&_h3]:mt-3 [&_h3]:mb-1
                   [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
      />
    </div>
  )
}

/* ── Conversion du texte i18n historique → HTML (point de départ de l'éditeur) ── */
function i18nVersHtml(cle, lang) {
  const T = i18n.getFixedT(lang)
  const base = `vitrine.legal_pages.${cle}`
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  let html = ''
  const subtitle = T(`${base}.subtitle`, { defaultValue: '' })
  const date = T(`${base}.date`, { defaultValue: '' })
  if (subtitle) html += `<p><i>${esc(subtitle)}</i></p>`
  if (date) html += `<p><i>${esc(date)}</i></p>`

  const articles = T(`${base}.articles`, { returnObjects: true, defaultValue: null })
  const sections = T(`${base}.sections`, { returnObjects: true, defaultValue: null })

  if (Array.isArray(articles) && articles.length) {
    for (const a of articles) {
      html += `<h2>${esc(a.title)}</h2>`
      for (const b of (Array.isArray(a.blocks) ? a.blocks : [])) {
        if (b.type === 'p') html += `<p>${esc(b.t)}</p>`
        else if (b.type === 'subtitle') html += `<h3>${esc(b.t)}</h3>`
        else if (b.type === 'list') html += `<ul>${(b.items || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
        else if (b.type === 'table') {
          html += `<table><tr>${(b.headers || []).map((h) => `<th>${esc(h)}</th>`).join('')}</tr>`
          html += (b.rows || []).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')
          html += '</table>'
        } else if (b.type === 'box') html += `${b.title ? `<h3>${esc(b.title)}</h3>` : ''}<blockquote>${esc(b.t)}</blockquote>`
        else if (b.type === 'permission') html += `<p><b>${esc(b.name)}</b> — ${esc(b.t)}</p>`
      }
    }
  } else if (Array.isArray(sections) && sections.length) {
    for (const s of sections) html += `<h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>`
  }
  return html
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function PagesLegalesPage() {
  const { t } = useTranslation()
  const [liste, setListe] = useState([])
  const [cle, setCle] = useState(null)
  const [langue, setLangue] = useState('fr')
  const [form, setForm] = useState({ titre_fr: '', titre_en: '', contenu_fr: '', contenu_en: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const chargerListe = () => adminApi.get('/pages').then(({ data }) => setListe(data)).catch(() => {})
  useEffect(() => { chargerListe() }, [])

  const ouvrir = async (c) => {
    setCle(c); setSaved(false); setLangue('fr')
    const { data } = await adminApi.get(`/pages/${c}`)
    setForm({
      titre_fr: data.titre_fr || t(`vitrine.legal_pages.${c}.title`, { lng: 'fr', defaultValue: '' }),
      titre_en: data.titre_en || t(`vitrine.legal_pages.${c}.title`, { lng: 'en', defaultValue: '' }),
      contenu_fr: data.contenu_fr || '',
      contenu_en: data.contenu_en || '',
    })
  }

  const importer = () => {
    setForm((f) => ({
      ...f,
      [`contenu_${langue}`]: i18nVersHtml(cle, langue),
    }))
  }

  const enregistrer = async () => {
    setSaving(true)
    try {
      await adminApi.put(`/pages/${cle}`, form)
      setSaved(true); setTimeout(() => setSaved(false), 2000)
      chargerListe()
    } finally {
      setSaving(false)
    }
  }

  const champContenu = `contenu_${langue}`
  const champTitre = `titre_${langue}`

  return (
    <AdminLayout title={t('admin.pages.titre')}>
      <p className="text-sm text-dim mb-5">{t('admin.pages.sous_titre')}</p>

      <div className="grid lg:grid-cols-[260px_1fr] gap-5 items-start">
        {/* Liste des pages */}
        <div className="bg-card border border-edge rounded-2xl p-2 space-y-0.5">
          {liste.map((p) => (
            <button key={p.cle} onClick={() => ouvrir(p.cle)}
                    className={cn('w-full text-left px-3 py-2.5 rounded-xl text-[13.5px] flex items-center gap-2 transition',
                      cle === p.cle ? 'bg-primary/10 text-primary font-semibold' : 'text-dim hover:bg-subtle hover:text-ink')}>
              <FileText size={14} className="flex-none" />
              <span className="flex-1 truncate">{t(`vitrine.legal_pages.${p.cle}.title`, { defaultValue: p.cle })}</span>
              {p.personnalise && <span className="w-2 h-2 rounded-full bg-primary flex-none" title={t('admin.pages.personnalisee')} />}
            </button>
          ))}
        </div>

        {/* Éditeur */}
        {cle ? (
          <div className="bg-card border border-edge rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-1 bg-subtle rounded-xl p-1">
                {['fr', 'en'].map((l) => (
                  <button key={l} onClick={() => setLangue(l)}
                          className={cn('px-4 py-1.5 rounded-lg text-[12.5px] font-bold uppercase transition',
                            langue === l ? 'bg-card text-ink shadow-sm' : 'text-ghost hover:text-dim')}>
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {!form[champContenu] && (
                  <button onClick={importer} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline">
                    <Download size={14} />{t('admin.pages.importer')}
                  </button>
                )}
                <button onClick={enregistrer} disabled={saving}
                        className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded-xl bg-primary text-inverse hover:opacity-90 transition disabled:opacity-60">
                  {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
                  {saved ? t('admin.pages.enregistree') : t('admin.pages.enregistrer')}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-ghost">{t('admin.pages.titre_page')}</label>
              <input value={form[champTitre]} onChange={(e) => setForm((f) => ({ ...f, [champTitre]: e.target.value }))} className={INPUT + ' mt-1'} />
            </div>

            <RichEditor html={form[champContenu]} onChange={(html) => setForm((f) => ({ ...f, [champContenu]: html }))} />
            <p className="text-[11.5px] text-ghost">{t('admin.pages.note')}</p>
          </div>
        ) : (
          <div className="bg-card border border-edge rounded-2xl p-10 text-center text-dim text-sm">
            {t('admin.pages.choisir')}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
