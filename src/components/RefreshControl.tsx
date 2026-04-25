'use client'
import { useEffect, useState } from 'react'

/**
 * - ホーム画面アプリを再開したとき（5秒以上バックグラウンドだった場合）に自動リロード
 * - 画面右下にリロードボタンを表示
 */
export default function RefreshControl() {
  const [reloading, setReloading] = useState(false)

  useEffect(() => {
    let hiddenAt: number | null = null
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
      } else if (document.visibilityState === 'visible' && hiddenAt) {
        const hiddenMs = Date.now() - hiddenAt
        hiddenAt = null
        if (hiddenMs > 5000) {
          window.location.reload()
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const reload = () => {
    setReloading(true)
    window.location.reload()
  }

  return (
    <button
      onClick={reload}
      disabled={reloading}
      aria-label="更新"
      className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition disabled:opacity-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={reloading ? 'animate-spin text-gray-400' : 'text-gray-600'}>
        <path d="M3 12a9 9 0 0 1 15.5-6.36L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.5 6.36L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
    </button>
  )
}
