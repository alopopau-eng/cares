"use client"

import Script from 'next/script'

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-Q2GFXM19H0'

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  )
}
