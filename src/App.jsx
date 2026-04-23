function App() {
  return (
    <div className="app-background min-h-screen p-6 font-sans text-ink">

      {/* Titre */}
      <h1 className="font-display text-3xl font-bold text-primary mb-1 tracking-tight">
        Couture Pro
      </h1>
      <p className="text-dim text-sm mb-8">
        Étape 2 — Charte graphique chargée ✓
      </p>

      {/* Boutons */}
      <section className="mb-6">
        <p className="text-ghost text-xs font-sans font-medium uppercase tracking-widest mb-3">Boutons</p>
        <div className="flex flex-wrap gap-3">
          <button className="bg-primary text-inverse px-5 py-2.5 rounded font-display font-semibold text-sm shadow-sm hover:bg-primary-600 transition-all">
            Primaire
          </button>
          <button className="bg-transparent border border-primary text-primary px-5 py-2.5 rounded font-display font-semibold text-sm hover:bg-primary-50 transition-all">
            Secondaire
          </button>
          <button className="bg-accent text-inverse px-5 py-2.5 rounded font-display font-semibold text-sm shadow-sm">
            Accent ambre
          </button>
          <button className="bg-terra text-inverse px-5 py-2.5 rounded font-display font-semibold text-sm shadow-sm">
            Terracotta
          </button>
          <button className="bg-danger text-inverse px-5 py-2.5 rounded font-display font-semibold text-sm shadow-sm">
            Danger
          </button>
        </div>
      </section>

      {/* Cartes */}
      <section className="mb-6">
        <p className="text-ghost text-xs font-sans font-medium uppercase tracking-widest mb-3">Cartes & ombres</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="bg-card border border-edge rounded p-4 shadow-xs">
            <p className="font-display font-semibold text-ink text-sm mb-1">shadow-xs</p>
            <p className="text-dim text-xs">Ombre très subtile</p>
          </div>
          <div className="bg-card border border-edge rounded p-4 shadow-sm">
            <p className="font-display font-semibold text-ink text-sm mb-1">shadow-sm</p>
            <p className="text-dim text-xs">Ombre standard cartes</p>
          </div>
          <div className="bg-card border border-edge rounded p-4 shadow-md">
            <p className="font-display font-semibold text-ink text-sm mb-1">shadow-md</p>
            <p className="text-dim text-xs">Ombre modals / popovers</p>
          </div>
        </div>
      </section>

      {/* Couleurs */}
      <section className="mb-6">
        <p className="text-ghost text-xs font-sans font-medium uppercase tracking-widest mb-3">Palette</p>
        <div className="flex flex-wrap gap-2">
          {[
            ['bg-primary-50',  'P 50'],
            ['bg-primary-100', 'P 100'],
            ['bg-primary-200', 'P 200'],
            ['bg-primary',     'Primary'],
            ['bg-primary-600', 'P 600'],
            ['bg-primary-700', 'P 700'],
          ].map(([cls, label]) => (
            <div key={cls} className={`${cls} h-10 w-16 rounded flex items-end p-1`}>
              <span className="text-[9px] text-ink/60">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            ['bg-accent-50', 'A 50'],
            ['bg-accent',    'Accent'],
            ['bg-terra-50',  'T 50'],
            ['bg-terra',     'Terra'],
            ['bg-success',   'Success'],
            ['bg-danger',    'Danger'],
          ].map(([cls, label]) => (
            <div key={cls} className={`${cls} h-10 w-16 rounded flex items-end p-1`}>
              <span className="text-[9px] text-ink/60">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Typographie */}
      <section className="mb-6">
        <p className="text-ghost text-xs font-sans font-medium uppercase tracking-widest mb-3">Typographie</p>
        <div className="bg-card border border-edge rounded p-4 shadow-xs space-y-2">
          <p className="font-display font-bold text-2xl text-ink">Outfit Bold — Titres de page</p>
          <p className="font-display font-semibold text-lg text-ink">Outfit Semibold — Sections</p>
          <p className="font-sans text-base text-ink">DM Sans Regular — Corps de texte principal</p>
          <p className="font-sans text-sm text-dim">DM Sans — Texte secondaire / descriptions</p>
          <p className="font-sans text-xs text-ghost">DM Sans — Texte tertiaire / hints</p>
          <p className="font-mono text-sm text-ink">JetBrains Mono — 125 000 XOF · REF-2024-001</p>
        </div>
      </section>

      {/* Surfaces */}
      <section className="mb-6">
        <p className="text-ghost text-xs font-sans font-medium uppercase tracking-widest mb-3">Surfaces</p>
        <div className="flex gap-2 flex-wrap">
          <div className="bg-app border border-edge rounded p-3 text-xs text-ink">bg-app</div>
          <div className="bg-card border border-edge rounded p-3 text-xs text-ink">bg-card</div>
          <div className="bg-subtle border border-edge rounded p-3 text-xs text-ink">bg-subtle</div>
          <div className="bg-inset border border-edge rounded p-3 text-xs text-ink">bg-inset</div>
        </div>
      </section>

    </div>
  )
}

export default App
