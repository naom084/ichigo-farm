import type { Metadata, Viewport } from 'next'
import './globals.css'
import RefreshControl from '@/components/RefreshControl'

export const metadata: Metadata = {
  title: '🍓 いちご農園 葉かき進捗',
  description: 'いちごハウスの葉かき作業進捗管理アプリ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '葉かき',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#22c55e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <RefreshControl />
      </body>
    </html>
  )
}
