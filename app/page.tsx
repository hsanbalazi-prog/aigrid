import { AigridDashboard } from '@/components/aigrid-dashboard'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const { profile } = await searchParams
  return (
    <AigridDashboard
      userName={session.user.name || session.user.email}
      initialProfile={profile === 'auto-producteurs' ? 'Auto-producteurs' : 'STEG'}
    />
  )
}
