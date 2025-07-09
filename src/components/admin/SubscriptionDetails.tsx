import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { CheckCircle, XCircle, Calendar, Info, ExternalLink, CreditCard, Clock, AlertTriangle } from 'lucide-react';
import LoadingOverlay from '../common/LoadingOverlay';

const SubscriptionDetails: React.FC = () => {
  const { user } = useAuth();
  const { smsAccount, isLoadingSettings, settingsLoadError, loadSettings } = useSettings();

  // Load settings on component mount
  useEffect(() => {
    if (user?.id) {
      loadSettings(user.id);
    }
  }, [user?.id, loadSettings]);

  const isSubscriptionExpired = (expirationDate: string | null): boolean => {
    if (!expirationDate) return true; // No expiration date means it's expired or not set
    try {
      // Parse the date string. The format "YYYY-MM-DD HH:MM:SS.ms+TZ" is handled by Date constructor.
      const expiry = new Date(expirationDate);
      const now = new Date();
      return now > expiry;
    } catch (e) {
      console.error("Error parsing expiration date:", e);
      return true; // Assume expired if date parsing fails
    }
  };

  if (settingsLoadError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Subscription</h3>
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

  const isOneTime = smsAccount?.is_one_time;
  const expirationDate = smsAccount?.sms_expiration_date;
  const expired = isSubscriptionExpired(expirationDate || null);

  return (
    <LoadingOverlay isLoading={isLoadingSettings} message="Loading subscription details...">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Details</h1>
            <p className="text-gray-600 mt-1">Manage your account subscription and billing information</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subscription Status Card */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Current Status</h2>
          
          {isOneTime ? (
            <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Lifetime Subscription</h3>
                  <p className="text-green-700 mb-4">
                    You have a one-time payment subscription with lifetime access to all features.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Benefits:</span> No recurring charges, permanent access, all premium features included
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : expirationDate && !expired ? (
            <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Active Subscription</h3>
                  <p className="text-blue-700 mb-4">
                    Your subscription is active and will renew automatically.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Expires on:</span>
                      <span className="text-sm text-blue-900 font-semibold">
                        {new Date(expirationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Subscription Expired</h3>
                  <p className="text-red-700 mb-4">
                    Your subscription has expired or is not active. Renew to continue using premium features.
                  </p>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Action Required:</span> Please renew your subscription to restore full access
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Information Card */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Info className="h-8 w-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscription Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Account ID</span>
                    <span className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                      {smsAccount?.id || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Subscription Type</span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      isOneTime 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isOneTime ? 'One-Time Payment' : 'Stack Subscription'}
                    </span>
                  </div>
                  
                  {expirationDate && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Expiration Date</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-900 font-medium">
                          {new Date(expirationDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(expirationDate).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    <div className="flex items-center space-x-2">
                      {isOneTime ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-700 font-medium">Lifetime Access</span>
                        </>
                      ) : !expired ? (
                        <>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-blue-700 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-red-700 font-medium">Expired</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ExternalLink className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Subscription Management</h3>
            <p className="text-blue-700 mb-4">
              Visit our customer portal to manage your subscription, update payment methods, or view billing history.
            </p>
            <a
              href="https://ceintelly.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Manage Subscription
            </a>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Complete sales management system</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Customer relationship management</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Flexible payment plans</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Multi-user account management</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Comprehensive reporting</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">24/7 customer support</span>
          </div>
        </div>
      </div>
      </div>
    </LoadingOverlay>
  );
};

export default SubscriptionDetails;