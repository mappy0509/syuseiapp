export type AttendanceStatus = 'present' | 'absent' | 'pending'

export type MemberRole =
  | 'オーナー'
  | '副代表'
  | '世話人'
  | '正会員'
  | '準会員'
  | '退会'

export interface Team {
  id: string
  name: string
  created_at: string
}

export interface Member {
  id: string
  team_id: string
  name: string
  company: string | null
  role: MemberRole
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Meeting {
  id: number
  number: number
  label: string
  date: string
  day: string
}

export interface AttendanceRecord {
  id: string
  meeting_id: number
  member_id: string
  status: AttendanceStatus
  guest_count: number
  guest_names: GuestEntry[]
  paid: boolean
  note: string | null
}

export interface GuestEntry {
  name: string
  company: string
}

export const MEETINGS: Meeting[] = [
  { id: 34, number: 34, label: '第34回例会', date: '2026-01-27', day: '火' },
  { id: 35, number: 35, label: '第35回例会', date: '2026-02-16', day: '月' },
  { id: 36, number: 36, label: '第36回例会', date: '2026-03-23', day: '月' },
  { id: 37, number: 37, label: '第37回例会', date: '2026-04-28', day: '月' },
  { id: 38, number: 38, label: '第38回例会', date: '2026-05-25', day: '月' },
]

export const ROLE_ORDER: Record<MemberRole, number> = {
  オーナー: 0,
  副代表: 1,
  世話人: 2,
  正会員: 3,
  準会員: 4,
  退会: 9,
}

export const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  pending: {
    label: '未回答',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,.12)',
    icon: '？',
  },
  present: {
    label: '出席',
    color: '#10B981',
    bg: 'rgba(16,185,129,.12)',
    icon: '○',
  },
  absent: {
    label: '欠席',
    color: '#EF4444',
    bg: 'rgba(239,68,68,.12)',
    icon: '✕',
  },
}
