import { supabase } from './supabase'

export interface AuthState {
  teamId: string
  teamName: string
  isAdmin: boolean
}

const SESSION_KEY = 'shusei_auth'

export function getSession(): AuthState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthState) : null
  } catch {
    return null
  }
}

export function setSession(state: AuthState) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state))
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export async function login(
  teamName: string,
  password: string
): Promise<AuthState> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, password_hash, is_admin')
    .eq('name', teamName)
    .single()

  if (error || !data) {
    throw new Error('チームが見つかりません')
  }

  // Simple password check (password stored as plain text initially, can upgrade later)
  if (data.password_hash !== password) {
    throw new Error('パスワードが正しくありません')
  }

  const auth: AuthState = {
    teamId: data.id,
    teamName: data.name,
    isAdmin: data.is_admin ?? false,
  }
  setSession(auth)
  return auth
}

export async function changePassword(
  teamId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const { data, error } = await supabase
    .from('teams')
    .select('password_hash')
    .eq('id', teamId)
    .single()

  if (error || !data) throw new Error('チームが見つかりません')
  if (data.password_hash !== oldPassword) throw new Error('現在のパスワードが違います')
  if (newPassword.length < 4) throw new Error('新しいパスワードは4文字以上')

  const { error: updateError } = await supabase
    .from('teams')
    .update({ password_hash: newPassword })
    .eq('id', teamId)

  if (updateError) throw new Error('パスワード更新に失敗しました')
}
