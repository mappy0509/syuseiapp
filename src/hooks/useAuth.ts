import { useState, useCallback } from 'react'
import { getSession, clearSession, login, changePassword } from '../lib/auth'
import type { AuthState } from '../lib/auth'

export function useAuth() {
  const [auth, setAuth] = useState<AuthState | null>(() => getSession())

  const handleLogin = useCallback(async (teamName: string, password: string) => {
    const state = await login(teamName, password)
    setAuth(state)
    return state
  }, [])

  const handleLogout = useCallback(() => {
    clearSession()
    setAuth(null)
  }, [])

  const handleChangePassword = useCallback(
    async (oldPw: string, newPw: string) => {
      if (!auth) throw new Error('未ログイン')
      await changePassword(auth.teamId, oldPw, newPw)
    },
    [auth]
  )

  return { auth, login: handleLogin, logout: handleLogout, changePassword: handleChangePassword }
}
