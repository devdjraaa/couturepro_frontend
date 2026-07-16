// Brief 16/07 (pt 1) : widget chatbot vitrine — bulle flottante, fil de discussion,
// feedback pouce haut/bas, reprise de session, note de confidentialité (échanges enregistrés).
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown } from 'lucide-react'
import { API_BASE_URL } from '@/constants/config'
import { getClientToken } from './espaceClientApi'

function sessionId() {
  try {
    let s = sessionStorage.getItem('gx_session_id')
    if (!s) {
      s = (crypto?.randomUUID?.() || `s-${Date.now()}-${Math.random().toString(36).slice(2)}`).slice(0, 64)
      sessionStorage.setItem('gx_session_id', s)
    }
    return s
  } catch { return 'anon' }
}

async function api(path, body) {
  const token = getClientToken()
  const r = await fetch(`${API_BASE_URL}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!r.ok) throw new Error('chatbot_api')
  return r.json()
}

export default function ChatWidget() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([]) // {id, question, reponse, utile}
  const [saisie, setSaisie] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const bas = useRef(null)

  // Reprise du fil de la session à la première ouverture.
  useEffect(() => {
    if (!open || messages.length) return
    api(`/vitrine/chatbot/historique?session_id=${encodeURIComponent(sessionId())}`)
      .then((d) => { setConversationId(d.conversation_id); setMessages(d.messages || []) })
      .catch(() => {})
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { bas.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, open])

  const envoyer = async () => {
    const q = saisie.trim()
    if (!q || loading) return
    setSaisie('')
    setLoading(true)
    setMessages((m) => [...m, { id: 'tmp', question: q, reponse: null }])
    try {
      const d = await api('/vitrine/chatbot/message', {
        session_id: sessionId(), message: q, conversation_id: conversationId,
        langue: i18n.language?.startsWith('en') ? 'en' : 'fr',
      })
      setConversationId(d.conversation_id)
      setMessages((m) => m.map((x) => x.id === 'tmp' ? { id: d.message_id, question: q, reponse: d.reponse, utile: null } : x))
    } catch {
      setMessages((m) => m.map((x) => x.id === 'tmp' ? { ...x, reponse: t('vitrine.chatbot.erreur') } : x))
    } finally {
      setLoading(false)
    }
  }

  const noter = async (id, utile) => {
    setMessages((m) => m.map((x) => x.id === id ? { ...x, utile } : x))
    try { await api('/vitrine/chatbot/feedback', { message_id: id, session_id: sessionId(), utile }) } catch { /* silencieux */ }
  }

  return (
    <>
      {/* Bulle flottante */}
      <button onClick={() => setOpen((v) => !v)} aria-label={t('vitrine.chatbot.ouvrir')}
              className="fixed bottom-5 right-5 z-[90] w-13 h-13 p-3.5 rounded-full bg-primary text-inverse shadow-lg hover:bg-primary-600 transition">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-21 right-5 z-[90] w-[min(92vw,360px)] h-[min(70vh,480px)] bg-card border border-edge rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-inset text-ink" data-theme="dark">
            <p className="font-display font-bold text-[15px]">{t('vitrine.chatbot.titre')}</p>
            <p className="text-[11px] text-dim">{t('vitrine.chatbot.confidentialite')}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="bg-subtle rounded-xl rounded-tl-sm px-3 py-2.5 text-[13px] text-ink max-w-[85%]">
                {t('vitrine.chatbot.accueil')}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={m.id + i} className="space-y-2">
                <div className="flex justify-end">
                  <div className="bg-primary text-inverse rounded-xl rounded-tr-sm px-3 py-2.5 text-[13px] max-w-[85%]">{m.question}</div>
                </div>
                {m.reponse === null ? (
                  <div className="bg-subtle rounded-xl rounded-tl-sm px-3 py-2.5 text-[13px] text-ghost max-w-[85%]">…</div>
                ) : (
                  <div className="max-w-[85%]">
                    <div className="bg-subtle rounded-xl rounded-tl-sm px-3 py-2.5 text-[13px] text-ink whitespace-pre-line">{m.reponse}</div>
                    {m.id !== 'tmp' && (
                      <div className="flex gap-1 mt-1 pl-1">
                        <button onClick={() => noter(m.id, true)} aria-label={t('vitrine.chatbot.utile')}
                                className={'p-1 rounded transition ' + (m.utile === true ? 'text-primary' : 'text-ghost hover:text-primary')}>
                          <ThumbsUp size={13} />
                        </button>
                        <button onClick={() => noter(m.id, false)} aria-label={t('vitrine.chatbot.inutile')}
                                className={'p-1 rounded transition ' + (m.utile === false ? 'text-danger' : 'text-ghost hover:text-danger')}>
                          <ThumbsDown size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={bas} />
          </div>

          <div className="p-2.5 border-t border-edge flex gap-2">
            <input value={saisie} onChange={(e) => setSaisie(e.target.value)}
                   onKeyDown={(e) => { if (e.key === 'Enter') envoyer() }}
                   placeholder={t('vitrine.chatbot.placeholder')}
                   className="flex-1 rounded-xl px-3 py-2.5 text-[13px] outline-none text-ink bg-subtle border border-edge placeholder:text-ghost focus:border-primary transition" />
            <button onClick={envoyer} disabled={loading || !saisie.trim()} aria-label={t('vitrine.chatbot.envoyer')}
                    className="px-3.5 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition disabled:opacity-50">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
