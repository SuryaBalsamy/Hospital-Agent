import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [token, setToken]             = useState(null)
  const [isLoading, setIsLoading]     = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser  = localStorage.getItem('user')
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch {
        localStorage.clear()
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials) => {
    const res = await authService.login(credentials)
    const data = res.data
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify({
      user_id:   data.user_id,
      username:  data.username,
      role:      data.role,
      full_name: data.full_name,
    }))
    setToken(data.access_token)
    setUser({ user_id: data.user_id, username: data.username, role: data.role, full_name: data.full_name })
    setIsAuthenticated(true)
    return data
  }

  const logout = () => {
    localStorage.clear()
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = '/login'
  }

  const register = async (payload) => {
    const res = await authService.register(payload)
    return res.data
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
