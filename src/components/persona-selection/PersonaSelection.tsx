import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePersona } from '../../contexts/PersonaContext';
import { Persona } from '../../types';
import { User, Shield, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const PersonaSelection: React.FC = () => {
  const [selectedPersonaType, setSelectedPersonaType] = useState<'Admin' | 'Salesperson' | null>(null);
  const [salespersonName, setSalespersonName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { selectPersona, logout, isLoading, retryDelay } = useAuth();
  const { availablePersonas } = usePersona();

  const handlePersonaTypeSelect = (type: 'Admin' | 'Salesperson') => {
    setSelectedPersonaType(type);
    setPassword('');
    setSalespersonName('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonaType) return;

    setError('');

    try {
      // Construct the persona object based on selected type
      const persona: Persona = {
        name: selectedPersonaType === 'Admin' ? 'Admin' : salespersonName,
        user_type: selectedPersonaType,
      };

      await selectPersona(persona, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const canSubmit = () => {
    if (!selectedPersonaType || !password) return false;
    if (selectedPersonaType === 'Salesperson' && !salespersonName.trim()) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Select Your Role</h2>
          <p className="mt-2 text-sm text-gray-600">Choose your role to continue</p>
        </div>

        <div className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Role
            </label>
            <div className="grid grid-cols-1 gap-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPersonaType === 'Admin'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handlePersonaTypeSelect('Admin')}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Admin</h3>
                    <p className="text-sm text-gray-500">Full system access</p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPersonaType === 'Salesperson'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handlePersonaTypeSelect('Salesperson')}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Salesperson</h3>
                    <p className="text-sm text-gray-500">Sales and customer management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          {selectedPersonaType && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedPersonaType === 'Salesperson' && (
                <div>
                  <label htmlFor="salesperson-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Salesperson Name
                  </label>
                  <input
                    id="salesperson-name"
                    type="text"
                    value={salespersonName}
                    onChange={(e) => setSalespersonName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="persona-password" className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedPersonaType === 'Admin' ? 'Admin Password' : 'Password'}
                </label>
                <input
                  id="persona-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                />
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
                disabled={!canSubmit() || isLoading || retryDelay > 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {retryDelay > 0 ? (
                  `Please wait (${retryDelay}s)`
                ) : isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          )}

          <div className="text-center">
            <button
              onClick={logout}
              className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaSelection;