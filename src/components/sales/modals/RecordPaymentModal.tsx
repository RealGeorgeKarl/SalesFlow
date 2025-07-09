import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, Receipt, Loader2, AlertCircle, CheckCircle, Calendar, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Sale, PaymentMethodType, PaymentMethod, RpcResult } from '../../../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sale: Sale | null;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, onSuccess, sale }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethodType, setPaymentMethodType] = useState<PaymentMethodType>('Cash');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Exact Cash');
  const [referenceCode, setReferenceCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Payment method constants
  const PAYMENT_METHOD_TYPES: PaymentMethodType[] = ['Cash', 'Card', 'Online Payment', 'Other'];
  
  const PAYMENT_METHODS_MAP: Record<PaymentMethodType, PaymentMethod[]> = {
    'Cash': ['Exact Cash', 'Cash (Needs Change)'],
    'Card': ['Visa', 'Mastercard', 'Debit Card', 'Credit Card'],
    'Online Payment': ['PayPal', 'Bank Transfer', 'Digital Wallet'],
    'Other': ['Check', 'Money Order', 'Store Credit'],
  };

  useEffect(() => {
    if (isOpen && sale) {
      // Reset form when modal opens
      setAmount('');
      setPaymentMethodType('Cash');
      setPaymentMethod('Exact Cash');
      setReferenceCode('');
      setError('');
      setSuccess('');
      setIsLoading(false);
    }
  }, [isOpen, sale]);

  const handlePaymentMethodTypeChange = (newType: PaymentMethodType) => {
    setPaymentMethodType(newType);
    setPaymentMethod(PAYMENT_METHODS_MAP[newType][0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (paymentAmount > sale.remaining_balance) {
      setError(`Payment amount cannot exceed remaining balance of $${sale.remaining_balance.toFixed(2)}`);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.rpc('record_installment_payment', {
        p_sale_id: sale.id,
        p_amount_paid: paymentAmount,
        p_payment_method_type: paymentMethodType,
        p_payment_method: paymentMethod,
        p_reference_code: referenceCode.trim() || null,
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      setSuccess('Payment recorded successfully!');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setPaymentMethodType('Cash');
    setPaymentMethod('Exact Cash');
    setReferenceCode('');
    setError('');
    setSuccess('');
    setIsLoading(false);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
                <p className="text-gray-600">Sale ID: #{sale.id}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sale Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Total Amount</h3>
              </div>
              <p className="text-2xl font-bold text-blue-900">${sale.total_amount.toFixed(2)}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Amount Paid</h3>
              </div>
              <p className="text-2xl font-bold text-green-900">${sale.amount_paid.toFixed(2)}</p>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900">Remaining Balance</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-900">${sale.remaining_balance.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Form */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Record New Payment</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0.01"
                      max={sale.remaining_balance}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum: ${sale.remaining_balance.toFixed(2)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method Type *
                    </label>
                    <select
                      value={paymentMethodType}
                      onChange={(e) => handlePaymentMethodTypeChange(e.target.value as PaymentMethodType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isLoading}
                    >
                      {PAYMENT_METHOD_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isLoading}
                    >
                      {PAYMENT_METHODS_MAP[paymentMethodType].map((method) => (
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
                      value={referenceCode}
                      onChange={(e) => setReferenceCode(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Transaction ID, Check number, etc."
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700">{success}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !amount || parseFloat(amount) <= 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Record Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Payment Schedule & History */}
            <div className="space-y-6">
              {/* Payment History */}
              {sale.payment_history && sale.payment_history.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-gray-900">Payment History</h4>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {sale.payment_history.map((payment) => (
                      <div key={payment.payment_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">#{payment.payment_id}</p>
                          <p className="text-xs text-gray-600">
                            {payment.payment_method}
                            {payment.reference_code && ` • ${payment.reference_code}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.payment_datetime).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">
                            ${payment.amount_paid.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Schedule */}
              {sale.schedule && sale.schedule.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-gray-900">Payment Schedule</h4>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {sale.schedule.map((schedule) => (
                      <div key={schedule.schedule_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-1 bg-gray-100 rounded">
                            <Clock className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Installment #{schedule.schedule_id}
                            </p>
                            <p className="text-xs text-gray-600">
                              Due: {new Date(schedule.due_date_time).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                            {schedule.status}
                          </span>
                          <p className="text-sm font-bold text-gray-900">
                            ${schedule.amount_due.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPaymentModal;