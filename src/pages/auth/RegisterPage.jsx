import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Input, Button, Select, PhoneInput, LanguageSwitcher } from '@/components/ui'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { register, verifyOtp, resendOtp } = useAuth()

  const CUSTOM_VALUE = '__custom__'
  const QUESTIONS_SECRETE = [
    { value: 'Quel est le nom de votre premier animal de compagnie ?', label: 'Nom de votre premier animal de compagnie ?' },
    { value: 'Quel est le prénom de votre meilleure amie d\'enfance ?', label: 'Prénom de votre meilleure amie d\'enfance ?' },
    { value: 'Quelle est la ville où vous êtes né(e) ?', label: 'Ville de naissance ?' },
    { value: 'Quel est le nom de votre école primaire ?', label: 'Nom de votre école primaire ?' },
    { value: CUSTOM_VALUE, label: t('auth.inscription.question_personnalisee') },
  ]
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    nom_atelier: '',
    password: '',
    password_confirmation: '',
    question_secrete: QUESTIONS_SECRETE[0].value,
    question_secrete_custom: '',
    reponse_secrete: '',
  })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showPwdConfirm, setShowPwdConfirm] = useState(false)
  const [accepteCgu, setAccepteCgu] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleRegister = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirmation) {
      setError(t('auth.inscription.mdp_non_concordants'))
      return
    }
    // Si question personnalisée : utiliser le texte saisi
    const finalQuestion = form.question_secrete === CUSTOM_VALUE
      ? form.question_secrete_custom.trim()
      : form.question_secrete
    if (form.question_secrete === CUSTOM_VALUE && !finalQuestion) {
      setError(t('auth.inscription.question_personnalisee_requise'))
      return
    }
    if (!accepteCgu) {
      setError(t('auth.inscription.cgu_requis'))
      return
    }
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

  if (step === 'otp') {
    return (
      <AuthLayout subtitle={t('auth.otp.sous_titre_tel', { telephone: form.telephone })}>
        <div className="flex justify-end mb-4">
          <LanguageSwitcher variant="badge" />
        </div>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            label={t('auth.otp.code')}
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="000000"
            maxLength={6}
            required
          />
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {t('auth.otp.verifier')}
          </Button>
          <button
            type="button"
            onClick={() => resendOtp(form.telephone)}
            className="w-full text-sm text-dim underline py-2"
          >
            {t('auth.otp.renvoyer')}
          </button>
          <button
            type="button"
            onClick={() => { setStep('form'); setError('') }}
            className="w-full text-sm text-ghost hover:text-ink transition-colors py-1"
          >
            ← {t('commun.retour')}
          </button>
        </form>
      </AuthLayout>
    )
  }

  const pwdMatch = form.password_confirmation
    ? form.password === form.password_confirmation
    : null

  return (
    <AuthLayout subtitle={t('auth.inscription.sous_titre_register')}>
      <div className="flex justify-end mb-4">
        <LanguageSwitcher variant="badge" />
      </div>
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('commun.prenom')}
            value={form.prenom}
            onChange={set('prenom')}
            placeholder="Aminata"
            required
          />
          <Input
            label={t('commun.nom')}
            value={form.nom}
            onChange={set('nom')}
            placeholder="Diallo"
            required
          />
        </div>
        <PhoneInput
          label={t('commun.telephone')}
          value={form.telephone}
          onChange={set('telephone')}
          required
        />
        <Input
          label={t('commun.email')}
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="aminata@atelier.com"
          required
        />
        <Input
          label={t('auth.inscription.nom_atelier')}
          value={form.nom_atelier}
          onChange={set('nom_atelier')}
          placeholder="Atelier Aminata"
          required
        />
        <Input
          label={t('auth.inscription.mot_de_passe')}
          type={showPwd ? 'text' : 'password'}
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
          required
          suffix={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Masquer' : 'Voir'}
              className="hover:text-ink transition-colors"
            >
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
                  : <X size={14} className="text-danger" />
              )}
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPwdConfirm(v => !v)}
                aria-label={showPwdConfirm ? 'Masquer' : 'Voir'}
                className="hover:text-ink transition-colors"
              >
                {showPwdConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          }
        />
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
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={accepteCgu}
            onChange={e => setAccepteCgu(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-edge accent-primary shrink-0"
          />
          <span className="text-sm text-ghost leading-snug">
            {t('auth.inscription.accepter_cgu_debut')}{' '}
            <Link to="/a-propos" className="underline text-primary hover:text-primary/80">
              {t('auth.inscription.accepter_cgu_lien')}
            </Link>
          </span>
        </label>

        {error && <p className="text-sm text-danger text-center">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          {t('auth.inscription.creer_compte')}
        </Button>
        <p className="text-center text-sm text-dim">
          {t('auth.inscription.deja_inscrit')}{' '}
          <Link to="/login" className="text-primary font-medium">
            {t('auth.inscription.se_connecter')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
