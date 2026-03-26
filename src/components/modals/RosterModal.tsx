import { useState } from 'react'
import { Modal } from '../ui/Modal'
import type { Member, MemberRole } from '../../lib/types'

interface Props {
  members: Member[]
  onClose: () => void
  onAdd: (name: string, company: string, role: MemberRole) => Promise<void>
  onBulkAdd: (entries: { name: string; company: string }[]) => Promise<void>
  onEdit: (id: string, name: string, company: string, role: MemberRole) => Promise<void>
  onDelete: (id: string, name: string) => Promise<void>
}

type Tab = 'list' | 'add' | 'bulk'

const ROLES: MemberRole[] = ['準会員', '正会員', '世話人', '副代表', 'オーナー', '退会']

export function RosterModal({ members, onClose, onAdd, onBulkAdd, onEdit, onDelete }: Props) {
  const [tab, setTab] = useState<Tab>('list')
  const [editId, setEditId] = useState<string | null>(null)

  // Add form
  const [addName, setAddName] = useState('')
  const [addCompany, setAddCompany] = useState('')
  const [addRole, setAddRole] = useState<MemberRole>('準会員')

  // Bulk form
  const [bulkText, setBulkText] = useState('')

  // Edit form
  const [editName, setEditName] = useState('')
  const [editCompany, setEditCompany] = useState('')
  const [editRole, setEditRole] = useState<MemberRole>('準会員')

  const startEdit = (m: Member) => {
    setEditId(m.id)
    setEditName(m.name)
    setEditCompany(m.company ?? '')
    setEditRole(m.role)
  }

  const handleAdd = async () => {
    if (!addName.trim()) return
    await onAdd(addName.trim(), addCompany.trim(), addRole)
    setAddName('')
    setAddCompany('')
    setTab('list')
  }

  const handleBulk = async () => {
    const lines = bulkText.trim().split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    const entries = lines.map((line) => {
      const parts = line.split(/[,，\t]/).map((s) => s.trim().replace(/[""]/g, ''))
      return { name: parts[0] ?? '', company: parts[1] ?? '' }
    }).filter((e) => e.name.length >= 1)
    if (entries.length === 0) return
    await onBulkAdd(entries)
    setBulkText('')
    setTab('list')
  }

  const handleEdit = async () => {
    if (!editId || !editName.trim()) return
    await onEdit(editId, editName.trim(), editCompany.trim(), editRole)
    setEditId(null)
  }

  return (
    <Modal onClose={onClose}>
      <h3 style={styles.h3}>👥 メンバー名簿管理</h3>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['list', 'add', 'bulk'] as Tab[]).map((t) => (
          <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }} onClick={() => setTab(t)}>
            {{ list: '📋 一覧', add: '＋ 個別追加', bulk: '📥 一括登録' }[t]}
          </button>
        ))}
      </div>

      {/* LIST */}
      {tab === 'list' && !editId && (
        <>
          <div style={styles.count}>登録メンバー: {members.length}名</div>
          <div style={styles.list}>
            {members.length === 0 && (
              <div style={styles.empty}>メンバーが登録されていません</div>
            )}
            {members.map((m, i) => (
              <div key={m.id} style={styles.row}>
                <span style={styles.num}>{i + 1}</span>
                <span style={styles.rowName}>{m.name}</span>
                <span style={styles.rowCompany}>{m.company || '—'}</span>
                <div style={styles.rowActions}>
                  <button style={styles.rowBtn} onClick={() => startEdit(m)}>✏️</button>
                  <button style={styles.rowBtn} onClick={() => {
                    if (confirm(`${m.name}を削除しますか？`)) onDelete(m.id, m.name)
                  }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={onClose}>閉じる</button>
          </div>
        </>
      )}

      {/* EDIT */}
      {tab === 'list' && editId && (
        <>
          <h4 style={{ fontSize: '14px', color: 'var(--gold)', marginBottom: '16px' }}>プロフィール編集</h4>
          <Field label="氏名"><input style={styles.input} value={editName} onChange={(e) => setEditName(e.target.value)} /></Field>
          <Field label="会社名"><input style={styles.input} value={editCompany} onChange={(e) => setEditCompany(e.target.value)} /></Field>
          <Field label="役職">
            <select style={styles.input} value={editRole} onChange={(e) => setEditRole(e.target.value as MemberRole)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={() => setEditId(null)}>キャンセル</button>
            <button style={styles.confirmBtn} onClick={handleEdit}>保存する</button>
          </div>
        </>
      )}

      {/* ADD */}
      {tab === 'add' && (
        <>
          <Field label="氏名 *"><input style={styles.input} placeholder="山田 太郎" value={addName} onChange={(e) => setAddName(e.target.value)} /></Field>
          <Field label="会社名"><input style={styles.input} placeholder="山田株式会社" value={addCompany} onChange={(e) => setAddCompany(e.target.value)} /></Field>
          <Field label="役職">
            <select style={styles.input} value={addRole} onChange={(e) => setAddRole(e.target.value as MemberRole)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={onClose}>キャンセル</button>
            <button style={styles.confirmBtn} onClick={handleAdd}>追加してもう1名入力</button>
          </div>
        </>
      )}

      {/* BULK */}
      {tab === 'bulk' && (
        <>
          <Field label="メンバーリストを貼り付けてください">
            <textarea
              style={{ ...styles.input, minHeight: '200px', resize: 'vertical', lineHeight: 1.8 }}
              placeholder={'1行に1名ずつ（カンマ区切り）：\n増田一誠,ケザワークスプロジェクト\n岩崎宏美,岩崎スター\n浜浩之助,スパイアソリューションズ\n\n会社名は省略OK'}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
          </Field>
          <div style={{ fontSize: '11px', color: 'var(--txt3)', lineHeight: 1.6, marginBottom: '14px' }}>
            ※ 重複する氏名は自動でスキップします（現在 {members.length}名登録済み）
          </div>
          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={onClose}>キャンセル</button>
            <button style={styles.confirmBtn} onClick={handleBulk}>一括登録する</button>
          </div>
        </>
      )}
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
  tabs: { display: 'flex', gap: '4px', marginBottom: '18px', background: 'var(--bg2)', padding: '4px', borderRadius: 'var(--rs)' },
  tab: { flex: 1, padding: '9px 6px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textAlign: 'center', color: 'var(--txt3)', cursor: 'pointer', border: 'none', background: 'transparent' },
  tabActive: { background: 'var(--card2)', color: 'var(--gold-l)', boxShadow: '0 2px 6px rgba(0,0,0,.2)' },
  count: { fontSize: '11px', color: 'var(--txt3)', marginBottom: '10px', textAlign: 'right' },
  list: { maxHeight: '320px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--rs)', marginBottom: '14px' },
  row: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: '13px' },
  num: { fontSize: '11px', color: 'var(--txt3)', fontFamily: "'Outfit', sans-serif", width: '22px', flexShrink: 0 },
  rowName: { flex: 1, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowCompany: { flex: 1, color: 'var(--txt2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowActions: { display: 'flex', gap: '2px', flexShrink: 0 },
  rowBtn: { width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'var(--txt3)', cursor: 'pointer', background: 'transparent', border: 'none' },
  empty: { padding: '24px', textAlign: 'center', color: 'var(--txt3)', fontSize: '13px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 'var(--rs)', background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt)', fontSize: '14px', outline: 'none' },
  actions: { display: 'flex', gap: '10px', marginTop: '24px' },
  cancelBtn: { flex: 1, padding: '11px', borderRadius: 'var(--rs)', fontSize: '14px', fontWeight: 600, border: '1px solid var(--border)', color: 'var(--txt2)', cursor: 'pointer', background: 'transparent' },
  confirmBtn: { flex: 1, padding: '11px', borderRadius: 'var(--rs)', fontSize: '14px', fontWeight: 600, background: 'linear-gradient(135deg,var(--gold),#7F1D1D)', color: '#FFFFFF', cursor: 'pointer', border: 'none' },
}
