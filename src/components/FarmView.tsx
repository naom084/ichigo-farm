'use client'
import { useEffect, useState, useCallback } from 'react'
import { ref, onValue, set, remove } from 'firebase/database'
import { db, HOUSES, BedRecord, BedStatus, BedSide, SideRecord, FarmData } from '@/lib/firebase'
import BedModal from './BedModal'

interface Props {
  workerName: string
  onChangeName: () => void
}

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function pct(houseId: string, data: FarmData, beds: number) {
  let done = 0, total = 0
  for (let i = 1; i <= beds; i++) {
    const bed = data[houseId]?.[`bed_${i}`]
    const leftStatus = bed?.left?.status ?? 'todo'
    const rightStatus = bed?.right?.status ?? 'todo'
    if (leftStatus === 'done') done++
    else if (leftStatus === 'partial') done += 0.5
    if (rightStatus === 'done') done++
    else if (rightStatus === 'partial') done += 0.5
    total += 2
  }
  return Math.round(done / total * 100)
}

export default function FarmView({ workerName, onChangeName }: Props) {
  const [farmData, setFarmData] = useState<FarmData>({})
  const [modal, setModal] = useState<{ houseId: string; bedNum: number; side: BedSide } | null>(null)
  const [connected, setConnected] = useState(true)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    const farmRef = ref(db, 'farm')
    const unsub = onValue(farmRef, (snap) => {
      setFarmData(snap.val() ?? {})
      setConnected(true)
    }, () => setConnected(false))
    return () => unsub()
  }, [])

  const handleStatusChange = useCallback(async (status: BedStatus) => {
    if (!modal) return
    const { houseId, bedNum, side } = modal
    const sideRef = ref(db, `farm/${houseId}/bed_${bedNum}/${side}`)
    const now = new Date().toISOString()
    const existing = farmData[houseId]?.[`bed_${bedNum}`]?.[side]

    const record: SideRecord = {
      status,
      updatedBy: workerName,
      updatedAt: now,
      startedAt: existing?.startedAt ?? now,
      startedBy: existing?.startedBy ?? workerName,
    }
    await set(sideRef, record)
    setModal(null)
  }, [modal, workerName, farmData])

  const handleStart = useCallback(async (houseId: string, bedNum: number, side: BedSide) => {
    const sideRef = ref(db, `farm/${houseId}/bed_${bedNum}/${side}`)
    const now = new Date().toISOString()
    const existing = farmData[houseId]?.[`bed_${bedNum}`]?.[side]
    if (existing?.startedAt) return // すでに開始済み

    const record: SideRecord = {
      status: existing?.status ?? 'partial',
      updatedBy: workerName,
      updatedAt: now,
      startedAt: now,
      startedBy: workerName,
    }
    await set(sideRef, record)
  }, [workerName, farmData])

  const handleClear = useCallback(async () => {
    if (!modal) return
    const { houseId, bedNum, side } = modal
    await remove(ref(db, `farm/${houseId}/bed_${bedNum}/${side}`))
    setModal(null)
  }, [modal])

  const handleReset = useCallback(async () => {
    await remove(ref(db, 'farm'))
    setShowResetConfirm(false)
  }, [])

  const totalSides = HOUSES.reduce((s, h) => s + h.beds, 0) * 2
  let totalDone = 0
  HOUSES.forEach(h => {
    for (let i = 1; i <= h.beds; i++) {
      const bed = farmData[h.id]?.[`bed_${i}`]
      const leftStatus = bed?.left?.status ?? 'todo'
      const rightStatus = bed?.right?.status ?? 'todo'
      if (leftStatus === 'done') totalDone++
      else if (leftStatus === 'partial') totalDone += 0.5
      if (rightStatus === 'done') totalDone++
      else if (rightStatus === 'partial') totalDone += 0.5
    }
  })
  const totalPct = Math.round(totalDone / totalSides * 100)

  const selectedSide = modal ? farmData[modal.houseId]?.[`bed_${modal.bedNum}`]?.[modal.side] : null
  const selectedHouse = modal ? HOUSES.find(h => h.id === modal.houseId) : null

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--cream)' }}>

      {/* ヘッダー */}
      <div className="sticky top-0 z-10 shadow-md" style={{ background: 'var(--green-deep)' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-base tracking-wide">🍓 葉かき進捗</h1>
            <p className="text-green-300 text-xs mt-0.5 font-mono">
              {connected ? '● リアルタイム同期中' : '○ オフライン'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowResetConfirm(true)}
              className="text-red-300 text-xs bg-red-900 rounded-lg px-3 py-1.5 active:opacity-70">
              🔄 リセット
            </button>
            <button onClick={onChangeName}
              className="text-green-200 text-xs bg-green-900 rounded-lg px-3 py-1.5 active:opacity-70">
              👤 {workerName}
            </button>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-green-900 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all duration-700"
                style={{ width: `${totalPct}%` }} />
            </div>
            <span className="text-white font-black font-mono text-sm min-w-[42px] text-right">
              {totalPct}%
            </span>
          </div>
          <p className="text-green-400 text-xs mt-1 font-mono">
            全体 {Math.floor(totalDone)}/{totalSides} 完了
          </p>
        </div>
      </div>

      {/* ハウス一覧 */}
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {HOUSES.map(house => {
          const p = pct(house.id, farmData, house.beds)
          let doneCount = 0, partialCount = 0
          for (let i = 1; i <= house.beds; i++) {
            const bed = farmData[house.id]?.[`bed_${i}`]
            if (bed?.left?.status === 'done') doneCount++
            else if (bed?.left?.status === 'partial') partialCount++
            if (bed?.right?.status === 'done') doneCount++
            else if (bed?.right?.status === 'partial') partialCount++
          }
          return (
            <div key={house.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1.5" style={{ background: house.color }} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-black text-lg" style={{ color: house.color }}>{house.label}</h2>
                    <p className="text-gray-400 text-xs mt-0.5">{house.variety}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black font-mono text-2xl" style={{ color: house.color }}>
                      {p}<span className="text-sm font-normal text-gray-400">%</span>
                    </span>
                    <p className="text-gray-400 text-xs font-mono">
                      {doneCount}/{house.beds * 2}完了{partialCount > 0 && ` +${partialCount}途中`}
                    </p>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${p}%`, background: house.color }} />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-5 text-xs text-gray-400 font-bold tracking-wider mb-1">▲ 前列（1〜5番）</div>
                  {[1,2,3,4,5].map(i => {
                    const bed = farmData[house.id]?.[`bed_${i}`]
                    return (
                      <BedCell key={i} bedNum={i}
                        left={bed?.left}
                        right={bed?.right}
                        color={house.color}
                        onClickLeft={() => setModal({ houseId: house.id, bedNum: i, side: 'left' })}
                        onClickRight={() => setModal({ houseId: house.id, bedNum: i, side: 'right' })}
                        onStartLeft={() => handleStart(house.id, i, 'left')}
                        onStartRight={() => handleStart(house.id, i, 'right')}
                      />
                    )
                  })}
                  <div className="col-span-5 text-xs text-gray-400 font-bold tracking-wider mt-2 mb-1">▼ 後列（6〜10番）</div>
                  {[6,7,8,9,10].map(i => {
                    const bed = farmData[house.id]?.[`bed_${i}`]
                    return (
                      <BedCell key={i} bedNum={i}
                        left={bed?.left}
                        right={bed?.right}
                        color={house.color}
                        onClickLeft={() => setModal({ houseId: house.id, bedNum: i, side: 'left' })}
                        onClickRight={() => setModal({ houseId: house.id, bedNum: i, side: 'right' })}
                        onStartLeft={() => handleStart(house.id, i, 'left')}
                        onStartRight={() => handleStart(house.id, i, 'right')}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-gray-300 text-xs mt-8 font-mono">
        左・右をタップでステータス変更
      </p>

      {/* ベッドモーダル */}
      {modal && selectedHouse && (
        <BedModal
          houseLabel={selectedHouse.label}
          bedNum={modal.bedNum}
          side={modal.side}
          color={selectedHouse.color}
          currentStatus={selectedSide?.status ?? 'todo'}
          updatedBy={selectedSide?.updatedBy}
          updatedAt={selectedSide?.updatedAt ? formatDate(selectedSide.updatedAt) : undefined}
          startedAt={selectedSide?.startedAt ? formatDate(selectedSide.startedAt) : undefined}
          startedBy={selectedSide?.startedBy}
          onSelect={handleStatusChange}
          onClear={handleClear}
          onClose={() => setModal(null)}
        />
      )}

      {/* リセット確認モーダル */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowResetConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-lg text-center mb-2">⚠️ 全データをリセット</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              すべてのハウスのベッド進捗をリセットします。<br />この操作は元に戻せません。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm active:opacity-70">
                キャンセル
              </button>
              <button onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm active:opacity-70">
                リセットする
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 左右1マスのセル
function SideCell({ sideRecord, label, color, onClick }: {
  sideRecord?: SideRecord
  label: string
  color: string
  onClick: () => void
}) {
  const status: BedStatus = sideRecord?.status ?? 'todo'

  const bg = status === 'done' ? '#dcfce7'
    : status === 'partial' ? '#fef9c3'
    : '#f5f5f5'

  const borderColor = status === 'done' ? color
    : status === 'partial' ? '#eab308'
    : '#e5e5e5'

  const icon = status === 'done' ? '✓' : status === 'partial' ? '△' : '—'
  const textColor = status === 'done' ? color
    : status === 'partial' ? '#a16207'
    : '#bbb'

  function fmt(iso?: string) {
    if (!iso) return ''
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  const timeStr = sideRecord?.updatedAt ? fmt(sideRecord.updatedAt) : ''
  const nameStr = sideRecord?.updatedBy ?? ''

  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-lg flex flex-col items-center justify-center py-1.5 px-0.5 active:scale-95 transition-transform duration-100 border"
      style={{ background: bg, borderColor, minHeight: '52px' }}
    >
      <span className="text-xs font-bold text-gray-400 leading-none mb-0.5">{label}</span>
      <span className="font-black text-base leading-none" style={{ color: textColor }}>{icon}</span>
      {timeStr && (
        <span className="font-mono leading-none mt-0.5" style={{ fontSize: '8px', color: '#9ca3af' }}>{timeStr}</span>
      )}
      {nameStr && (
        <span className="leading-none truncate w-full text-center text-gray-400" style={{ fontSize: '8px' }}>
          {nameStr.length > 4 ? nameStr.slice(0, 4) + '…' : nameStr}
        </span>
      )}
    </button>
  )
}

// ベッドセル（左右分割）
function BedCell({ bedNum, left, right, color, onClickLeft, onClickRight, onStartLeft, onStartRight }: {
  bedNum: number
  left?: SideRecord
  right?: SideRecord
  color: string
  onClickLeft: () => void
  onClickRight: () => void
  onStartLeft: () => void
  onStartRight: () => void
}) {
  // 開始ボタン：まだ startedAt がなく、完了でもない場合に表示
  const showStartLeft = !left?.startedAt && (left?.status ?? 'todo') !== 'done'
  const showStartRight = !right?.startedAt && (right?.status ?? 'todo') !== 'done'

  return (
    <div className="flex flex-col gap-1">
      <div className="text-center text-xs font-bold text-gray-300 leading-none">{bedNum}</div>
      <div className="flex gap-0.5">
        <SideCell sideRecord={left} label="左" color={color} onClick={onClickLeft} />
        <SideCell sideRecord={right} label="右" color={color} onClick={onClickRight} />
      </div>
      {(showStartLeft || showStartRight) && (
        <div className="flex gap-0.5">
          {showStartLeft ? (
            <button
              onClick={e => { e.stopPropagation(); onStartLeft() }}
              className="flex-1 rounded py-0.5 text-center active:opacity-60 border border-sky-200"
              style={{ background: '#f0f9ff', fontSize: '9px', color: '#0284c7', fontWeight: 'bold' }}
            >
              ▶
            </button>
          ) : <div className="flex-1" />}
          {showStartRight ? (
            <button
              onClick={e => { e.stopPropagation(); onStartRight() }}
              className="flex-1 rounded py-0.5 text-center active:opacity-60 border border-sky-200"
              style={{ background: '#f0f9ff', fontSize: '9px', color: '#0284c7', fontWeight: 'bold' }}
            >
              ▶
            </button>
          ) : <div className="flex-1" />}
        </div>
      )}
    </div>
  )
}
