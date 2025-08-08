import React, { useState } from 'react'
import Login from './Login'
import Register from './Register'

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-background-secondary relative">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
        {isLogin ? (
          <Login onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <Register onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}

export default AuthContainer
