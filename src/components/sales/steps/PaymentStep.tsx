import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, DollarSign, Calculator, Clock, Percent, Hash } from 'lucide-react';
import { NewSaleData } from '../NewSale';
import { InstallmentPlan, FrequencyUnit } from '../../../types';

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
  const [customFrequencyUnit, setCustomFrequencyUnit] = useState<FrequencyUnit>('month');
  const [customFrequencyInterval, setCustomFrequencyInterval] = useState(1);
  const [customStartDate, setCustomStartDate] = useState('');

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
  }, [saleData.paymentType, saleData.installmentPlanId, saleData.downPaymentAmount, saleData.totalAmount, customInterestRate, customNumInstallments, customFrequencyUnit, customFrequencyInterval, customStartDate]);

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
      
      startDate = customStartDate ? new Date(customStartDate) : new Date();
    } else {
      plan = installmentPlans.find(p => p.id === saleData.installmentPlanId);
      if (!plan) return;
      
      numInstallments = plan.num_installments;
      interestRate = plan.interest_rate;
      intervalDays = plan.interval_days;
      startDate = new Date();
    }

    const totalAmount = saleData.totalAmount;
    const downPayment = saleData.paymentType === 'Down Payment + Installments' ? saleData.downPaymentAmount : 0;
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
    onUpdate({
      paymentType: type,
      downPaymentAmount: 0,
      installmentPlanId: '',
      customInterestRate: undefined,
      customFrequencyUnit: undefined,
      customFrequencyInterval: undefined,
      customStartDate: undefined,
      customNumInstallments: undefined,
    });
    setPaymentSchedule([]);
    
    // Reset custom values
    setCustomInterestRate(0);
    setCustomNumInstallments(3);
    setCustomFrequencyUnit('month');
    setCustomFrequencyInterval(1);
    setCustomStartDate('');
  };

  const handleDownPaymentChange = (amount: number) => {
    onUpdate({ downPaymentAmount: amount });
  };

  const handleInstallmentPlanChange = (planId: string) => {
    onUpdate({ installmentPlanId: planId });
  };

  const handleCustomValueChange = (field: string, value: any) => {
    switch (field) {
      case 'interestRate':
        setCustomInterestRate(value);
        onUpdate({ customInterestRate: value });
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
    let interestRate: number;
    
    if (saleData.paymentType === 'Custom Installment') {
      interestRate = customInterestRate / 100;
    } else {
      const plan = installmentPlans.find(p => p.id === saleData.installmentPlanId);
      if (!plan) return saleData.totalAmount;
      interestRate = plan.interest_rate;
    }

    const principalAmount = saleData.totalAmount - (saleData.paymentType === 'Down Payment + Installments' ? saleData.downPaymentAmount : 0);
    const interestAmount = principalAmount * interestRate;
    return principalAmount + interestAmount + (saleData.paymentType === 'Down Payment + Installments' ? saleData.downPaymentAmount : 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
        
        {/* Notes */}
        <div className="mb-6">
          <div>
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
        </div>

        {/* Payment Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['Full Payment', 'Down Payment + Installments', 'Installment Only', 'Custom Installment'] as const).map((type) => (
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
                  <span className="font-medium text-gray-900">{type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Down Payment Amount */}
        {saleData.paymentType === 'Down Payment + Installments' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Down Payment Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={saleData.downPaymentAmount}
                onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                min="0"
                max={saleData.totalAmount}
                step="0.01"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Maximum: ${saleData.totalAmount.toFixed(2)}
            </p>
          </div>
        )}

        {/* Installment Plan Selection */}
        {(saleData.paymentType === 'Down Payment + Installments' || saleData.paymentType === 'Installment Only') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Installment Plan
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {installmentPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    saleData.installmentPlanId === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInstallmentPlanChange(plan.id)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{plan.name}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{plan.description}</p>
                  <div className="text-sm text-gray-600">
                    <p>{plan.num_installments} installments</p>
                    <p>Every {plan.frequency_interval || 1} {plan.frequency_unit || 'month'}(s)</p>
                    <p>{(plan.interest_rate * 100).toFixed(1)}% interest</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Installment Fields */}
        {saleData.paymentType === 'Custom Installment' && (
          <div className="mb-6 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Installment Terms</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={customInterestRate}
                    onChange={(e) => handleCustomValueChange('interestRate', parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                    min="0"
                    step="0.1"
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
                    type="number"
                    value={customNumInstallments}
                    onChange={(e) => handleCustomValueChange('numInstallments', parseInt(e.target.value) || 1)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3"
                    min="1"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                  type="number"
                  value={customFrequencyInterval}
                  onChange={(e) => handleCustomValueChange('frequencyInterval', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => handleCustomValueChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>
                Payment every {customFrequencyInterval} {customFrequencyUnit}
                {customFrequencyInterval > 1 ? 's' : ''} 
                {customStartDate && ` starting from ${new Date(customStartDate).toLocaleDateString()}`}
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
                    ${saleData.totalAmount.toFixed(2)}
                  </p>
                </div>
                {saleData.paymentType === 'Down Payment + Installments' && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Down Payment</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${saleData.downPaymentAmount.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total with Interest</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${getTotalWithInterest().toFixed(2)}
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
                        ${installment.amount.toFixed(2)}
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