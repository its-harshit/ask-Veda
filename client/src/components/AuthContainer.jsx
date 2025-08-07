import React, { useState } from 'react'
import Login from './Login'
import Register from './Register'

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div>
      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  )
}

export default AuthContainer
