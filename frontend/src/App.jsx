import { AuthProvider } from './context/AuthContext'
import AppRouter from './router/AppRouter'
import './styles/index.css'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
