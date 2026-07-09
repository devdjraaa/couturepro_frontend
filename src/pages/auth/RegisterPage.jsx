import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Check, X, ArrowRight, MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Input, Button, Select, PhoneInput, LanguageSwitcher } from '@/components/ui'
import { cn } from '@/utils/cn'

const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { register, verifyOtp, resendOtp } = useAuth()

  const CUSTOM_VALUE = '__custom__'
  const QUESTIONS_SECRETE = [
    { value: 'Quel est le nom de votre premier animal de compagnie ?',  label: 'Nom de votre premier animal ?' },
    { value: "Quel est le prénom de votre meilleure amie d'enfance ?", label: "Prénom de votre meilleure amie d'enfance ?" },
    { value: 'Quelle est la ville où vous êtes né(e) ?',                label: 'Ville de naissance ?' },
    { value: 'Quel est le nom de votre école primaire ?',               label: 'Nom de votre école primaire ?' },
    { value: CUSTOM_VALUE, label: t('auth.inscription.question_personnalisee') },
  ]

  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [form, setForm] = useState({
    nom: '', prenom: '', telephone: '', email: '', nom_atelier: '',
    type: 'artisan', // artisan (défaut) | designer
    password: '', password_confirmation: '',
    question_secrete: QUESTIONS_SECRETE[0].value,
    question_secrete_custom: '', reponse_secrete: '',
  })
  const [otp, setOtp]         = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd]             = useState(false)
  const [showPwdConfirm, setShowPwdConfirm] = useState(false)
  const [accepteCgu, setAccepteCgu]       = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleRegister = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirmation) { setError(t('auth.inscription.mdp_non_concordants')); return }
    const finalQuestion = form.question_secrete === CUSTOM_VALUE ? form.question_secrete_custom.trim() : form.question_secrete
    if (form.question_secrete === CUSTOM_VALUE && !finalQuestion) { setError(t('auth.inscription.question_personnalisee_requise')); return }
    if (!accepteCgu) { setError(t('auth.inscription.cgu_requis')); return }
    setLoading(true)
    try {
      const { question_secrete_custom, ...rest } = form
      await register({ ...rest, question_secrete: finalQuestion })
      setStep('otp')
    } catch (err) {
      setError(err.message || t('erreurs.inconnu'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp({ telephone: form.telephone, code: otp })
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(err.message || t('erreurs.otp_invalide'))
    } finally {
      setLoading(false)
    }
  }

  const pwdMatch = form.password_confirmation ? form.password === form.password_confirmation : null

  /* ── Étape OTP ── */
  if (step === 'otp') {
    return (
      <AuthLayout subtitle={t('auth.otp.sous_titre_tel', { telephone: form.telephone })}>
        <div className="flex justify-end mb-5">
          <LanguageSwitcher variant="badge" />
        </div>

        {/* Icône visuelle */}
        <div className="flex flex-col items-center mb-6 gap-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-gold-soft)', border: '1px solid var(--color-hair-gold)' }}>
            <MessageSquare size={22} style={{ color: 'var(--color-gold)' }} />
          </div>
          <p className="text-sm text-dim text-center">{t('auth.otp.instruction')}</p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {/* Grand champ OTP */}
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="— — — — — —"
            maxLength={6}
            required
            className="w-full h-16 bg-elevated border border-edge rounded-2xl text-center text-2xl tracking-[.5em] font-mono font-bold text-ink input-couture-focus transition-colors duration-150 placeholder:text-ghost placeholder:tracking-normal"
          />

          {error && (
            <p className="text-sm text-danger text-center py-1.5 px-3 rounded-xl bg-danger/10 border border-danger/20">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
            {t('auth.otp.verifier')}
          </Button>

          <div className="flex flex-col items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => resendOtp(form.telephone)}
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--color-gold)' }}
            >
              {t('auth.otp.renvoyer')}
            </button>
            <button
              type="button"
              onClick={() => { setStep('form'); setError('') }}
              className="text-sm text-ghost hover:text-dim transition-colors"
            >
              ← {t('commun.retour')}
            </button>
          </div>
        </form>
      </AuthLayout>
    )
  }

  /* ── Formulaire d'inscription ── */
  return (
    <AuthLayout subtitle={t('auth.inscription.sous_titre_register')}>
      <div className="flex justify-end mb-5">
        <LanguageSwitcher variant="badge" />
      </div>

      <form onSubmit={handleRegister} className="space-y-4">

        {/* Section : Identité */}
        <p className="section-label">{t('commun.identite') || 'Identité'}</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('commun.prenom')} value={form.prenom} onChange={set('prenom')} placeholder="Aminata" required />
          <Input label={t('commun.nom')}    value={form.nom}    onChange={set('nom')}    placeholder="Diallo"  required />
        </div>
        <PhoneInput label={t('commun.telephone')} value={form.telephone} onChange={set('telephone')} required />
        <Input label={t('commun.email')} type="email" value={form.email} onChange={set('email')} placeholder="aminata@atelier.com" required />

        {/* Section : Atelier */}
        <p className="section-label mt-2">{t('auth.inscription.nom_atelier') || 'Votre atelier'}</p>
        <Input label={t('auth.inscription.nom_atelier')} value={form.nom_atelier} onChange={set('nom_atelier')} placeholder="Atelier Aminata" required />

        {/* Type de compte : artisan (gestion d'atelier) ou designer (+ vitrine publique) */}
        <p className="section-label mt-2">{t('parametres.type_compte.titre')}</p>
        <div className="grid grid-cols-2 gap-3">
          {['artisan', 'designer'].map(tp => (
            <button
              type="button"
              key={tp}
              onClick={() => setForm(f => ({ ...f, type: tp }))}
              className={cn(
                'text-left p-3 rounded-xl border transition',
                form.type === tp ? 'border-primary bg-primary/5' : 'border-edge bg-card',
              )}
            >
              <p className="font-semibold text-sm text-ink">{t(`parametres.type_compte.${tp}`)}</p>
              <p className="text-xs text-dim mt-0.5">{t(`parametres.type_compte.${tp}_desc`)}</p>
            </button>
          ))}
        </div>

        {/* Section : Mot de passe */}
        <p className="section-label mt-2">{t('commun.securite') || 'Sécurité'}</p>
        <Input
          label={t('auth.inscription.mot_de_passe')}
          type={showPwd ? 'text' : 'password'}
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
          required
          suffix={
            <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)} className="hover:text-ink transition-colors">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <Input
          label={t('auth.inscription.confirmer_mot_de_passe')}
          type={showPwdConfirm ? 'text' : 'password'}
          value={form.password_confirmation}
          onChange={set('password_confirmation')}
          placeholder="••••••••"
          required
          error={pwdMatch === false ? t('auth.inscription.mdp_non_concordants') : undefined}
          suffix={
            <div className="flex items-center gap-1">
              {pwdMatch !== null && (
                pwdMatch
                  ? <Check size={14} className="text-success" />
                  : <X     size={14} className="text-danger"  />
              )}
              <button type="button" tabIndex={-1} onClick={() => setShowPwdConfirm(v => !v)} className="hover:text-ink transition-colors">
                {showPwdConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          }
        />

        {/* Section : Question secrète */}
        <p className="section-label mt-2">{t('auth.inscription.question_secrete') || 'Question secrète'}</p>
        <Select
          label={t('auth.inscription.question_secrete')}
          value={form.question_secrete}
          onChange={set('question_secrete')}
          options={QUESTIONS_SECRETE}
          required
        />
        {form.question_secrete === CUSTOM_VALUE && (
          <Input
            label={t('auth.inscription.question_personnalisee_label')}
            value={form.question_secrete_custom}
            onChange={set('question_secrete_custom')}
            placeholder={t('auth.inscription.question_personnalisee_placeholder')}
            required
          />
        )}
        <Input
          label={t('auth.inscription.reponse_secrete')}
          value={form.reponse_secrete}
          onChange={set('reponse_secrete')}
          placeholder={t('auth.inscription.reponse_secrete_placeholder')}
          required
        />

        {/* CGU */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none mt-1">
          <div
            onClick={() => setAccepteCgu(v => !v)}
            className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150',
              accepteCgu ? 'bg-primary border-transparent' : 'border-edge bg-elevated',
            )}
          >
            {accepteCgu && <Check size={11} className="text-white" strokeWidth={3} />}
          </div>
          <span className="text-sm text-dim leading-snug">
            {t('auth.inscription.accepter_cgu_debut')}{' '}
            <Link to="/a-propos" className="underline underline-offset-2" style={{ color: 'var(--color-gold)' }}>
              {t('auth.inscription.accepter_cgu_lien')}
            </Link>
          </span>
        </label>

        {error && (
          <p className="text-sm text-danger text-center py-1.5 px-3 rounded-xl bg-danger/10 border border-danger/20">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
          {t('auth.inscription.creer_compte')}
        </Button>

        <p className="text-center text-sm text-dim pt-1">
          {t('auth.inscription.deja_inscrit')}{' '}
          <Link to="/login" className="font-semibold underline underline-offset-2" style={{ color: 'var(--color-gold)' }}>
            {t('auth.inscription.se_connecter')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
