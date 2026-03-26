import { MEETINGS } from '../../lib/types'

interface Props {
  teamName: string
  meetingId: number
  onMenuOpen: () => void
}

export function TopBar({ teamName, meetingId, onMenuOpen }: Props) {
  const meeting = MEETINGS.find((m) => m.id === meetingId)

  return (
    <header style={styles.bar}>
      <button style={styles.menuBtn} onClick={onMenuOpen}>☰</button>
      <div style={styles.info}>
        <div style={styles.team}>{teamName} — 出席管理</div>
        <div style={styles.meeting}>
          {meeting ? `${meeting.label} ${meeting.date}（${meeting.day}）` : ''}
        </div>
      </div>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(8,12,22,.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
  },
  menuBtn: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--rs)',
    border: '1px solid var(--border2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--txt2)',
    fontSize: '18px',
    flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0 },
  team: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--gold-l)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  meeting: { fontSize: '11px', color: 'var(--txt2)', marginTop: '1px' },
}
