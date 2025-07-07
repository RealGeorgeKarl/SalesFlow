import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { User, Shield, Plus, Edit, Trash2, Loader2, Key, Users, Crown } from 'lucide-react';
import AddSalespersonModal from './modals/AddSalespersonModal';
import ChangeAdminPasswordModal from './modals/ChangeAdminPasswordModal';
import ChangeSalespersonPasswordModal from './modals/ChangeSalespersonPasswordModal';
import DeleteSalespersonModal from './modals/DeleteSalespersonModal';

const PersonaManagement: React.FC = () => {
  const { user } = useAuth();
  const { availablePersonas, isLoadingSettings, settingsLoadError, loadSettings } = useSettings();
  
  // Modal states
  const [showAddSalesperson, setShowAddSalesperson] = useState(false);
  const [showChangeAdminPassword, setShowChangeAdminPassword] = useState(false);
  const [showChangeSalespersonPassword, setShowChangeSalespersonPassword] = useState(false);
  const [showDeleteSalesperson, setShowDeleteSalesperson] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    if (user?.id) {
      loadSettings(user.id);
    }
  }, [user?.id, loadSettings]);

  const handleModalSuccess = () => {
    // Refresh data after successful operations
    if (user?.id) {
      loadSettings(user.id);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading personas...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your account data</p>
        </div>
      </div>
    );
  }

  if (settingsLoadError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Data</h3>
          <p className="text-red-600 mb-4">{settingsLoadError}</p>
          <button
            onClick={() => user?.id && loadSettings(user.id)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const salespersonPersonas = availablePersonas.filter(p => p.user_type === 'Salesperson');
  const adminPersonas = availablePersonas.filter(p => p.user_type === 'Admin');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Persona Management</h1>
                <p className="text-gray-600 mt-1">Manage user accounts and access permissions</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowAddSalesperson(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Salesperson
          </button>
        </div>
      </div>

      {/* Admin Personas Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Administrator Accounts</h2>
              <p className="text-gray-600">Full system access and management capabilities</p>
            </div>
          </div>
          <button
            onClick={() => setShowChangeAdminPassword(true)}
            className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
          >
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminPersonas.map((persona, index) => (
            <div key={`${persona.name}-${index}`} className="bg-white border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-purple-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{persona.name}</h3>
                    <p className="text-sm text-purple-600 font-medium">{persona.user_type}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChangeAdminPassword(true)}
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Change Password"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">Permissions:</span> Full system access, user management, settings
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Salesperson Personas Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Salesperson Accounts</h2>
              <p className="text-gray-600">Sales and customer management access</p>
            </div>
          </div>
          {salespersonPersonas.length > 0 && (
            <div className="flex space-x-3">
              <button
                onClick={() => setShowChangeSalespersonPassword(true)}
                className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </button>
              <button
                onClick={() => setShowDeleteSalesperson(true)}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </button>
            </div>
          )}
        </div>
        
        {salespersonPersonas.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Salesperson Accounts</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Get started by creating your first salesperson account to enable sales team access
            </p>
            <button 
              onClick={() => setShowAddSalesperson(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Salesperson
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salespersonPersonas.map((persona, index) => (
              <div key={`${persona.name}-${index}`} className="bg-white border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{persona.name}</h3>
                      <p className="text-sm text-green-600 font-medium">{persona.user_type}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setShowChangeSalespersonPassword(true)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Change Password"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => setShowDeleteSalesperson(true)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Permissions:</span> Sales management, customer access
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Account Management Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-blue-800">Secure password management for all accounts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-blue-800">Role-based access control and permissions</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-blue-800">Easy salesperson account creation and deletion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-blue-800">Comprehensive audit trail for all changes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddSalespersonModal
        isOpen={showAddSalesperson}
        onClose={() => setShowAddSalesperson(false)}
        onSuccess={handleModalSuccess}
      />

      <ChangeAdminPasswordModal
        isOpen={showChangeAdminPassword}
        onClose={() => setShowChangeAdminPassword(false)}
        onSuccess={handleModalSuccess}
      />

      <ChangeSalespersonPasswordModal
        isOpen={showChangeSalespersonPassword}
        onClose={() => setShowChangeSalespersonPassword(false)}
        onSuccess={handleModalSuccess}
        salespersons={salespersonPersonas}
      />

      <DeleteSalespersonModal
        isOpen={showDeleteSalesperson}
        onClose={() => setShowDeleteSalesperson(false)}
        onSuccess={handleModalSuccess}
        salespersons={salespersonPersonas}
      />
    </div>
  );
};

export default PersonaManagement;