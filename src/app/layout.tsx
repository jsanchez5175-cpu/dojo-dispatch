import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dojo Dispatch — SF6 AI Strategy Hub',
  description: 'The complete Street Fighter 6 platform. AI Sensei, live meta, CPT 2026 events, player profiles, daily quiz and newsletter.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.6.0/dist/tabler-icons.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#12121A',
              color: '#E8E8F0',
              border: '1px solid #2E2E4A',
              fontFamily: '"Barlow Condensed", sans-serif',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}