import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const checkAuth = async () => {
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
          setToken(null)
          setSessionId(null)
          localStorage.removeItem('token')
          localStorage.removeItem('sessionId')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
        setToken(null)
        setSessionId(null)
        localStorage.removeItem('token')
        localStorage.removeItem('sessionId')
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [token])

  const login = async (mobile, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mobile, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        setSessionId(data.sessionId)
        localStorage.setItem('token', data.token)
        localStorage.setItem('sessionId', data.sessionId)
        // Set a flag to create new chat after login
        localStorage.setItem('shouldCreateNewChat', 'true')
        navigate('/')
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const register = async (username, mobile, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, mobile, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        setSessionId(data.sessionId)
        localStorage.setItem('token', data.token)
        localStorage.setItem('sessionId', data.sessionId)
        // Set a flag to create new chat after registration
        localStorage.setItem('shouldCreateNewChat', 'true')
        navigate('/')
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      setSessionId(null)
      localStorage.removeItem('token')
      localStorage.removeItem('sessionId')
      navigate('/login')
    }
  }

  const value = {
    user,
    token,
    sessionId,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
