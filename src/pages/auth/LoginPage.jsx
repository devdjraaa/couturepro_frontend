import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Input, Button, LanguageSwitcher, PhoneInput } from '@/components/ui'
import { ROUTES, IS_NATIVE } from '@/constants/routes'
import { cn } from '@/utils/cn'

function getOrCreateDeviceId() {
  const key = 'cp_device_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)' // ease-in-out cinématique

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { login, equipeLogin } = useAuth()
  const [tab, setTab]         = useState('proprietaire')
  const [propError, setPropError] = useState('')
  const [equipeError, setEquipeError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPropPwd, setShowPropPwd] = useState(false)
  const [showEqPwd,   setShowEqPwd]   = useState(false)
  const [rememberMe,  setRememberMe]  = useState(true)

  const [propForm, setPropForm]   = useState({ telephone: '', password: '' })
  const setProp = key => e => setPropForm(f => ({ ...f, [key]: e.target.value }))

  const [equipeForm, setEquipeForm] = useState({ code_acces: '', password: '' })
  const setEq = key => e => setEquipeForm(f => ({ ...f, [key]: e.target.value }))

  const formatLoginError = err => {
    if (err?.code === 'reseau')          return t('erreurs.reseau_login')
    if (err?.code === 'session_expiree') return err?.message || t('erreurs.mot_de_passe_invalide')
    return err?.message || t('erreurs.mot_de_passe_invalide')
  }

  const switchTab = next => {
    setTab(next)
    setPropError('')
    setEquipeError('')
  }

  const handlePropLogin = async e => {
    e.preventDefault()
    setPropError('')
    setLoading(true)
    try {
      const { atelier } = await login(propForm)
      if (!IS_NATIVE && atelier?.type === 'artisan') {
        navigate('/artisan-app', { replace: true })
      } else {
        navigate(ROUTES.DASHBOARD, { replace: true })
      }
    } catch (err) {
      // P147 : téléphone non vérifié → au lieu de bloquer, on envoie vers l'OTP (renvoi + saisie).
      if (err?.serverCode === 'telephone_non_verifie') {
        navigate(ROUTES.OTP, { state: { telephone: propForm.telephone } })
        return
      }
      setPropError(formatLoginError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleEquipeLogin = async e => {
    e.preventDefault()
    setEquipeError('')
    setLoading(true)
    try {
      await equipeLogin({
        code_acces: equipeForm.code_acces.trim().toUpperCase(),
        password:   equipeForm.password,
        device_id:  getOrCreateDeviceId(),
      })
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      setEquipeError(formatLoginError(err))
    } finally {
      setLoading(false)
    }
  }

  const isProp = tab === 'proprietaire'

  return (
    <AuthLayout subtitle={t('auth.connexion.sous_titre_login')}>

      {/* Langue */}
      <div className="flex justify-end mb-5">
        <LanguageSwitcher variant="badge" />
      </div>

      {/* Segmented control */}
      <div
        className="flex rounded-xl p-1 mb-6 gap-1"
        style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
      >
        {[
          { key: 'proprietaire', label: t('auth.connexion.onglet_proprietaire') },
          { key: 'equipe',       label: t('auth.connexion.onglet_equipe') },
        ].map(t_ => (
          <button
            key={t_.key}
            type="button"
            onClick={() => switchTab(t_.key)}
            className={cn(
              'flex-1 text-sm py-2.5 rounded-[10px] font-semibold relative overflow-hidden',
              'transition-colors duration-200',
              tab === t_.key ? 'btn-primary-couture text-white' : 'text-ghost hover:text-dim',
            )}
          >
            {t_.label}
          </button>
        ))}
      </div>

      {/* ── Slider horizontal — les deux formulaires coexistent ── */}
      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            width: '200%',
            transform: isProp ? 'translateX(0%)' : 'translateX(-50%)',
            transition: `transform 360ms ${EASING}`,
            willChange: 'transform',
          }}
        >

          {/* ── Panneau Propriétaire ── */}
          <div
            style={{ width: '50%' }}
            aria-hidden={!isProp}
            inert={!isProp ? '' : undefined}
          >
            <form onSubmit={handlePropLogin} className="space-y-4 pr-0.5">
              <PhoneInput
                label={t('commun.telephone')}
                value={propForm.telephone}
                onChange={setProp('telephone')}
                required
              />
              <Input
                label={t('auth.connexion.mot_de_passe')}
                type={showPropPwd ? 'text' : 'password'}
                value={propForm.password}
                onChange={setProp('password')}
                placeholder="••••••••"
                required
                suffix={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPropPwd(v => !v)}
                    aria-label={showPropPwd ? 'Masquer' : 'Voir'}
                    className="hover:text-ink transition-colors"
                  >
                    {showPropPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {propError && (
                <p className="text-sm text-danger text-center py-1.5 px-3 rounded-xl bg-danger/10 border border-danger/20">
                  {propError}
                </p>
              )}

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setRememberMe(v => !v)}
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150',
                    rememberMe ? 'bg-primary border-transparent' : 'border-edge bg-elevated',
                  )}
                >
                  {rememberMe && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-sm text-dim">{t('auth.connexion.se_souvenir')}</span>
              </label>

              <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
                {t('auth.connexion.se_connecter')}
              </Button>

              <div className="flex justify-between text-sm">
                <Link to="/register" className="font-semibold" style={{ color: 'var(--color-gold)' }}>
                  {t('auth.connexion.creer_compte')}
                </Link>
                <Link to="/mot-de-passe-oublie" className="text-ghost hover:text-dim transition-colors">
                  {t('auth.connexion.mot_de_passe_oublie')}
                </Link>
              </div>

              <p className="text-center text-xs text-ghost">
                {t('auth.connexion.en_vous_connectant')}{' '}
                <Link to="/a-propos" className="underline underline-offset-2 hover:text-dim">
                  {t('auth.connexion.politique_confidentialite')}
                </Link>
              </p>
            </form>
          </div>

          {/* ── Panneau Équipe ── */}
          <div
            style={{ width: '50%' }}
            aria-hidden={isProp}
            inert={isProp ? '' : undefined}
          >
            <form onSubmit={handleEquipeLogin} className="space-y-4 pl-0.5">
              <Input
                label={t('auth.connexion.code_acces')}
                value={equipeForm.code_acces}
                onChange={setEq('code_acces')}
                placeholder="ex : ABCD1234"
                required
                className="uppercase tracking-widest font-mono"
              />
              <Input
                label={t('auth.connexion.mot_de_passe')}
                type={showEqPwd ? 'text' : 'password'}
                value={equipeForm.password}
                onChange={setEq('password')}
                placeholder="••••••••"
                required
                suffix={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowEqPwd(v => !v)}
                    aria-label={showEqPwd ? 'Masquer' : 'Voir'}
                    className="hover:text-ink transition-colors"
                  >
                    {showEqPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <p className="text-xs text-ghost text-center -mt-2">
                {t('auth.connexion.code_acces_hint')}
              </p>

              {equipeError && (
                <p className="text-sm text-danger text-center py-1.5 px-3 rounded-xl bg-danger/10 border border-danger/20">
                  {equipeError}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
                {t('auth.connexion.acceder_atelier')}
              </Button>
            </form>
          </div>

        </div>
      </div>

    </AuthLayout>
  )
}
