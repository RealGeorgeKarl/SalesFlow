import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, DollarSign, Calculator, Clock, Percent, Hash, Receipt } from 'lucide-react';
import { NewSaleData } from '../NewSale';
import { InstallmentPlan, FrequencyUnit, PaymentMethodType, PaymentMethod } from '../../../types';
import {formatCurrency} from "../../../utils/formatters";


interface PaymentSchedule {
  installment_number: number;
  amount: number;
  due_date: string;
}

interface PaymentStepProps {
  saleData: NewSaleData;
  onUpdate: (updates: Partial<NewSaleData>) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ saleData, onUpdate }) => {
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule[]>([]);
  
  // Custom installment state
  const [customInterestRate, setCustomInterestRate] = useState(0);
  const [customNumInstallments, setCustomNumInstallments] = useState(3);
  const [customDownPaymentAmount, setCustomDownPaymentAmount] = useState(0);
  const [customFrequencyUnit, setCustomFrequencyUnit] = useState<FrequencyUnit>('month');
  const [customFrequencyInterval, setCustomFrequencyInterval] = useState(1);
  const [customStartDate, setCustomStartDate] = useState('');

  // Sync local state with saleData
  useEffect(() => {
    if (saleData.customStartDate) {
      setCustomStartDate(saleData.customStartDate);
    }
  }, [saleData.customStartDate]);

  // Payment method constants
  const PAYMENT_METHOD_TYPES: PaymentMethodType[] = ['Cash', 'Card', 'Online Payment', 'Other'];
  
  const PAYMENT_METHODS_MAP: Record<PaymentMethodType, PaymentMethod[]> = {
    'Cash': ['Exact Cash', 'Cash (Needs Change)'],
    'Card': ['Visa', 'Mastercard', 'Debit Card', 'Credit Card'],
    'Online Payment': ['PayPal', 'Bank Transfer', 'Digital Wallet'],
    'Other': ['Check', 'Money Order', 'Store Credit'],
  };

  // Mock installment plans
  const installmentPlans: InstallmentPlan[] = [
    {
      id: '1',
      name: '3 Months Plan',
      description: 'Pay over 3 months with 5% interest',
      num_installments: 3,
      interval_days: 30,
      frequency_unit: 'month',
      frequency_interval: 1,
      interest_rate: 0.05,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: '6 Months Plan',
      description: 'Pay over 6 months with 8% interest',
      num_installments: 6,
      interval_days: 30,
      frequency_unit: 'month',
      frequency_interval: 1,
      interest_rate: 0.08,
      is_active: true,
      created_at: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      name: '12 Months Plan',
      description: 'Pay over 12 months with 12% interest',
      num_installments: 12,
      interval_days: 30,
      frequency_unit: 'month',
      frequency_interval: 1,
      interest_rate: 0.12,
      is_active: true,
      created_at: '2024-01-03T00:00:00Z',
    },
  ];

  useEffect(() => {
    if (saleData.paymentType !== 'Full Payment') {
      calculatePaymentSchedule();
    }
  }, [saleData.paymentType, saleData.installmentPlanId, saleData.downPaymentAmount, saleData.totalAmount, customInterestRate, customNumInstallments, customDownPaymentAmount, customFrequencyUnit, customFrequencyInterval, customStartDate]);

  const calculatePaymentSchedule = () => {
    let plan: InstallmentPlan | null = null;
    let numInstallments: number;
    let interestRate: number;
    let intervalDays: number;
    let startDate: Date;

    if (saleData.paymentType === 'Custom Installment') {
      numInstallments = customNumInstallments;
      interestRate = customInterestRate / 100; // Convert percentage to decimal
      
      
      // Calculate interval days based on frequency
      const frequencyMultiplier = customFrequencyInterval || 1;
      switch (customFrequencyUnit) {
        case 'day':
          intervalDays = 1 * frequencyMultiplier;
          break;
        case 'week':
          intervalDays = 7 * frequencyMultiplier;
          break;
        case 'month':
          intervalDays = 30 * frequencyMultiplier;
          break;
        case 'year':
          intervalDays = 365 * frequencyMultiplier;
          break;
        default:
          intervalDays = 30;
      }
      
      startDate = saleData.customStartDate ? new Date(saleData.customStartDate) : new Date();
    } else {
      plan = installmentPlans.find(p => p.id === saleData.installmentPlanId);
      if (!plan) return;
      
      numInstallments = plan.num_installments;
      interestRate = plan.interest_rate;
      intervalDays = plan.interval_days;
      startDate = saleData.customStartDate ? new Date(saleData.customStartDate) : new Date();
    }

    const totalAmount = saleData.totalAmount;
    let downPayment = 0;
    if (saleData.paymentType === 'Down Payment + Installments') {
      downPayment = saleData.downPaymentAmount;
    } else if (saleData.paymentType === 'Custom Installment') {
      downPayment = customDownPaymentAmount;
    }
    
    const principalAmount = totalAmount - downPayment;
    const interestAmount = principalAmount * interestRate;
    const totalWithInterest = principalAmount + interestAmount;
    const installmentAmount = totalWithInterest / numInstallments;

    const schedule: PaymentSchedule[] = [];
    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (i + 1) * intervalDays);
      
      schedule.push({
        installment_number: i + 1,
        amount: installmentAmount,
        due_date: dueDate.toISOString().split('T')[0],
      });
    }

    setPaymentSchedule(schedule);
  };

  const handlePaymentTypeChange = (type: NewSaleData['paymentType']) => {
    if (type === 'Custom Installment') {
      onUpdate({
        paymentType: type,
        customDownPaymentAmount: 0,
        customInterestRate: 0,
        customFrequencyUnit: 'month',
        customFrequencyInterval: 1,
        customStartDate: new Date().toISOString().split('T')[0],
        customNumInstallments: 3,
      });
      
      // Update local state to match
      setCustomInterestRate(0);
      setCustomNumInstallments(3);
      setCustomDownPaymentAmount(0);
      setCustomFrequencyUnit('month');
      setCustomFrequencyInterval(1);
      setCustomStartDate(new Date().toISOString().split('T')[0]);
    } else {
      onUpdate({
        paymentType: type,
        customDownPaymentAmount: undefined,
        customInterestRate: undefined,
        customFrequencyUnit: undefined,
        customFrequencyInterval: undefined,
        customStartDate: undefined,
        customNumInstallments: undefined,
      });
    }
    
    setPaymentSchedule([]);
  };

  const handleCustomValueChange = (field: string, value: any) => {
    switch (field) {
      case 'interestRate':
        setCustomInterestRate(value);
        onUpdate({ customInterestRate: value });
        break;
      case 'downPaymentAmount':
        setCustomDownPaymentAmount(value);
        onUpdate({ customDownPaymentAmount: value });
        break;
      case 'numInstallments':
        setCustomNumInstallments(value);
        onUpdate({ customNumInstallments: value });
        break;
      case 'frequencyUnit':
        setCustomFrequencyUnit(value);
        onUpdate({ customFrequencyUnit: value });
        break;
      case 'frequencyInterval':
        setCustomFrequencyInterval(value);
        onUpdate({ customFrequencyInterval: value });
        break;
      case 'startDate':
        setCustomStartDate(value);
        onUpdate({ customStartDate: value });
        break;
    }
  };

  const getTotalWithInterest = () => {
    if (saleData.paymentType === 'Full Payment') {
      return saleData.totalAmount;
    }

    const interestRate = customInterestRate / 100;
    const downPayment = customDownPaymentAmount;
    
    const principalAmount = saleData.totalAmount - downPayment;
    const interestAmount = principalAmount * interestRate;
    return principalAmount + interestAmount + downPayment;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h2>

        
        
        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <input
            type="text"
            value={saleData.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes"
          />
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method Type
              </label>
              <select
                value={saleData.paymentMethodType}
                onChange={(e) => {
                  const newType = e.target.value as PaymentMethodType;
                  const firstMethod = PAYMENT_METHODS_MAP[newType][0];
                  onUpdate({ 
                    paymentMethodType: newType,
                    paymentMethod: firstMethod
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_METHOD_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={saleData.paymentMethod}
                onChange={(e) => onUpdate({ paymentMethod: e.target.value as PaymentMethod })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_METHODS_MAP[saleData.paymentMethodType].map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Code (Optional)
            </label>
            <div className="relative">
              <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={saleData.referenceCode}
                onChange={(e) => onUpdate({ referenceCode: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Transaction ID, Check number, etc."
              />
            </div>
          </div>
        </div>

        {/* Payment Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Terms
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['Full Payment', 'Custom Installment'] as const).map((type) => (
              <div
                key={type}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  saleData.paymentType === type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePaymentTypeChange(type)}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{type === 'Custom Installment' ? 'Installment Plan' : type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Date for Installment Plans */}
        {saleData.paymentType !== 'Full Payment' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={saleData.customStartDate || ''}
                onChange={(e) => onUpdate({ customStartDate: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              When should the {saleData.paymentType === 'Full Payment' ? 'payment' : 'installments'} start?
            </p>
          </div>
        )}



        {/* Custom Installment Fields */}
        {saleData.paymentType === 'Custom Installment' && (
          <div className="mb-6 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Installment Plan Configuration</h3>
            
            {/* Down Payment Option */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Down Payment (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={customDownPaymentAmount}
                  onChange={(e) => handleCustomValueChange('downPaymentAmount', parseFloat(e.target.value) || 0)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Maximum: {formatCurrency(saleData.totalAmount)}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={customInterestRate}
                    onChange={(e) => handleCustomValueChange('interestRate', parseFloat(e.target.value) || 0)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Installments
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={customNumInstallments}
                    onChange={(e) => handleCustomValueChange('numInstallments', parseInt(e.target.value) || 1)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency Unit
                </label>
                <select
                  value={customFrequencyUnit}
                  onChange={(e) => handleCustomValueChange('frequencyUnit', e.target.value as FrequencyUnit)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency Interval
                </label>
                <input
                  type="text"
                  value={customFrequencyInterval}
                  onChange={(e) => handleCustomValueChange('frequencyInterval', parseInt(e.target.value) || 1)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>
                Payment every {customFrequencyInterval} {customFrequencyUnit}
                {customFrequencyInterval > 1 ? 's' : ''} 
                {saleData.customStartDate && ` starting from ${new Date(saleData.customStartDate).toLocaleDateString()}`}
                {customDownPaymentAmount > 0 && ` (with ${formatCurrency(customDownPaymentAmount)} down payment)`}
              </p>
            </div>
          </div>
        )}

        {/* Payment Schedule Preview */}
        {paymentSchedule.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calculator className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Payment Schedule Preview</h3>
            </div>
            
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Original Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(saleData.totalAmount)}
                  </p>
                </div>
                {customDownPaymentAmount > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Down Payment</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(customDownPaymentAmount)}
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total with Interest</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(getTotalWithInterest())}
                  </p>
                </div>
              </div>

              {/* Installment Schedule */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Installments</h4>
                {paymentSchedule.map((installment) => (
                  <div key={installment.installment_number} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">
                      Installment #{installment.installment_number}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(installment.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Due: {installment.due_date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;