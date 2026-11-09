import { AigridAuthPage } from '@/components/aigrid-auth-page'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/')

  const { profile } = await searchParams
  if (profile !== 'steg' && profile !== 'auto-producteurs') redirect('/sign-in')

  return <AigridAuthPage mode="sign-up" profile={profile === 'steg' ? 'STEG' : 'Auto-producteurs'} />
}
