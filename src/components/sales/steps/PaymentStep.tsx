import React from 'react';
import { CreditCard, DollarSign } from 'lucide-react';

interface PaymentStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ onNext, onPrevious }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <CreditCard className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Payment Information</h2>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <DollarSign className="w-5 h-5" />
          <p>Payment step implementation coming soon</p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        {onPrevious && (
          <button
            onClick={onPrevious}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Previous
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;