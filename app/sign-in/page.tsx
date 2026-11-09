import { AigridAuthPage, AigridProfilePage } from '@/components/aigrid-auth-page'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ profile?: string; step?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/')

  const { profile, step } = await searchParams
  if (step === 'profile') {
    return <AigridProfilePage initialProfile={profile === 'auto-producteurs' ? 'Auto-producteurs' : 'STEG'} />
  }
  if (profile !== 'steg' && profile !== 'auto-producteurs') return <AigridProfilePage />

  return <AigridAuthPage mode="sign-in" profile={profile === 'steg' ? 'STEG' : 'Auto-producteurs'} />
}
