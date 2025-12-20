import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authAPI.login(email, password, userType);
      
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Navigate based on role
        if (response.data.user.role === 'patient') {
          navigate('/patient-dashboard');
        } else {
          navigate('/doctor-management');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ALZ ForeSight</h1>
            <p className="text-gray-400 text-sm">Login to your account</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setUserType('patient')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                userType === 'patient'
                  ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Patient
            </button>
            <button
              type="button"
              onClick={() => setUserType('doctor')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                userType === 'doctor'
                  ? 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Doctor
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-4 py-3 rounded-xl text-xs">
              <div className="font-semibold mb-1">Test Accounts:</div>
              <div>👨‍⚕️ Doctor: doctor@test.com / password123</div>
              <div>👤 Patient: patient@test.com / password123</div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                         text-white placeholder-gray-400 text-sm focus:outline-none focus:border-white/40 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                         text-white placeholder-gray-400 text-sm focus:outline-none focus:border-white/40 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-300 cursor-pointer">
                <input type="checkbox" className="mr-2 rounded" />
                Remember me
              </label>
              <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 
                         disabled:opacity-50 disabled:cursor-not-allowed ${
                userType === 'patient'
                  ? 'bg-gradient-to-br from-teal-400 to-teal-600'
                  : 'bg-gradient-to-br from-red-400 to-red-600'
              }`}
            >
              {loading ? 'Logging in...' : `Login as ${userType === 'patient' ? 'Patient' : 'Doctor'}`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 text-xs">
          <p>© 2025 ALZ ForeSight. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
