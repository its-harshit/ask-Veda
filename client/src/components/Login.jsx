import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Phone, Lock, Eye, EyeOff, Bot } from 'lucide-react'
import npciLogo from '../assets/npci-logo.jpg'

const Login = ({ onSwitchToRegister }) => {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(mobile, password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-medium">
          <img src={npciLogo} alt="NPCI Logo" className="h-16 w-16 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h2>
        <p className="text-text-secondary">
          Sign in to continue with askVeda
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
            <p className="text-sm text-danger-600 font-medium">{error}</p>
          </div>
        )}

                     <div className="space-y-4">
             <div>
               <label htmlFor="mobile" className="block text-sm font-semibold text-text-secondary mb-3">
                 Mobile number
               </label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Phone className="h-5 w-5 text-gray-400" />
                 </div>
                 <input
                   id="mobile"
                   name="mobile"
                   type="tel"
                   autoComplete="tel"
                   required
                   value={mobile}
                   onChange={(e) => setMobile(e.target.value)}
                   className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-text-primary placeholder-gray-500"
                   placeholder="Enter your mobile number"
                   pattern="[0-9]{10}"
                   maxLength="10"
                 />
               </div>
             </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-text-secondary mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 pl-12 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-text-primary placeholder-gray-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-medium hover:shadow-large transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-text-secondary">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
    )
}

export default Login
