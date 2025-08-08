import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Phone, Lock, Eye, EyeOff, Bot } from 'lucide-react'

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return false
    }
    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    const result = await register(formData.username, formData.mobile, formData.password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-medium">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">Create account</h2>
        <p className="text-text-secondary">
          Sign up to get started with askVeda
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
            <label htmlFor="username" className="block text-sm font-semibold text-text-secondary mb-3">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-text-primary placeholder-gray-500"
                placeholder="Enter your username"
                minLength={3}
                maxLength={30}
              />
            </div>
          </div>

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
                   value={formData.mobile}
                   onChange={handleChange}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-4 pl-12 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-text-primary placeholder-gray-500"
                  placeholder="Enter your password"
                  minLength={6}
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-secondary mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-4 pl-12 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-text-primary placeholder-gray-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    )
}

export default Register
