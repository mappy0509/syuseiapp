import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { AuthState } from '../../lib/auth'

interface Props {
  onLogin: (teamName: string, password: string) => Promise<AuthState>
}

export function LoginScreen({ onLogin }: Props) {
  const [teams, setTeams] = useState<string[]>([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('teams')
      .select('name')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const names = data.map((t) => t.name)
          setTeams(names)
          setSelectedTeam(names[0])
        }
      })
  }, [])

  const handleSubmit = async () => {
    if (!selectedTeam) return
    setLoading(true)
    setError('')
    try {
      await onLogin(selectedTeam, password)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'ログイン失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <img src="/logo.png" alt="福岡中央ロゴ" style={styles.logo} />
        <div style={styles.sub}>出席管理ダッシュボード</div>

        <div style={styles.field}>
          <label style={styles.label}>チーム名</label>
          <select
            style={styles.input}
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            {teams.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>パスワード</label>
          <input
            style={styles.input}
            type="password"
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>

        <div style={styles.hint}>
          ※ チーム名を選んでログイン。データはサーバーに保存されます。
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  logo: {
    width: '220px',
    maxWidth: '100%',
    marginBottom: '8px',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  sub: {
    fontSize: '12px',
    color: '#6B7280',
    letterSpacing: '.1em',
    marginBottom: '32px',
  },
  field: {
    marginBottom: '16px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#374151',
    fontWeight: 600,
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#F9FAFB',
    border: '1px solid #D1D5DB',
    color: '#1F2937',
    fontSize: '15px',
    outline: 'none',
  },
  error: {
    fontSize: '13px',
    color: '#EF4444',
    marginBottom: '12px',
    padding: '8px 12px',
    background: 'rgba(239,68,68,.08)',
    borderRadius: '8px',
    border: '1px solid rgba(239,68,68,.2)',
  },
  btn: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    marginTop: '8px',
    background: 'linear-gradient(135deg,#B91C1C,#991B1B)',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: 700,
    boxShadow: '0 4px 16px rgba(185,28,28,.25)',
    cursor: 'pointer',
    border: 'none',
  },
  hint: {
    fontSize: '11px',
    color: '#9CA3AF',
    marginTop: '20px',
    lineHeight: 1.6,
  },
}
