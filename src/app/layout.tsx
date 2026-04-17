import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '🍓 いちご農園 葉かき進捗',
  description: 'いちごハウスの葉かき作業進捗管理アプリ',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
