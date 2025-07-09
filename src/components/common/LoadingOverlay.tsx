import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children?: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = "Loading...", 
  children 
}) => {
  if (!isLoading && !children) {
    return null;
  }

  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Wait</h3>
              <p className="text-gray-600">{message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay;