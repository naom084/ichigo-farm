'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import NameEntry from '@/components/NameEntry'

const FarmView = dynamic(() => import('@/components/FarmView'), { ssr: false })

const NAME_KEY = 'ichigo_worker_name'

export default function Home() {
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(NAME_KEY)
    if (saved) setName(saved)
    setLoading(false)
  }, [])

  const handleSetName = (n: string) => {
    localStorage.setItem(NAME_KEY, n)
    setName(n)
  }

  const handleChangeName = () => {
    localStorage.removeItem(NAME_KEY)
    setName(null)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
      <div className="text-2xl animate-pulse">🍓</div>
    </div>
  )

  if (!name) return <NameEntry onSet={handleSetName} />

  return <FarmView workerName={name} onChangeName={handleChangeName} />
}
