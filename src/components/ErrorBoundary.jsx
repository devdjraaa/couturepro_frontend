import { Component } from 'react'
import { AlertCircle } from 'lucide-react'
import i18n from '@/lang/i18n'

// SUG-24 / P109 : garde-fou global. Un crash de rendu affiche un écran de reprise
// (« réessayer ») au lieu d'un écran blanc — robustesse en utilisation prolongée.
//
// Les textes passent par l'INSTANCE i18n et non par le hook `useTranslation` :
// un composant de classe ne peut pas appeler de hook, et surtout cet écran doit
// s'afficher alors que l'arbre React vient de tomber. Les styles restent en
// ligne pour la même raison — il ne dépend d'aucune feuille de style.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Trace utile au support (P110) sans casser l'app.
    if (typeof console !== 'undefined') console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false })
    // Recharge le bundle courant (pas de perte de données locales WatermelonDB).
    if (typeof window !== 'undefined') window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100svh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '14px',
        padding: '24px', textAlign: 'center', fontFamily: 'system-ui, sans-serif',
      }}>
        <AlertCircle size={40} strokeWidth={1.5} color="#D00B0B" aria-hidden="true" />
        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
          {i18n.t('erreurs.generique_titre')}
        </h1>
        <p style={{ fontSize: '14px', color: '#666', maxWidth: '320px', margin: 0 }}>
          {/* Le message parlait de « données locales conservées » PARTOUT — or
              sur le web il n'y a ni base locale ni mode hors ligne : la phrase
              était fausse pour la moitié des utilisateurs. On dit maintenant ce
              qui est vrai selon l'endroit où l'application tourne. */}
          {i18n.t(window.Capacitor?.isNativePlatform?.()
            ? 'erreurs.generique_description_natif'
            : 'erreurs.generique_description')}
        </p>
        <button
          onClick={this.handleReset}
          style={{
            marginTop: '6px', padding: '11px 22px', borderRadius: '12px',
            border: 'none', background: '#D00B0B', color: '#fff',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          {i18n.t('erreurs.reessayer')}
        </button>
      </div>
    )
  }
}
