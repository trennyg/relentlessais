'use client'

import { useState, useEffect } from 'react'
import Loader from './Loader'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Skip loader if already seen this session
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('loaderSeen')) {
      setShowLoader(true)
    }
  }, [])

  return (
    <>
      {showLoader && (
        <Loader onComplete={() => setShowLoader(false)} />
      )}
      {children}
    </>
  )
}
