'use client'
import { BedStatus, BedSide } from '@/lib/firebase'

interface Props {
  houseLabel: string
  bedNum: number
  side: BedSide
  color: string
  currentStatus: BedStatus
  updatedBy?: string
  updatedAt?: string
  startedAt?: string
  startedBy?: string
  onSelect: (status: BedStatus) => void
  onClear: () => void
  onClose: () => void
}

export default function BedModal({
  houseLabel, bedNum, side, color, currentStatus,
  updatedBy, updatedAt, startedAt, startedBy,
  onSelect, onClear, onClose
}: Props) {
  const sideLabel = side === 'left' ? '左側' : '右側'

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .slide-up { animation: slideUp 0.22s ease; }
      `}</style>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="slide-up bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

          {/* タイトル */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <h3 className="font-black text-lg">
              {houseLabel} — {bedNum}番ベッド <span className="text-base font-bold" style={{ color }}>（{sideLabel}）</span>
            </h3>
          </div>

          {/* 作業記録 */}
          {(startedAt || (updatedAt && currentStatus !== 'todo')) && (
            <div className="mb-5 bg-gray-50 rounded-2xl p-3 space-y-1.5">
              <p className="text-xs font-bold text-gray-400 mb-1 tracking-wider">📋 作業記録</p>
              {startedAt && (
                <div className="text-xs text-gray-600">
                  <span className="text-gray-400 font-bold mr-1">開始</span>
                  {startedAt}
                  {startedBy && <span className="text-gray-400 ml-1">（{startedBy}）</span>}
                </div>
              )}
              {updatedAt && currentStatus !== 'todo' && (
                <div className="text-xs text-gray-600">
                  <span className="text-gray-400 font-bold mr-1">
                    {currentStatus === 'done' ? '完了' : '更新'}
                  </span>
                  {updatedAt}
                  {updatedBy && <span className="text-gray-400 ml-1">（{updatedBy}）</span>}
                </div>
              )}
            </div>
          )}

          {/* ステータスボタン */}
          <div className="grid grid-cols-2 gap-3">
            <StatusBtn
              label="✅ 完了" sub="葉かき済"
              active={currentStatus === 'done'}
              bg="#dcfce7" border="#22c55e" text="#16a34a"
              onClick={() => onSelect('done')}
            />
            <StatusBtn
              label="🔄 途中" sub="作業中"
              active={currentStatus === 'partial'}
              bg="#fef9c3" border="#eab308" text="#a16207"
              onClick={() => onSelect('partial')}
            />
          </div>

          {/* クリアボタン */}
          <button
            onClick={onClear}
            className="mt-3 w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 text-sm font-bold active:opacity-70 transition-opacity flex items-center justify-center gap-2"
          >
            <span>🗑️</span>
            <span>未着手に戻す</span>
          </button>

          <button onClick={onClose} className="mt-3 w-full py-3 text-gray-400 text-sm">
            キャンセル
          </button>
        </div>
      </div>
    </>
  )
}

function StatusBtn({ label, sub, active, bg, border, text, onClick }: {
  label: string; sub: string; active: boolean
  bg: string; border: string; text: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl py-4 px-2 flex flex-col items-center gap-1 border-2 active:scale-95 transition-transform duration-100"
      style={{
        background: bg,
        borderColor: active ? border : '#e5e5e5',
        boxShadow: active ? `0 0 0 3px ${border}40` : 'none'
      }}
    >
      <span className="text-2xl">{label.split(' ')[0]}</span>
      <span className="font-bold text-xs" style={{ color: text }}>{label.split(' ')[1]}</span>
      <span className="text-gray-400 text-xs">{sub}</span>
    </button>
  )
}
