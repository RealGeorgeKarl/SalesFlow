import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, User, ShoppingCart, CreditCard, FileText } from 'lucide-react';
import CustomerStep from './steps/CustomerStep';
import ProductStep from './steps/ProductStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmationStep from './steps/ConfirmationStep';
import { Customer, CartItem, Sale } from '../../types';

export interface NewSaleData {
  customer: Customer | null;
  cart: CartItem[];
  sellerName: string;
  notes: string;
  paymentType: 'Full Payment' | 'Down Payment + Installments' | 'Installment Only';
  downPaymentAmount: number;
  installmentPlanId: string;
  totalAmount: number;
}

const NewSale: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [saleData, setSaleData] = useState<NewSaleData>({
    customer: null,
    cart: [],
    sellerName: '',
    notes: '',
    paymentType: 'Full Payment',
    downPaymentAmount: 0,
    installmentPlanId: '',
    totalAmount: 0,
  });

  const steps = [
    { id: 1, name: 'Customer', icon: User },
    { id: 2, name: 'Products', icon: ShoppingCart },
    { id: 3, name: 'Payment', icon: CreditCard },
    { id: 4, name: 'Confirmation', icon: FileText },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Only allow clicking on completed steps or the next step
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const updateSaleData = (updates: Partial<NewSaleData>) => {
    setSaleData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return saleData.customer !== null;
      case 2:
        return saleData.cart.length > 0;
      case 3:
        return saleData.paymentType !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerStep
            selectedCustomer={saleData.customer}
            onCustomerSelect={(customer) => updateSaleData({ customer })}
          />
        );
      case 2:
        return (
          <ProductStep
            cart={saleData.cart}
            onCartUpdate={(cart) => {
              const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
              updateSaleData({ cart, totalAmount });
            }}
          />
        );
      case 3:
        return (
          <PaymentStep
            saleData={saleData}
            onUpdate={updateSaleData}
          />
        );
      case 4:
        return (
          <ConfirmationStep
            saleData={saleData}
            onComplete={() => {
              // Handle sale completion
              console.log('Sale completed:', saleData);
              // Reset form or redirect
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">New Sale</h1>
        <p className="text-gray-600">Create a new sale with flexible payment options</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center cursor-pointer ${
                  step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
                onClick={() => handleStepClick(step.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step.id === currentStep
                      ? 'bg-blue-600 text-white border-blue-600'
                      : step.id < currentStep
                      ? 'bg-blue-100 text-blue-600 border-blue-600'
                      : 'bg-gray-100 text-gray-400 border-gray-300'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="ml-2 font-medium">{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || currentStep === steps.length}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === steps.length ? 'Complete' : 'Next'}
          {currentStep < steps.length && <ChevronRight className="h-4 w-4 ml-2" />}
        </button>
      </div>
    </div>
  );
};

export default NewSale;