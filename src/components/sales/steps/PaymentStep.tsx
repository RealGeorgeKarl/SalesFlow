import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, DollarSign, Calculator } from 'lucide-react';
import { NewSaleData, PaymentSchedule } from '../NewSale';
import { InstallmentPlan } from '../../../types';

interface PaymentStepProps {
  saleData: NewSaleData;
  onUpdate: (updates: Partial<NewSaleData>) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ saleData, onUpdate }) => {
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule[]>([]);

  // Mock installment plans
  const installmentPlans: InstallmentPlan[] = [
    {
      id: '1',
      name: '3 Months Plan',
      description: 'Pay over 3 months with 5% interest',
      num_installments: 3,
      interval_days: 30,
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
      interest_rate: 0.12,
      is_active: true,
      created_at: '2024-01-03T00:00:00Z',
    },
  ];

  useEffect(() => {
    if (saleData.paymentType !== 'Full Payment' && saleData.installmentPlanId) {
      calculatePaymentSchedule();
    }
  }, [saleData.paymentType, saleData.installmentPlanId, saleData.downPaymentAmount, saleData.totalAmount]);

  const calculatePaymentSchedule = () => {
    const plan = installmentPlans.find(p => p.id === saleData.installmentPlanId);
    if (!plan) return;

    const totalAmount = saleData.totalAmount;
    const downPayment = saleData.paymentType === 'Down Payment + Installments' ? saleData.downPaymentAmount : 0;
    const principalAmount = totalAmount - downPayment;
    const interestAmount = principalAmount * plan.interest_rate;
    const totalWithInterest = principalAmount + interestAmount;
    const installmentAmount = totalWithInterest / plan.num_installments;

    const schedule: PaymentSchedule[] = [];
    for (let i = 0; i < plan.num_installments; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i + 1) * plan.interval_days);
      
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
    });
    setPaymentSchedule([]);
  };

  const handleDownPaymentChange = (amount: number) => {
    onUpdate({ downPaymentAmount: amount });
  };

  const handleInstallmentPlanChange = (planId: string) => {
    onUpdate({ installmentPlanId: planId });
  };

  const getTotalWithInterest = () => {
    const plan = installmentPlans.find(p => p.id === saleData.installmentPlanId);
    if (!plan) return saleData.totalAmount;

    const principalAmount = saleData.totalAmount - (saleData.paymentType === 'Down Payment + Installments' ? saleData.downPaymentAmount : 0);
    const interestAmount = principalAmount * plan.interest_rate;
    return principalAmount + interestAmount + (saleData.paymentType === 'Down Payment + Installments' ? saleData.downPaymentAmount : 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
        
        {/* Seller Name and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seller Name (Optional)
            </label>
            <input
              type="text"
              value={saleData.sellerName}
              onChange={(e) => onUpdate({ sellerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter seller name"
            />
          </div>
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
            {(['Full Payment', 'Down Payment + Installments', 'Installment Only'] as const).map((type) => (
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
        {saleData.paymentType !== 'Full Payment' && (
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
                    <p>Every {plan.interval_days} days</p>
                    <p>{(plan.interest_rate * 100).toFixed(1)}% interest</p>
                  </div>
                </div>
              ))}
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