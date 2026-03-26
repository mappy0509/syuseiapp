import { MEETINGS } from '../../lib/types'

interface Props {
  open: boolean
  teamName: string
  meetingId: number
  isAdmin: boolean
  onClose: () => void
  onSelectMeeting: (id: number) => void
  onLogout: () => void
  onOpenModal: (modal: string) => void
}

function meetingStatus(date: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return { label: '終了', color: 'var(--txt3)' }
  if (diff <= 14) return { label: `あと${diff}日`, color: 'var(--red)' }
  if (diff <= 30) return { label: `あと${diff}日`, color: 'var(--amber)' }
  return { label: date.slice(5), color: 'var(--txt2)' }
}

export function Drawer({ open, meetingId, isAdmin, onClose, onSelectMeeting, onLogout, onOpenModal }: Props) {
  return (
    <>
      <div
        style={{ ...styles.overlay, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
      />
      <div style={{ ...styles.drawer, transform: open ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div style={styles.closeRow}>
          <span />
          <button style={styles.closeBtn} onClick={onClose}>✕ 閉じる</button>
        </div>

        <div style={styles.head}>
          <div style={styles.brand}>
            修正クラブ福岡中央
            <small style={styles.brandSub}>ATTENDANCE MANAGER</small>
          </div>
        </div>

        <div style={styles.divider} />

        {/* MEETINGS */}
        <section style={styles.section}>
          <div style={styles.sectionLabel}>MEETINGS</div>
          {MEETINGS.map((m) => {
            const ms = meetingStatus(m.date)
            return (
              <button
                key={m.id}
                style={{
                  ...styles.item,
                  ...(meetingId === m.id ? styles.itemActiveBlue : {}),
                }}
                onClick={() => { onSelectMeeting(m.id); onClose() }}
              >
                <span style={styles.dot} />
                <div style={{ flex: 1 }}>
                  <div>{m.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--txt3)' }}>{m.date}（{m.day}）</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: ms.color }}>{ms.label}</span>
              </button>
            )
          })}
        </section>

        <div style={styles.divider} />

        {/* ANALYTICS */}
        <section style={styles.section}>
          <div style={styles.sectionLabel}>ANALYTICS</div>
          <button style={styles.item} onClick={() => { onOpenModal('analytics'); onClose() }}>
            <span style={styles.dot} />📊 出席分析
          </button>
          <button style={styles.item} onClick={() => { onOpenModal('teambrowse'); onClose() }}>
            <span style={styles.dot} />👥 他チーム出席分析
          </button>
          {isAdmin && (
            <button style={styles.item} onClick={() => { onOpenModal('allteams'); onClose() }}>
              <span style={styles.dot} />📈 全チーム集計
            </button>
          )}
        </section>

        <div style={styles.divider} />

        {/* MANAGEMENT */}
        <section style={styles.section}>
          <div style={styles.sectionLabel}>MANAGEMENT</div>
          <button style={styles.item} onClick={() => { onOpenModal('roster'); onClose() }}>
            <span style={styles.dot} />👥 メンバー名簿管理
          </button>
          <button style={styles.item} onClick={() => { onOpenModal('export'); onClose() }}>
            <span style={styles.dot} />📤 CSVエクスポート
          </button>
        </section>

        <div style={styles.divider} />

        {/* SETTINGS */}
        <section style={styles.section}>
          <div style={styles.sectionLabel}>SETTINGS</div>
          <button style={styles.item} onClick={() => { onOpenModal('settings'); onClose() }}>
            <span style={styles.dot} />🔑 パスワード変更
          </button>
        </section>

        <div style={styles.divider} />

        <div style={styles.links}>
          <a style={styles.link} href="https://shuseiclubfukuokachuou.com/" target="_blank" rel="noopener">
            🌐 公式サイト <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: .5 }}>↗</span>
          </a>
        </div>

        <button style={styles.logout} onClick={onLogout}>ログアウト</button>
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    background: 'rgba(0,0,0,.6)',
    backdropFilter: 'blur(4px)',
    transition: 'opacity .25s',
  },
  drawer: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 201,
    width: 'min(300px, 85vw)',
    background: 'linear-gradient(180deg,#0E1422,#131B2E)',
    borderRight: '1px solid var(--border2)',
    transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  closeRow: {
    padding: '14px 16px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    padding: '6px 14px',
    borderRadius: 'var(--rs)',
    border: '1px solid var(--border2)',
    color: 'var(--txt2)',
    fontSize: '12px',
    fontWeight: 600,
  },
  head: { padding: '16px 20px 14px' },
  brand: { fontSize: '14px', fontWeight: 700, color: 'var(--gold-l)' },
  brandSub: { display: 'block', fontSize: '10px', color: 'var(--txt2)', fontWeight: 500, letterSpacing: '.1em', marginTop: '2px' },
  divider: { height: '1px', margin: '0 16px', background: 'linear-gradient(90deg,transparent,var(--gold-d),var(--gold),var(--gold-d),transparent)', opacity: .5 },
  section: { padding: '16px 12px 8px' },
  sectionLabel: { fontSize: '10px', fontWeight: 700, color: 'var(--txt3)', letterSpacing: '.14em', padding: '0 8px', marginBottom: '8px' },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: 'var(--rs)',
    marginBottom: '2px',
    fontSize: '13px',
    color: 'var(--txt2)',
    width: '100%',
    textAlign: 'left',
    borderLeft: '3px solid transparent',
  },
  itemActiveBlue: {
    color: 'var(--txt)',
    fontWeight: 600,
    background: 'linear-gradient(90deg,rgba(59,130,246,.1),transparent)',
    borderLeftColor: 'var(--blue)',
  },
  dot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--txt3)', flexShrink: 0 },
  links: { padding: '12px' },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 12px',
    marginBottom: '4px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--rs)',
    color: 'var(--txt2)',
    fontSize: '12px',
    textDecoration: 'none',
  },
  logout: {
    margin: '8px 12px 20px',
    padding: '10px',
    borderRadius: 'var(--rs)',
    border: '1px solid rgba(239,68,68,.2)',
    color: 'var(--red)',
    fontSize: '13px',
    fontWeight: 600,
    textAlign: 'center',
    width: 'calc(100% - 24px)',
    display: 'block',
  },
}
