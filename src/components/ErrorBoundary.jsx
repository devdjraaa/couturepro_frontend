import { Component } from 'react'

// SUG-24 / P109 : garde-fou global. Un crash de rendu affiche un écran de reprise
// (« réessayer ») au lieu d'un écran blanc — robustesse en utilisation prolongée.
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
        <div style={{ fontSize: '40px' }}>😕</div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Une erreur est survenue</h1>
        <p style={{ fontSize: '14px', color: '#666', maxWidth: '320px', margin: 0 }}>
          L'application a rencontré un problème. Vos données locales sont conservées.
        </p>
        <button
          onClick={this.handleReset}
          style={{
            marginTop: '6px', padding: '11px 22px', borderRadius: '12px',
            border: 'none', background: '#D00B0B', color: '#fff',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </div>
    )
  }
}
