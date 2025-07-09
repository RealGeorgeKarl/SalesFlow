import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';
import LoadingOverlay from '../common/LoadingOverlay';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, retryDelay } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <LoadingOverlay isLoading={isLoading} message="Signing in...">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to SalesFlow</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to your master account</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <a
                href="https://ceintelly.org/forgot-password"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <span className="text-sm text-red-700">{error}</span>
                  {retryDelay > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      Please wait {retryDelay} second{retryDelay !== 1 ? 's' : ''} before trying again
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || retryDelay > 0}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {retryDelay > 0 ? `Please wait (${retryDelay}s)` : isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Create Account Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a
                  href="https://ceintelly.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                >
                  Create Account
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Powered by Ceintelly.org */}
        <div className="flex items-center justify-center mt-8 space-x-2">
          <img
            src="/ceintelly-logo.svg"
            alt="Ceintelly Logo"
            className="h-6 w-auto"
          />
          <span className="text-sm text-gray-500">
            Powered by{' '}
            <a
              href="https://ceintelly.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
            >
              ceintelly.org
            </a>
          </span>
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default LoginForm;