import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getDatabase(app)

/**
 * 匿名認証を完了させる Promise を返す。
 * Firebase Realtime Database のルールで auth!=null を要求するため、
 * 読み書きする前に必ずこの Promise を await する。
 */
const auth = getAuth(app)
let authReadyPromise: Promise<void> | null = null
export function ensureAuth(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (authReadyPromise) return authReadyPromise
  authReadyPromise = new Promise<void>((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          unsub()
          resolve()
        } else {
          signInAnonymously(auth).catch((e) => {
            unsub()
            reject(e)
          })
        }
      },
      (e) => {
        unsub()
        reject(e)
      }
    )
  })
  return authReadyPromise
}

export type BedStatus = 'todo' | 'partial' | 'done'
export type BedSide = 'left' | 'right'

export interface SideRecord {
  status: BedStatus
  updatedBy: string
  updatedAt: string
  startedAt?: string
  startedBy?: string
}

export interface BedRecord {
  left?: SideRecord
  right?: SideRecord
}

export interface HouseData {
  [bedKey: string]: BedRecord
}

export interface FarmData {
  [houseKey: string]: HouseData
}

export const HOUSES = [
  { id: 'house_1', label: 'ハウス 1', variety: 'やよいひめ・とちおとめ', color: '#3d7a35', beds: 10 },
  { id: 'house_2', label: 'ハウス 2', variety: 'よつぼし', color: '#c0392b', beds: 10 },
  { id: 'house_3', label: 'ハウス 3', variety: '紅ほっぺ', color: '#e8384f', beds: 10 },
  { id: 'house_4', label: 'ハウス 4', variety: '紅ほっぺ', color: '#8e44ad', beds: 10 },
] as const
