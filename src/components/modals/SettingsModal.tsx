import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { changePassword } from '../../lib/auth'
import type { AuthState } from '../../lib/auth'

interface Props {
  auth: AuthState
  onClose: () => void
  onSaved: () => void
}

export function SettingsModal({ auth, onClose, onSaved }: Props) {
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setError('')
    if (newPw.length < 4) { setError('新しいパスワードは4文字以上'); return }
    if (newPw !== newPw2) { setError('確認パスワードが一致しません'); return }
    setLoading(true)
    try {
      await changePassword(auth.teamId, oldPw, newPw)
      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3 style={styles.h3}>🔑 パスワード変更</h3>
      <div style={styles.info}>
        ログイン中: <span style={styles.teamName}>{auth.teamName}</span>
      </div>

      <Field label="現在のパスワード">
        <input style={styles.input} type="password" placeholder="現在のパスワード" value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
      </Field>
      <Field label="新しいパスワード">
        <input style={styles.input} type="password" placeholder="新しいパスワード（4文字以上）" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
      </Field>
      <Field label="新しいパスワード（確認）">
        <input style={styles.input} type="password" placeholder="もう一度入力" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} />
      </Field>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.actions}>
        <button style={styles.cancelBtn} onClick={onClose}>キャンセル</button>
        <button style={styles.confirmBtn} onClick={handleSave} disabled={loading}>
          {loading ? '変更中...' : '変更する'}
        </button>
      </div>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: 'var(--txt2)', fontWeight: 600, marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  h3: { fontSize: '17px', fontWeight: 700, color: 'var(--gold-l)', marginBottom: '20px' },
  info: { fontSize: '13px', color: 'var(--txt2)', marginBottom: '20px', padding: '12px 14px', background: 'var(--bg2)', borderRadius: 'var(--rs)', border: '1px solid var(--border)' },
  teamName: { fontWeight: 700, color: 'var(--gold-l)' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 'var(--rs)', background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt)', fontSize: '14px', outline: 'none' },
  error: { fontSize: '13px', color: 'var(--red)', marginBottom: '12px', padding: '8px 12px', background: 'rgba(239,68,68,.08)', borderRadius: 'var(--rs)', border: '1px solid rgba(239,68,68,.2)' },
  actions: { display: 'flex', gap: '10px', marginTop: '24px' },
  cancelBtn: { flex: 1, padding: '11px', borderRadius: 'var(--rs)', fontSize: '14px', fontWeight: 600, border: '1px solid var(--border)', color: 'var(--txt2)', cursor: 'pointer', background: 'transparent' },
  confirmBtn: { flex: 1, padding: '11px', borderRadius: 'var(--rs)', fontSize: '14px', fontWeight: 600, background: 'linear-gradient(135deg,var(--gold),#7F1D1D)', color: '#FFFFFF', cursor: 'pointer', border: 'none' },
}
