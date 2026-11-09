'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Cpu,
  FileUp,
  Gauge,
  History,
  LogOut,
  Network,
  Play,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
} from 'lucide-react'

const AigridMap = dynamic(() => import('./aigrid-map').then((module) => module.AigridMap), {
  ssr: false,
  loading: () => <div className="map-loading">Chargement de la carte du réseau…</div>,
})

type Tab = 'playground' | 'history' | 'docs'

const sites = [
  { id: 1, name: 'CHU Fattouma Bourguiba', demand: 22, level: 'Vital', priority: 'critical' },
  { id: 2, name: 'Maternité et Néonatologie', demand: 18, level: 'Vital', priority: 'critical' },
  { id: 3, name: 'Hôpital régional Ksar Helal', demand: 15, level: 'Vital', priority: 'critical' },
  { id: 4, name: 'Faculté de Médecine de Monastir', demand: 12, level: 'Essentiel', priority: 'essential' },
  { id: 5, name: 'Aéroport Habib Bourguiba', demand: 14, level: 'Essentiel', priority: 'essential' },
  { id: 6, name: 'Zone industrielle Ksar Helal', demand: 35, level: 'Important', priority: 'important' },
  { id: 7, name: 'Zone touristique Skanès', demand: 28, level: 'Important', priority: 'important' },
  { id: 8, name: 'Faculté des Sciences de Monastir', demand: 8, level: 'Important', priority: 'important' },
  { id: 9, name: 'ENIM', demand: 7, level: 'Important', priority: 'important' },
  { id: 10, name: 'IPEIM', demand: 6, level: 'Important', priority: 'important' },
  { id: 11, name: 'Quartiers résidentiels Monastir centre', demand: 110, level: 'Différable', priority: 'flexible' },
]

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 44 44" fill="none">
        <path d="M8 27.5 22 10l14 17.5h-8.1L22 19.7l-5.9 7.8H8Z" fill="white" />
        <path d="m12.2 30.5 3.4-4.3h12.8l3.4 4.3H12.2Z" fill="#F5A623" />
        <path d="m9 34.5 2.2-2.8h21.6l2.2 2.8H9Z" fill="#E8483F" />
        <path d="m7 38 1.4-2h27.2l1.4 2H7Z" fill="#28A8A1" />
      </svg>
    </span>
  )
}

function Header({ activeTab, setActiveTab, profile, setProfile, userName, onSignOut }: {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  profile: string
  setProfile: (profile: string) => void
  userName: string
  onSignOut: () => void
}) {
  return (
    <header className="app-header">
      <div className="header-topline" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></div>
      <div className="header-inner">
        <a className="brand" href="#main" aria-label="AIGRID, accueil">
          <BrandMark />
          <span>AIGRID</span>
        </a>
        <nav className="primary-nav" aria-label="Navigation principale">
          <button className={activeTab === 'playground' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveTab('playground')}>
            Playground
          </button>
          <button className={activeTab === 'history' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveTab('history')}>
            Historique
          </button>
          <button className={activeTab === 'docs' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveTab('docs')}>
            Documentation
          </button>
        </nav>
        <div className="header-actions">
          <span className="model-tag"><span className="model-pulse" /> PHASOR-Net <span className="model-version">v1.0</span></span>
          <label className="profile-select-wrap">
            <span className="sr-only">Profil actif</span>
            <select value={profile} onChange={(event) => setProfile(event.target.value)} aria-label="Profil actif">
              <option value="STEG">Espace STEG</option>
              <option value="Auto-producteurs">Auto-producteurs</option>
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
          <span className="signed-in-user">{userName}</span>
          <button className="signout-button" type="button" onClick={onSignOut} aria-label="Se déconnecter"><LogOut size={15} /><span>Déconnexion</span></button>
        </div>
      </div>
      <div className="header-accent" />
    </header>
  )
}

function RangeControl({ label, value, min, max, unit, onChange, color = 'blue' }: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (value: number) => void
  color?: 'red' | 'blue' | 'green'
}) {
  return (
    <label className={`range-control ${color}`}>
      <span className="range-copy"><span>{label}</span><strong>{value}{unit}</strong></span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} aria-label={label} />
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="toggle-switch" aria-hidden="true" />
    </label>
  )
}

function Controls({ demand, setDemand, capacity, setCapacity, solar, setSolar, wind, setWind, fault, setFault, powerFlow, setPowerFlow, compare, setCompare, onOptimize, isOptimizing }: {
  demand: number; setDemand: (value: number) => void
  capacity: number; setCapacity: (value: number) => void
  solar: number; setSolar: (value: number) => void
  wind: number; setWind: (value: number) => void
  fault: string; setFault: (value: string) => void
  powerFlow: boolean; setPowerFlow: (value: boolean) => void
  compare: boolean; setCompare: (value: boolean) => void
  onOptimize: () => void
  isOptimizing: boolean
}) {
  return (
    <aside className="panel controls-panel" aria-labelledby="inputs-title">
      <div className="panel-heading">
        <div><span className="eyebrow">PARAMÈTRES DU SCÉNARIO</span><h2 id="inputs-title">Entrées du modèle</h2></div>
        <SlidersHorizontal size={17} aria-hidden="true" />
      </div>
      <label className="field-label" htmlFor="network-select">Réseau électrique</label>
      <div className="select-box">
        <Network size={15} aria-hidden="true" />
        <select id="network-select" defaultValue="monastir">
          <option value="monastir">Monastir · IEEE-14 bus</option>
          <option value="sousse">Sousse · IEEE-14 bus</option>
          <option value="tunis">Grand Tunis · IEEE-30 bus</option>
        </select>
        <ChevronDown size={14} aria-hidden="true" />
      </div>
      <div className="control-section">
        <div className="section-label"><span>Hypothèses de charge</span><span className="section-unit">MW / %</span></div>
        <RangeControl label="Demande totale" value={demand} min={150} max={350} unit=" MW" onChange={setDemand} color="red" />
        <RangeControl label="Seuil de capacité" value={capacity} min={180} max={320} unit=" MW" onChange={setCapacity} />
        <RangeControl label="Production solaire disponible" value={solar} min={0} max={100} unit=" %" onChange={setSolar} color="green" />
        <RangeControl label="Production éolienne disponible" value={wind} min={0} max={100} unit=" %" onChange={setWind} />
      </div>
      <div className="control-section fault-section">
        <label className="field-label" htmlFor="fault-select">Panne N-1 · ligne à déconnecter</label>
        <div className="select-box">
          <Zap size={15} aria-hidden="true" />
          <select id="fault-select" value={fault} onChange={(event) => setFault(event.target.value)}>
            <option value="B2–B4">Ligne B2 – B4</option>
            <option value="B4–B7">Ligne B4 – B7</option>
            <option value="B5–B6">Ligne B5 – B6</option>
            <option value="Aucune">Aucune panne simulée</option>
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </div>
      </div>
      <div className="toggle-group">
        <Toggle label="Vérification physique (power-flow)" checked={powerFlow} onChange={setPowerFlow} />
        <Toggle label="Comparer au solveur IPOPT" checked={compare} onChange={setCompare} />
      </div>
      <button className="optimize-button" onClick={onOptimize} disabled={isOptimizing}>
        {isOptimizing ? <Activity size={16} className="spin-icon" /> : <Play size={15} fill="currentColor" />}
        {isOptimizing ? 'Optimisation en cours…' : 'Lancer l’optimisation'}
        {!isOptimizing && <ArrowRight size={15} />}
      </button>
      <button className="import-button" onClick={() => document.getElementById('scenario-file')?.click()}>
        <FileUp size={15} /> Importer un scénario (CSV)
      </button>
      <input id="scenario-file" className="sr-only" type="file" accept=".csv,text/csv" onChange={(event) => event.currentTarget.value = ''} />
      <div className="privacy-note"><ShieldCheck size={14} /> Scénario local · aucune donnée envoyée</div>
    </aside>
  )
}

function MetricCard({ label, value, unit, icon, tone = 'blue', detail }: { label: string; value: string; unit?: string; icon: React.ReactNode; tone?: string; detail?: string }) {
  return (
    <div className={`metric-card ${tone}`}>
      <span className="metric-icon">{icon}</span>
      <span className="metric-label">{label}</span>
      <strong>{value}<small>{unit}</small></strong>
      {detail && <span className="metric-detail">{detail}</span>}
    </div>
  )
}

function Results({ demand, capacity, selectedSite, setSelectedSite, isOptimized, onExport }: {
  demand: number; capacity: number; selectedSite: number; setSelectedSite: (id: number) => void; isOptimized: boolean; onExport: () => void
}) {
  const selected = sites.find((site) => site.id === selectedSite) ?? sites[0]
  const overloaded = demand > capacity
  const allocationRatio = demand / sites.reduce((total, site) => total + site.demand, 0)
  const selectedLoad = Math.round(selected.demand * (demand / 275))

  return (
    <aside className="panel results-panel" aria-labelledby="results-title">
      <div className="panel-heading results-heading">
        <div><span className="eyebrow">PHASOR-NET · SORTIES</span><h2 id="results-title">Résultats du modèle</h2></div>
        <span className="freshness"><span className="live-dot" /> Live</span>
      </div>
      <div className="metric-grid">
        <MetricCard label="Temps PHASOR-Net" value={isOptimized ? '5,8' : '6'} unit="ms" icon={<Cpu size={14} />} detail="calcul rapide" />
        <MetricCard label="Temps IPOPT" value="28,7" unit="ms" icon={<Clock3 size={14} />} tone="red" detail="solveur de référence" />
        <MetricCard label="Écart au coût optimal" value={isOptimized ? '+0,31' : '+0,35'} unit="%" icon={<Gauge size={14} />} detail="écart relatif" />
      </div>
      <div className={overloaded ? 'alert-banner warning' : 'alert-banner success'} role="status">
        {overloaded ? <Zap size={15} /> : <Check size={15} />}
        <span>{overloaded ? <>Seuil dépassé : {demand} MW &gt; {capacity} MW (+{demand - capacity} MW). Redispatch AC-OPF recommandé.</> : <>Réseau dans les limites : {demand} MW / {capacity} MW. Réserve disponible : {capacity - demand} MW.</>}</span>
      </div>
      <div className="selected-load-card">
        <div className="selected-topline"><span>CHARGE INSTANTANÉE · SITE SÉLECTIONNÉ</span><span className="load-status">{selected.level}</span></div>
        <div className="selected-load-content">
          <div><strong>{selected.id}. {selected.name}</strong><span>{Math.round(selectedLoad / demand * 100)} % de la demande totale ({demand} MW)</span></div>
          <b>{selectedLoad}<small> MW</small></b>
        </div>
        <div className="load-track"><span style={{ width: `${Math.max(8, Math.min(100, allocationRatio * 100))}%` }} /></div>
      </div>
      <div className="priority-header"><span>ORDRE DE PRIORITÉ</span><span>CHARGE · {demand} MW</span></div>
      <ol className="priority-list">
        {sites.map((site) => (
          <li key={site.id}>
            <button className={selectedSite === site.id ? 'priority-item selected' : 'priority-item'} onClick={() => setSelectedSite(site.id)} aria-pressed={selectedSite === site.id}>
              <span className={`priority-number ${site.priority}`}>{site.id}</span>
              <span className="priority-name">{site.name}</span>
              <span className={`priority-badge ${site.priority}`}>{site.level}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="validation-chips">
        <span><Check size={12} /> Tensions 0,95 – 1,06 pu</span>
        <span><Check size={12} /> Limites de lignes</span>
        <span><Check size={12} /> Bilan de puissance</span>
      </div>
      <div className="results-footer">
        <span><ShieldCheck size={14} /> Recommandation soumise à l’opérateur avant toute action.</span>
        <button onClick={onExport}><ArrowDownToLine size={14} /> Exporter CSV</button>
      </div>
    </aside>
  )
}

function AlternatePage({ tab }: { tab: Exclude<Tab, 'playground'> }) {
  return (
    <section className="alternate-page panel">
      <span className="alternate-icon">{tab === 'history' ? <History /> : <BookOpen />}</span>
      <span className="eyebrow">AIGRID · PHASOR-NET</span>
      <h1>{tab === 'history' ? 'Historique des scénarios' : 'Documentation technique'}</h1>
      <p>{tab === 'history' ? 'Vos simulations réalisées apparaîtront ici. Lancez une optimisation depuis le Playground pour créer votre premier scénario.' : 'PHASOR-Net évalue les contraintes du réseau, classe les charges selon leur criticité et propose des pistes de redispatch à valider par l’opérateur.'}</p>
      <div className="alternate-note"><ShieldCheck size={16} /> Démonstration · résultats fictifs, non destinés au pilotage d’un réseau réel.</div>
    </section>
  )
}

export function AigridDashboard({ userName, initialProfile }: { userName: string; initialProfile: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('playground')
  const [profile, setProfile] = useState(initialProfile)
  const [demand, setDemand] = useState(275)
  const [capacity, setCapacity] = useState(259)
  const [solar, setSolar] = useState(60)
  const [wind, setWind] = useState(35)
  const [fault, setFault] = useState('B2–B4')
  const [powerFlow, setPowerFlow] = useState(true)
  const [compare, setCompare] = useState(true)
  const [selectedSite, setSelectedSite] = useState(1)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isOptimized, setIsOptimized] = useState(false)

  const statusDescription = useMemo(() => demand > capacity ? 'Attention : seuil de capacité dépassé' : 'Réseau dans les limites', [demand, capacity])

  async function handleSignOut() {
    await authClient.signOut()
    router.replace('/sign-in')
    router.refresh()
  }

  function runOptimization() {
    setIsOptimizing(true)
    window.setTimeout(() => {
      setIsOptimizing(false)
      setIsOptimized(true)
    }, 900)
  }

  function exportCsv() {
    const rows = [['Priorité', 'Site', 'Niveau', 'Charge estimée (MW)'], ...sites.map((site) => [site.id, site.name, site.level, Math.round(site.demand * demand / 275)])]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
    const file = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = 'aigrid-scenario-monastir.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <main id="main" className="aigrid-app">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} setProfile={setProfile} userName={userName} onSignOut={handleSignOut} />
      <div className="content-wrap">
        <div className="workspace-title-row">
          <div><span className="eyebrow">PLATEFORME D’AIDE À LA DÉCISION ÉNERGÉTIQUE</span><h1>{activeTab === 'playground' ? 'Optimisation du réseau' : activeTab === 'history' ? 'Historique' : 'Documentation'}</h1></div>
          <span className="scenario-tag"><span className="live-dot" /> {profile} · Monastir <span className="tag-divider" /> Scénario démo</span>
        </div>
        {activeTab !== 'playground' ? <AlternatePage tab={activeTab} /> : (
          <>
            <div className="dashboard-grid">
              <Controls
                demand={demand} setDemand={setDemand}
                capacity={capacity} setCapacity={setCapacity}
                solar={solar} setSolar={setSolar}
                wind={wind} setWind={setWind}
                fault={fault} setFault={setFault}
                powerFlow={powerFlow} setPowerFlow={setPowerFlow}
                compare={compare} setCompare={setCompare}
                onOptimize={runOptimization} isOptimizing={isOptimizing}
              />
              <section className="panel map-panel" aria-labelledby="map-title">
                <div className="panel-heading map-heading">
                  <div><span className="eyebrow">TOPOLOGIE ET CONTRAINTES</span><h2 id="map-title">Réseau IEEE-14 · région de Monastir</h2></div>
                  <button className="map-action" aria-label="Afficher les paramètres de carte"><Activity size={15} /><span>Réseau actif</span></button>
                </div>
                <div className="map-status-line"><span className="live-dot" /> {statusDescription} <span className="map-status-separator">·</span> Panne N-1 : {fault} <span className="map-status-separator">·</span> {powerFlow ? 'Power-flow activé' : 'Power-flow désactivé'}</div>
                <AigridMap selectedSite={selectedSite} onSelectSite={setSelectedSite} />
                <div className="map-caption"><span>Carte illustrative · sites et liaisons approximatifs</span><span>Source cartographique : OpenStreetMap</span></div>
              </section>
              <Results demand={demand} capacity={capacity} selectedSite={selectedSite} setSelectedSite={setSelectedSite} isOptimized={isOptimized} onExport={exportCsv} />
            </div>
            <footer className="disclaimer-bar"><ShieldCheck size={15} /><span>Maquette de démonstration — données fictives et positions approximatives. Toute recommandation nécessite la validation de l’opérateur.</span><span className="model-footer"><Cpu size={14} /> PHASOR-Net v1.0</span></footer>
          </>
        )}
      </div>
    </main>
  )
}
