"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SimpleSpinner } from "@/components/unified-spinner"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new home page
    router.replace('/home-new')
  }, [router])

  return <SimpleSpinner />
}
