'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Eye, EyeOff, KeyRound, Loader2, Mail, ShieldCheck, Sun, Zap } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

type AuthMode = 'sign-in' | 'sign-up'
type WorkspaceProfile = 'STEG' | 'Auto-producteurs'

function BrandMark() {
  return (
    <span className="auth-brand-mark" aria-hidden="true">
      <svg viewBox="0 0 44 44" fill="none">
        <path d="M8 27.5 22 10l14 17.5h-8.1L22 19.7l-5.9 7.8H8Z" fill="white" />
        <path d="m12.2 30.5 3.4-4.3h12.8l3.4 4.3H12.2Z" fill="#F5A623" />
        <path d="m9 34.5 2.2-2.8h21.6l2.2 2.8H9Z" fill="#E8483F" />
        <path d="m7 38 1.4-2h27.2l1.4 2H7Z" fill="#28A8A1" />
      </svg>
    </span>
  )
}

function NetworkPattern() {
  return (
    <svg className="auth-network-pattern" viewBox="0 0 320 86" preserveAspectRatio="none" aria-hidden="true">
      <path d="M6 57 73 18l68 38 77-37 92 31M73 18l38 55 107-54 42 49 50-18" />
      <g><circle cx="6" cy="57" r="3" /><circle cx="73" cy="18" r="4" /><circle cx="141" cy="56" r="3" /><circle cx="218" cy="19" r="4" /><circle cx="310" cy="50" r="4" /><circle cx="111" cy="73" r="2.5" /><circle cx="260" cy="68" r="3" /></g>
    </svg>
  )
}

function ProfileChoice({ profile, selected, onSelect }: {
  profile: WorkspaceProfile
  selected: boolean
  onSelect: (profile: WorkspaceProfile) => void
}) {
  const isSteg = profile === 'STEG'

  return (
    <label className={`auth-profile-card${selected ? ' selected' : ''}`}>
      <input type="radio" name="workspace-profile" value={profile} checked={selected} onChange={() => onSelect(profile)} />
      <span className={`profile-emblem${isSteg ? ' steg-emblem' : ' watt-emblem'}`} aria-hidden="true">
        {isSteg ? (
          <img className="steg-logo-image" src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OIP%20%2813%29-Njw0vTUdRALNgoHejEjB3d9hJHRMjV.webp" alt="" />
        ) : <><Sun size={24} /><Zap size={14} /></>}
      </span>
      <span className="auth-profile-copy">
        <strong>{profile}</strong>
        <span>{isSteg ? 'Société Tunisienne de l’Électricité et du Gaz, opérateur du réseau national.' : 'Sociétés qui produisent leur propre électricité : solaire, éolien, cogénération.'}</span>
      </span>
      <span className="profile-radio-indicator" aria-hidden="true" />
    </label>
  )
}

export function AigridProfilePage({ initialProfile = 'STEG' }: { initialProfile?: WorkspaceProfile }) {
  const [profile, setProfile] = useState<WorkspaceProfile>(initialProfile)
  const profileSlug = profile === 'STEG' ? 'steg' : 'auto-producteurs'

  return (
    <main className="auth-app auth-profile-step">
      <header className="auth-brandbar">
        <NetworkPattern />
        <Link href="/sign-in" className="auth-brand" aria-label="AIGRID, page de connexion">
          <BrandMark />
          <span>AIGRID</span>
        </Link>
      </header>
      <div className="auth-brand-accent" />
      <section className="auth-layout auth-profile-only" aria-label="Choisir le profil AIGRID">
        <div className="auth-profile-panel">
          <div className="auth-panel-intro">
            <span className="auth-overline">AIGRID · ÉNERGIE INTELLIGENTE</span>
            <h1>Choisissez votre profil</h1>
            <p>Votre espace s&apos;adapte à votre activité : réseau national ou production propre.</p>
          </div>
          <fieldset className="auth-profile-options">
            <legend className="sr-only">Profil de l&apos;espace</legend>
            <ProfileChoice profile="STEG" selected={profile === 'STEG'} onSelect={setProfile} />
            <ProfileChoice profile="Auto-producteurs" selected={profile === 'Auto-producteurs'} onSelect={setProfile} />
          </fieldset>
          <div className="auth-profile-actions">
            <p className="auth-profile-footnote"><ShieldCheck size={16} /> Accès réservé aux professionnels de l&apos;énergie</p>
            <Link className="auth-submit auth-continue" href={`/sign-in?profile=${profileSlug}`}>Continuer vers la connexion <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
      <footer className="auth-page-footer"><span>AIGRID · Plateforme d&apos;aide à la décision énergétique</span><span>PHASOR-Net v1.0</span></footer>
    </main>
  )
}

export function AigridAuthPage({ mode, profile }: { mode: AuthMode; profile: WorkspaceProfile }) {
  const router = useRouter()
  const isSignUp = mode === 'sign-up'
  const profileSlug = profile === 'STEG' ? 'steg' : 'auto-producteurs'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgotMessage, setForgotMessage] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password, rememberMe })

      if (result.error) {
        setError(isSignUp
          ? 'Impossible de créer le compte. Vérifiez les informations ou essayez de vous connecter.'
          : 'Identifiant ou mot de passe invalide. Vérifiez vos informations et réessayez.')
        return
      }

      router.replace(`/?profile=${profileSlug}`)
      router.refresh()
    } catch {
      setError('Le service est momentanément indisponible. Réessayez dans quelques instants.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-app">
      <header className="auth-brandbar">
        <NetworkPattern />
        <Link href="/sign-in" className="auth-brand" aria-label="AIGRID, page de connexion">
          <BrandMark />
          <span>AIGRID</span>
        </Link>
      </header>
      <div className="auth-brand-accent" />
      <section className="auth-layout auth-credentials-only" aria-label={isSignUp ? 'Créer un compte AIGRID' : 'Connexion AIGRID'}>
        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <span className="auth-overline">ESPACE SÉCURISÉ</span>
            <h1>{isSignUp ? 'Créer un compte' : 'Connexion'}</h1>
            <div className="auth-profile-controls">
              <span className="auth-profile-badge"><span className="auth-status-dot" /> Espace {profile}</span>
              <Link href={`/sign-in?step=profile&profile=${profileSlug}`} className="auth-change-profile">Changer de profil</Link>
            </div>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignUp && (
              <label className="auth-field" htmlFor="auth-name">
                <span>Nom complet</span>
                <span className="auth-input-wrap"><Building2 size={17} /><input id="auth-name" name="name" type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Votre nom complet" required maxLength={120} /></span>
              </label>
            )}
            <label className="auth-field" htmlFor="auth-email">
              <span>Identifiant</span>
              <span className="auth-input-wrap"><Mail size={17} /><input id="auth-email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="Votre adresse e-mail" required maxLength={254} /></span>
            </label>
            <label className="auth-field" htmlFor="auth-password">
              <span>Mot de passe</span>
              <span className="auth-input-wrap"><KeyRound size={17} /><input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignUp ? 'new-password' : 'current-password'} placeholder="Votre mot de passe" required minLength={8} maxLength={128} />
                <button className="password-visibility" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}<span>{showPassword ? 'Masquer' : 'Afficher'}</span></button>
              </span>
            </label>
            {!isSignUp && (
              <div className="auth-options-row">
                <label className="remember-option"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Rester connecté</span></label>
                <button type="button" className="forgot-password" onClick={() => setForgotMessage((value) => !value)}>Mot de passe oublié ?</button>
              </div>
            )}
            {forgotMessage && <p className="auth-inline-notice" role="status">Pour réinitialiser votre mot de passe, contactez l&apos;administrateur de votre espace.</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={17} className="auth-spinner" /> Connexion en cours…</> : <>{isSignUp ? 'Créer mon compte' : 'Se connecter'} <span aria-hidden="true">→</span></>}
            </button>
          </form>
          <p className="auth-switch">
            {isSignUp ? 'Vous avez déjà un compte ? ' : 'Vous n’avez pas encore de compte ? '}
            <Link href={isSignUp ? `/sign-in?profile=${profileSlug}` : `/sign-up?profile=${profileSlug}`}>{isSignUp ? 'Se connecter' : 'Créer un compte'}</Link>
          </p>
          <p className="auth-security-note"><ShieldCheck size={15} /> Accès sécurisé. Les recommandations sont soumises à l&apos;opérateur avant toute action.</p>
        </div>
      </section>
      <footer className="auth-page-footer"><span>AIGRID · Plateforme d&apos;aide à la décision énergétique</span><span>PHASOR-Net v1.0</span></footer>
    </main>
  )
}
