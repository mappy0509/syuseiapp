import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { runMatch } from '../../lib/matching'
import type { Member } from '../../lib/types'
import type { MatchResult } from '../../lib/matching'
import type { GuestEntry } from '../../lib/types'
import { STATUS_CONFIG } from '../../lib/types'

interface Props {
  members: Member[]
  onClose: () => void
  onApply: (results: MatchResult[], guests: GuestEntry[]) => Promise<void>
}

export function MatchModal({ members, onClose, onApply }: Props) {
  const [step, setStep] = useState<0 | 1>(0)
  const [text, setText] = useState('')
  const [results, setResults] = useState<MatchResult[] | null>(null)
  const [guests, setGuests] = useState<GuestEntry[]>([])
  const [applying, setApplying] = useState(false)

  const handleMatch = () => {
    if (!text.trim()) return
    const { results: r, guests: g } = runMatch(text, members)
    setResults(r)
    setGuests(g)
    setStep(1)
  }

  const handleApply = async () => {
    if (!results) return
    setApplying(true)
    await onApply(results, guests)
    setApplying(false)
  }

  const presentCount = results?.filter((r) => r.status === 'present').length ?? 0
  const absentCount = results?.filter((r) => r.status === 'absent').length ?? 0
  const pendingCount = results?.filter((r) => r.status === 'pending').length ?? 0

  return (
    <Modal onClose={onClose}>
      <h3 style={styles.h3}>📋 出席者リスト自動照合</h3>

      {/* Steps */}
      <div style={styles.steps}>
        {(['① 貼り付け', '② 確認・反映'] as const).map((label, i) => (
          <div key={i} style={{
            ...styles.step,
            ...(step === i ? styles.stepActive : {}),
            ...(step > i ? styles.stepDone : {}),
          }}>{label}</div>
        ))}
      </div>

      {step === 0 && (
        <>
          <div style={{ marginBottom: '14px' }}>
            <label style={styles.label}>公式サイトの出席者データをここに貼り付け</label>
            <textarea
              style={styles.textarea}
              placeholder={'公式サイトの出席者一覧からそのまま貼り付けてください。\n\n出席者・欠席・未回答のセクションを\n自動で認識して判定します。\n\n例：\n1 増田一誠 世話人 ケザワークス...\n...\n欠席\n1 石橋岳 ...\n...\n未回答\n1 池 田浩 ...'}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--txt3)', lineHeight: 1.6, marginBottom: '16px' }}>
            💡 公式サイトにログイン→出席者ページを開く→ページ全体を選択してコピー→ここに貼り付け
          </div>
          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={onClose}>キャンセル</button>
            <button style={{ ...styles.confirmBtn, background: 'linear-gradient(135deg,var(--blue),#2563EB)' }} onClick={handleMatch}>照合する →</button>
          </div>
        </>
      )}

      {step === 1 && results && (
        <>
          <div style={{ fontSize: '13px', color: 'var(--txt2)', marginBottom: '12px' }}>
            照合結果を確認してから「反映する」を押してください。
          </div>

          <div style={styles.preview}>
            {results.map((r) => {
              const cfg = STATUS_CONFIG[r.status]
              return (
                <div key={r.memberId} style={styles.previewRow}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--txt3)', marginLeft: '8px' }}>{r.company}</span>
                  </div>
                  <span style={{ ...styles.previewStatus, color: cfg.color, background: cfg.bg }}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={styles.summary}>
            出席:{presentCount}名 / 欠席:{absentCount}名 / 未回答:{pendingCount}名 / メンバー{results.length}名
          </div>

          {guests.length > 0 && (
            <div style={styles.guestBox}>
              <div style={{ color: 'var(--violet)', fontWeight: 700, marginBottom: '6px' }}>▼ ゲスト {guests.length}名</div>
              {guests.map((g, i) => (
                <div key={i} style={{ color: 'var(--txt2)', padding: '2px 0', fontSize: '12px' }}>
                  {g.name}{g.company ? ` (${g.company})` : ''}
                </div>
              ))}
            </div>
          )}

          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={() => setStep(0)}>← 戻る</button>
            <button
              style={{ ...styles.confirmBtn, background: 'linear-gradient(135deg,var(--green),#059669)' }}
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? '反映中...' : '✓ 反映する'}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

const styles: Record<string, React.CSSProperties> = {
  h3: { fontSize: '17px', fontWeight: 700, color: 'var(--gold-l)', marginBottom: '20px' },
  steps: { display: 'flex', gap: '8px', marginBottom: '20px' },
  step: {
    flex: 1,
    padding: '10px 8px',
    borderRadius: 'var(--rs)',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    textAlign: 'center',
    fontSize: '11px',
    color: 'var(--txt3)',
    fontWeight: 600,
  },
  stepActive: { borderColor: 'var(--blue)', color: 'var(--blue)', background: 'rgba(59,130,246,.08)' },
  stepDone: { borderColor: 'var(--green)', color: 'var(--green)', background: 'rgba(16,185,129,.08)' },
  label: { display: 'block', fontSize: '12px', color: 'var(--txt2)', fontWeight: 600, marginBottom: '8px' },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--rs)',
    background: 'var(--bg2)',
    border: '1px solid var(--border2)',
    color: 'var(--txt)',
    fontSize: '13px',
    outline: 'none',
    minHeight: '180px',
    resize: 'vertical',
    lineHeight: 1.6,
  },
  preview: { maxHeight: '260px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--rs)', marginBottom: '12px' },
  previewRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: '13px' },
  previewStatus: { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 },
  summary: { fontSize: '12px', color: 'var(--txt2)', padding: '10px 14px', background: 'var(--bg2)', borderRadius: 'var(--rs)', border: '1px solid var(--border)', marginBottom: '12px' },
  guestBox: { marginTop: '8px', padding: '10px 14px', background: 'rgba(139,92,246,.06)', border: '1px solid rgba(139,92,246,.15)', borderRadius: 'var(--rs)', marginBottom: '12px' },
  actions: { display: 'flex', gap: '10px', marginTop: '20px' },
  cancelBtn: { flex: 1, padding: '11px', borderRadius: 'var(--rs)', fontSize: '14px', fontWeight: 600, border: '1px solid var(--border)', color: 'var(--txt2)', cursor: 'pointer', background: 'transparent' },
  confirmBtn: { flex: 1, padding: '11px', borderRadius: 'var(--rs)', fontSize: '14px', fontWeight: 600, color: '#fff', cursor: 'pointer', border: 'none' },
}
