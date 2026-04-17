'use client'
import { useState } from 'react'

interface Props { onSet: (name: string) => void }

export default function NameEntry({ onSet }: Props) {
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onSet(trimmed)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #1e3d1a 0%, #2d5a27 60%, #3d7a35 100%)' }}>

      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['🍓','🌿','🍓','🌱','🍓'].map((e, i) => (
          <span key={i} className="absolute text-6xl opacity-5 select-none"
            style={{ top: `${15 + i * 18}%`, left: `${5 + i * 22}%`, transform: `rotate(${i * 15}deg)` }}>
            {e}
          </span>
        ))}
      </div>

      <div className="relative w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🍓</div>
          <h1 className="text-white text-2xl font-black tracking-widest leading-tight">
            いちご農園<br />
            <span className="text-green-300 text-lg font-bold tracking-wider">葉かき進捗管理</span>
          </h1>
        </div>

        {/* カード */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
            あなたのお名前を入力してください。<br />
            作業記録に表示されます。
          </p>

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="例：山田 花子"
            maxLength={20}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base
              focus:outline-none focus:border-green-500 transition-colors text-center font-bold"
            style={{ fontSize: '18px' }}
            autoFocus
          />

          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="mt-4 w-full py-4 rounded-xl font-black text-white text-lg
              transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
              active:scale-95"
            style={{ background: input.trim() ? 'var(--green-mid)' : '#ccc' }}
          >
            はじめる →
          </button>
        </div>

        <p className="text-center text-green-200 text-xs mt-6 opacity-70">
          このデバイスに保存されます
        </p>
      </div>
    </div>
  )
}
