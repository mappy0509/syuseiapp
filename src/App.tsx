import { useAuth } from './hooks/useAuth'
import { LoginScreen } from './components/auth/LoginScreen'
import { AttendancePage } from './pages/AttendancePage'

function App() {
  const { auth, login, logout } = useAuth()

  if (!auth) {
    return <LoginScreen onLogin={login} />
  }

  return <AttendancePage auth={auth} onLogout={logout} />
}

export default App
