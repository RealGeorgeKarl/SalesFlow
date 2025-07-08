import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, User, ShoppingCart, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useSaleData } from '../../hooks/useSaleData';
import CustomerStep from './steps/CustomerStep';
import ProductStep from './steps/ProductStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmationStep from './steps/ConfirmationStep';
import SaleResultDialog from './modals/SaleResultDialog';
import { Customer, CartItem, Sale, PaymentSchedule, FrequencyUnit, PaymentMethodType, PaymentMethod, RpcResult } from '../../types';

export interface NewSaleData {
  customer: Customer | null;
  cart: CartItem[];
  sellerName: string;
  notes: string;
  paymentType: 'Full Payment' | 'Custom Installment';
  customDownPaymentAmount?: number;
  customInterestRate?: number;
  customFrequencyUnit?: FrequencyUnit;
  customFrequencyInterval?: number;
  customStartDate?: string;
  customNumInstallments?: number;
  paymentMethodType: PaymentMethodType;
  paymentMethod: PaymentMethod;
  referenceCode: string;
  totalAmount: number;
}

const NewSale: React.FC = () => {
  const navigate = useNavigate();
  const { persona } = useAuth();
  const { customers, products, isLoading, error, addCustomer } = useSaleData();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompletingSale, setIsCompletingSale] = useState(false);
  
  // Result dialog state
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultType, setResultType] = useState<'success' | 'error'>('success');
  const [currentCompletedSaleData, setCurrentCompletedSaleData] = useState<NewSaleData | undefined>(undefined);

  const [saleData, setSaleData] = useState<NewSaleData>({
    customer: null,
    cart: [],
    sellerName: persona?.name || '',
    notes: '',
    paymentType: 'Full Payment',
    customDownPaymentAmount: 0,
    customStartDate: new Date().toISOString().split('T')[0], // Initialize with today's date
    paymentMethodType: 'Cash',
    paymentMethod: 'Exact Cash',
    referenceCode: '',
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

  const handleCompleteSale = async () => {
    setIsCompletingSale(true);
    setShowResultDialog(true);
    setResultMessage('Processing your sale...');
    setResultType('success');

    console.log(saleData);
    try {
      // Prepare items for the RPC call
      const items = saleData.cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      // Determine payment parameters based on payment type
      let rpcParams: any = {
        p_payment_type: saleData.paymentType,
        p_seller_name: saleData.sellerName,
        p_items: items,
        p_customer_id: saleData.customer?.id || null,
        p_notes: saleData.notes || null,
        p_payment_method_type: saleData.paymentMethodType,
        p_payment_method: saleData.paymentMethod,
        p_reference_code: saleData.referenceCode || null,
      };

      // Add installment-specific parameters
      if (saleData.paymentType === 'Custom Installment') {
        // Correct and concise way using the ternary operator
        rpcParams.p_payment_type = (saleData.customDownPaymentAmount && saleData.customDownPaymentAmount > 0) 
          ? 'Down Payment' : 'Installment Only';
        rpcParams.p_down_payment = saleData.customDownPaymentAmount || 0;
        rpcParams.p_interest_rate = (saleData.customInterestRate || 0) / 100;
        rpcParams.p_frequency_unit = saleData.customFrequencyUnit;
        rpcParams.p_frequency_interval = saleData.customFrequencyInterval;
        rpcParams.p_number_of_installments = saleData.customNumInstallments;
        rpcParams.p_start_date_time = saleData.customStartDate ? new Date(saleData.customStartDate).toISOString() : new Date().toISOString();
      }
      console.log(rpcParams);

      // Call the process_sale RPC function
      const { data, error } = await supabase.rpc('process_sale', rpcParams);

      console.log(data);
      if (error) throw error;

      // Handle both array and scalar responses from RPC
      let result: RpcResult;
      if (Array.isArray(data)) {
        if (data.length === 0) throw new Error('No data returned from sale processing');
        result = data[0];
      } else {
        // If data is not an array, it might be a scalar or object
        if (typeof data === 'object' && data !== null) {
          result = data as RpcResult;
        } else {
          throw new Error('Invalid response format from sale processing');
        }
      }
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Store the completed sale data before resetting
      setCurrentCompletedSaleData({ ...saleData });

      // Success! Reset form
      setSaleData({
        customer: null,
        cart: [],
        sellerName: persona?.name || '',
        notes: '',
        paymentType: 'Full Payment',
        customDownPaymentAmount: 0,
        customStartDate: new Date().toISOString().split('T')[0],
        paymentMethodType: 'Cash',
        paymentMethod: 'Exact Cash',
        referenceCode: '',
        totalAmount: 0,
      });
      setCurrentStep(1);
      
      // Show success message
      setResultMessage('Sale completed successfully! You will be redirected to the dashboard.');
      setResultType('success');
      
    } catch (err) {
      console.error('Sale completion error:', err);
      setResultMessage(err instanceof Error ? err.message : 'Failed to complete sale. Please try again.');
      setResultType('error');
    } finally {
      setIsCompletingSale(false);
    }
  };

  const handleDone = () => {
    setShowResultDialog(false);
    setCurrentCompletedSaleData(undefined);
    navigate('/dashboard');
  };

  const handleCloseResultDialog = () => {
    setShowResultDialog(false);
    if (resultType === 'error') {
      setCurrentCompletedSaleData(undefined);
    }
  };

  // Mock installment plans for parameter mapping
  const installmentPlans = [
    {
      id: '1',
      name: '3 Months Plan',
      num_installments: 3,
      frequency_unit: 'month',
      frequency_interval: 1,
      interest_rate: 0.05,
    },
    {
      id: '2',
      name: '6 Months Plan',
      num_installments: 6,
      frequency_unit: 'month',
      frequency_interval: 1,
      interest_rate: 0.08,
    },
    {
      id: '3',
      name: '12 Months Plan',
      num_installments: 12,
      frequency_unit: 'month',
      frequency_interval: 1,
      interest_rate: 0.12,
    },
  ];

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
            customers={customers}
            addCustomer={addCustomer}
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
            products={products}
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
            onCompleteSale={handleCompleteSale}
            isCompletingSale={isCompletingSale}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading sale data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Result Dialog */}
      <SaleResultDialog
        isOpen={showResultDialog}
        onClose={resultType === 'error' ? handleCloseResultDialog : handleCloseResultDialog}
        onDone={resultType === 'success' ? handleDone : undefined}
        message={resultMessage}
        type={resultType}
        isLoading={isCompletingSale}
        saleData={resultType === 'success' ? currentCompletedSaleData : undefined}
      />
    </div>
  );
};

export default NewSale;