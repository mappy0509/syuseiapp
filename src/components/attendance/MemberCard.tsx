import { useState, useEffect } from 'react'
import type { Member, AttendanceRecord, AttendanceStatus } from '../../lib/types'
import { STATUS_CONFIG, ROLE_ORDER } from '../../lib/types'

interface Props {
  member: Member
  record: AttendanceRecord | undefined
  canEdit: boolean
  animDelay: number
  onStatusChange: (status: AttendanceStatus) => void
  onGuestChange: (delta: number) => void
  onPaidToggle: () => void
  onNoteChange: (note: string) => void
}

function roleColor(role: string): { color: string; bg: string } {
  if (['オーナー', '副代表', '世話人'].includes(role)) return { color: '#F97316', bg: 'rgba(249,115,22,.12)' }
  if (role === '正会員') return { color: '#EF4444', bg: 'rgba(239,68,68,.12)' }
  return { color: '#10B981', bg: 'rgba(16,185,129,.12)' }
}

export function MemberCard({ member, record, canEdit, animDelay, onStatusChange, onGuestChange, onPaidToggle, onNoteChange }: Props) {
  const status: AttendanceStatus = record?.status ?? 'pending'
  const guestCount = record?.guest_count ?? 0
  const paid = record?.paid ?? false
  const note = record?.note ?? ''
  const [localNote, setLocalNote] = useState(note)
  useEffect(() => { setLocalNote(note) }, [note])
  const sc = STATUS_CONFIG[status]
  const rc = roleColor(member.role)

  const borderLeft = status !== 'pending' ? `3px solid ${sc.color}` : '1px solid var(--border)'

  const handleNoteBlur = () => {
    if (localNote !== note) onNoteChange(localNote)
  }

  return (
    <div style={{ ...styles.card, borderLeft, animationDelay: `${animDelay}ms` }}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.name}>{member.name}</div>
          <div style={styles.company}>{member.company || '—'}</div>
        </div>
        <span style={{ ...styles.role, color: rc.color, background: rc.bg }}>{member.role}</span>
      </div>

      {/* Status buttons */}
      <div style={styles.statusRow}>
        {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map((key) => {
          const cfg = STATUS_CONFIG[key]
          const active = status === key
          return (
            <button
              key={key}
              style={{
                ...styles.statusBtn,
                background: active ? cfg.bg : 'transparent',
                borderColor: active ? cfg.color : 'var(--border)',
                borderWidth: active ? '2px' : '1px',
                color: active ? cfg.color : 'var(--txt3)',
              }}
              onClick={() => { if (canEdit) onStatusChange(key); else alert('パスワードを変更してから編集できます') }}
            >
              <span style={styles.statusIcon}>{cfg.icon}</span>
              <span style={styles.statusLabel}>{cfg.label}</span>
            </button>
          )
        })}
      </div>

      {/* Guest + Paid + Note */}
      <div style={styles.bottomRow}>
        {/* Guest counter */}
        <div style={styles.guestBox}>
          <span style={styles.guestLabel}>▼ゲスト</span>
          <button style={styles.guestBtn} onClick={() => canEdit && onGuestChange(-1)}>▼</button>
          <span style={styles.guestCount}>{guestCount}</span>
          <button style={styles.guestBtn} onClick={() => canEdit && onGuestChange(1)}>▲</button>
          <span style={{ fontSize: '10px', color: 'var(--txt3)' }}>名</span>
        </div>

        {/* Paid toggle */}
        <button
          style={{
            ...styles.paidBtn,
            background: paid ? 'rgba(245,158,11,.15)' : 'transparent',
            border: paid ? '2px solid #F59E0B' : '1px solid var(--border)',
            color: paid ? '#F59E0B' : 'var(--txt3)',
            fontWeight: paid ? 700 : 500,
          }}
          onClick={() => canEdit && onPaidToggle()}
        >
          ¥ {paid ? '入金済' : '入金'}
        </button>

        {/* Note */}
        <input
          style={styles.noteInput}
          placeholder="メモ..."
          value={localNote}
          onChange={(e) => setLocalNote(e.target.value)}
          onBlur={handleNoteBlur}
          readOnly={!canEdit}
        />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--card)',
    borderRight: '1px solid var(--border)',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '14px 16px',
    animation: 'slideUp .35s both',
    marginBottom: '6px',
  },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' },
  name: { fontSize: '15px', fontWeight: 700 },
  company: { fontSize: '12px', color: 'var(--txt2)', marginTop: '2px' },
  role: { display: 'inline-block', padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 600, flexShrink: 0 },
  statusRow: { display: 'flex', gap: '5px', marginBottom: '10px', flexWrap: 'wrap' },
  statusBtn: {
    flex: 1,
    minWidth: 0,
    padding: '8px 4px',
    borderRadius: 'var(--rs)',
    fontSize: '11px',
    fontWeight: 500,
    textAlign: 'center',
    borderStyle: 'solid',
    transition: 'all .15s',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statusIcon: { fontSize: '16px', lineHeight: 1 },
  statusLabel: { fontSize: '10px' },
  bottomRow: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  guestBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(139,92,246,.06)',
    border: '1px solid rgba(139,92,246,.2)',
    borderRadius: 'var(--rs)',
    padding: '5px 8px',
  },
  guestLabel: { fontSize: '11px', color: 'var(--violet)', fontWeight: 600 },
  guestBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: '1px solid rgba(139,92,246,.25)',
    background: 'rgba(139,92,246,.1)',
    color: 'var(--violet)',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  guestCount: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--violet)',
    minWidth: '22px',
    textAlign: 'center',
    fontFamily: "'Outfit', sans-serif",
  },
  paidBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 14px',
    borderRadius: 'var(--rs)',
    fontSize: '12px',
    cursor: 'pointer',
    borderStyle: 'solid',
    transition: 'all .15s',
  },
  noteInput: {
    flex: 1,
    minWidth: '60px',
    padding: '8px 10px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,.03)',
    border: '1px solid var(--border)',
    color: 'var(--txt)',
    fontSize: '13px',
    outline: 'none',
  },
}

// Unused import fix
void ROLE_ORDER
