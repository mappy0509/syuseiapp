import { useState, useMemo } from 'react'
import type { AuthState } from '../lib/auth'
import type { AttendanceStatus, MemberRole } from '../lib/types'
import { ROLE_ORDER, STATUS_CONFIG } from '../lib/types'
import { useMembers } from '../hooks/useMembers'
import { useAttendance } from '../hooks/useAttendance'
import { TopBar } from '../components/layout/TopBar'
import { Drawer } from '../components/layout/Drawer'
import { StatsRow } from '../components/attendance/StatsRow'
import { MemberCard } from '../components/attendance/MemberCard'
import { RosterModal } from '../components/modals/RosterModal'
import { MatchModal } from '../components/modals/MatchModal'
import { SettingsModal } from '../components/modals/SettingsModal'
import { Toast } from '../components/ui/Toast'

interface Props {
  auth: AuthState
  onLogout: () => void
}

type ModalType = 'roster' | 'match' | 'settings' | 'export' | 'analytics' | 'teambrowse' | 'allteams' | null

export function AttendancePage({ auth, onLogout }: Props) {
  const [meetingId, setMeetingId] = useState(36)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modal, setModal] = useState<ModalType>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const { members, loading: membersLoading, addMember, addMembersBulk, updateMember, deleteMember } = useMembers(auth.teamId)
  const { getStatus, getRecord, upsertStatus, updateGuestCount, togglePaid, updateNote, bulkUpsert, stats } = useAttendance(auth.teamId, meetingId)

  // canEdit: admin always can, others only if password changed (we'll check via a flag on team)
  // For simplicity, all logged-in users can edit their own team
  const canEdit = true

  const activeMembers = useMemo(() => members.filter((m) => m.role !== '退会'), [members])

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase()
    let list = activeMembers
    if (q) list = list.filter((m) => m.name.toLowerCase().includes(q) || (m.company ?? '').toLowerCase().includes(q))
    const statusOrder: Record<AttendanceStatus, number> = { pending: 0, present: 1, absent: 2 }
    return [...list].sort((a, b) => {
      const sa = getStatus(a.id), sb = getStatus(b.id)
      const sd = (statusOrder[sa] ?? 9) - (statusOrder[sb] ?? 9)
      if (sd !== 0) return sd
      return (ROLE_ORDER[a.role as MemberRole] ?? 9) - (ROLE_ORDER[b.role as MemberRole] ?? 9)
    })
  }, [activeMembers, search, getStatus])

  const currentStats = stats(activeMembers.map((m) => m.id))

  const handleBulkPresent = () => {
    activeMembers.forEach((m) => {
      if (getStatus(m.id) === 'pending') upsertStatus(m.id, 'present')
    })
    showToast('未回答→出席に一括更新')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Drawer
        open={drawerOpen}
        teamName={auth.teamName}
        meetingId={meetingId}
        isAdmin={auth.isAdmin}
        onClose={() => setDrawerOpen(false)}
        onSelectMeeting={(id) => { setMeetingId(id); showToast(`例会を切り替えました`, 'info') }}
        onLogout={onLogout}
        onOpenModal={(m) => setModal(m as ModalType)}
      />

      <TopBar
        teamName={auth.teamName}
        meetingId={meetingId}
        onMenuOpen={() => setDrawerOpen(true)}
      />

      <div style={styles.content}>
        {/* AI Banner */}
        <div style={styles.aiBanner}>
          <div style={styles.aiBannerTitle}>⚡ 出席データ照合</div>
          <div style={styles.aiBannerDesc}>
            公式サイトの出席者一覧をコピー＆ペーストすると、{activeMembers.length}名の出席/欠席/未回答を自動判定します。
          </div>
          <div style={styles.aiBannerBtns}>
            <button style={{ ...styles.aiFetchBtn, ...styles.aiFetchBtnPrimary }}
              onClick={() => window.open('https://shuseiclubfukuokachuou.com/', '_blank')}>
              🌐 公式サイトを開く
            </button>
            <button style={{ ...styles.aiFetchBtn, ...styles.aiFetchBtnSecondary }}
              onClick={() => setModal('match')}>
              📋 貼り付けて照合
            </button>
          </div>
        </div>

        <StatsRow stats={currentStats} />

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <span style={{ color: 'var(--txt3)', fontSize: '14px' }}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="氏名・会社名で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={styles.toolbarActions}>
            <button style={styles.bulkBtn} onClick={handleBulkPresent}>一括出席</button>
            <button style={{ ...styles.actionBtn, ...styles.actionBtnOutline }} onClick={() => setModal('roster')}>👥 名簿</button>
            <button style={{ ...styles.actionBtn, ...styles.actionBtnGold }} onClick={() => setModal('roster')}>＋ 追加</button>
          </div>
        </div>

        {/* Member list */}
        {membersLoading ? (
          <div style={styles.empty}>読み込み中...</div>
        ) : filteredMembers.length === 0 ? (
          <div style={styles.empty}>
            {activeMembers.length === 0
              ? 'メンバーが登録されていません。名簿から追加してください。'
              : '該当するメンバーが見つかりません'}
          </div>
        ) : (
          <div>
            {filteredMembers.map((m, i) => (
              <MemberCard
                key={m.id}
                member={m}
                record={getRecord(m.id)}
                canEdit={canEdit}
                animDelay={i * 30}
                onStatusChange={(s) => {
                  upsertStatus(m.id, s)
                  showToast(`${m.name} → ${STATUS_CONFIG[s].label}`)
                }}
                onGuestChange={(delta) => updateGuestCount(m.id, delta)}
                onPaidToggle={() => togglePaid(m.id)}
                onNoteChange={(note) => updateNote(m.id, note)}
              />
            ))}
          </div>
        )}
      </div>

      <footer style={styles.footer}>
        全 {activeMembers.length}名 | {auth.teamName} | © 修正クラブ福岡中央
      </footer>

      {/* Modals */}
      {modal === 'roster' && (
        <RosterModal
          members={members}
          onClose={() => setModal(null)}
          onAdd={async (name, company, role) => {
            const { error } = await addMember(name, company, role) ?? {}
            if (!error) showToast(`${name}を追加しました`)
            else showToast('追加に失敗しました', 'error')
          }}
          onBulkAdd={async (entries) => {
            const res = await addMembersBulk(entries)
            if (res) {
              let msg = `${res.added}名を登録しました`
              if (res.skipped) msg += ` / ${res.skipped}名は重複スキップ`
              showToast(msg)
            }
          }}
          onEdit={async (id, name, company, role) => {
            const { error } = await updateMember(id, name, company, role) ?? {}
            if (!error) showToast(`${name}を更新しました`)
          }}
          onDelete={async (id, name) => {
            await deleteMember(id)
            showToast(`${name}を削除しました`, 'info')
          }}
        />
      )}

      {modal === 'match' && (
        <MatchModal
          members={activeMembers}
          onClose={() => setModal(null)}
          onApply={async (results, guests) => {
            const { guestCount } = await bulkUpsert(results, guests)
            const p = results.filter((r) => r.status === 'present').length
            const a = results.filter((r) => r.status === 'absent').length
            showToast(`照合完了！ 出席${p}名 / 欠席${a}名 / ゲスト${guestCount}名`)
            setModal(null)
          }}
        />
      )}

      {modal === 'settings' && (
        <SettingsModal
          auth={auth}
          onClose={() => setModal(null)}
          onSaved={() => showToast('パスワードを変更しました')}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  content: { flex: 1, padding: '16px', maxWidth: '900px', margin: '0 auto', width: '100%' },
  aiBanner: {
    background: 'linear-gradient(135deg,rgba(139,92,246,.1),rgba(59,130,246,.08))',
    border: '1px solid rgba(139,92,246,.25)',
    borderRadius: 'var(--r)',
    padding: '18px',
    marginBottom: '12px',
    animation: 'slideUp .4s both',
  },
  aiBannerTitle: { fontSize: '15px', fontWeight: 700, color: 'var(--violet)', marginBottom: '6px' },
  aiBannerDesc: { fontSize: '12px', color: 'var(--txt2)', lineHeight: 1.7, marginBottom: '14px' },
  aiBannerBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  aiFetchBtn: {
    flex: 1,
    minWidth: '140px',
    padding: '13px 16px',
    borderRadius: 'var(--rs)',
    fontSize: '14px',
    fontWeight: 700,
    textAlign: 'center',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  aiFetchBtnPrimary: { background: 'linear-gradient(135deg,var(--violet),#6D28D9)', color: '#fff', boxShadow: '0 3px 16px rgba(139,92,246,.3)' },
  aiFetchBtnSecondary: { background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.25)', color: 'var(--blue)' },
  toolbar: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: '160px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--rs)',
    padding: '8px 12px',
  },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--txt)', fontSize: '13px', minWidth: 0 },
  toolbarActions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  bulkBtn: {
    padding: '7px 12px',
    borderRadius: 'var(--rs)',
    fontSize: '11px',
    fontWeight: 600,
    background: 'rgba(16,185,129,.12)',
    border: '1px solid rgba(16,185,129,.25)',
    color: 'var(--green)',
    cursor: 'pointer',
  },
  actionBtn: { padding: '8px 14px', borderRadius: 'var(--rs)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', border: 'none' },
  actionBtnOutline: { border: '1px solid var(--border)', color: 'var(--txt2)', background: 'transparent' },
  actionBtnGold: { background: 'linear-gradient(135deg,var(--gold),#B8960C)', color: '#080C16', boxShadow: '0 2px 10px rgba(212,175,55,.25)' },
  empty: { textAlign: 'center', padding: '48px 16px', color: 'var(--txt3)', fontSize: '14px' },
  footer: { padding: '12px 16px', textAlign: 'center', fontSize: '11px', color: 'var(--txt3)', borderTop: '1px solid var(--border)' },
}
