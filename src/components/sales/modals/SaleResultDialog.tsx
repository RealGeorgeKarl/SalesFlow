import React from 'react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SaleResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type: 'success' | 'error';
  isLoading?: boolean;
}

const SaleResultDialog: React.FC<SaleResultDialogProps> = ({ 
  isOpen, 
  onClose, 
  message, 
  type, 
  isLoading = false 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />;
    }
    
    return type === 'success' 
      ? <CheckCircle className="h-8 w-8 text-green-600" />
      : <AlertCircle className="h-8 w-8 text-red-600" />;
  };

  const getColors = () => {
    if (isLoading) {
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-900',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    }
    
    return type === 'success' 
      ? {
          bg: 'bg-green-100',
          border: 'border-green-200',
          text: 'text-green-900',
          button: 'bg-green-600 hover:bg-green-700'
        }
      : {
          bg: 'bg-red-100',
          border: 'border-red-200',
          text: 'text-red-900',
          button: 'bg-red-600 hover:bg-red-700'
        };
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl transform transition-all">
        <div className="text-center">
          {/* Icon */}
          <div className={`mx-auto h-16 w-16 ${colors.bg} rounded-full flex items-center justify-center mb-6 ${colors.border} border-2`}>
            {getIcon()}
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-bold ${colors.text} mb-4`}>
            {isLoading ? 'Processing Sale...' : type === 'success' ? 'Sale Completed!' : 'Sale Failed'}
          </h2>

          {/* Message */}
          <div className={`p-4 ${colors.bg} ${colors.border} border rounded-lg mb-6`}>
            <p className={`text-sm ${colors.text} leading-relaxed`}>
              {message}
            </p>
          </div>

          {/* Action Button */}
          {!isLoading && (
            <div className="flex justify-center space-x-3">
              <button
                onClick={onClose}
                className={`px-6 py-3 ${colors.button} text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center`}
              >
                {type === 'success' ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Continue
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 mr-2" />
                    Close
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleResultDialog;