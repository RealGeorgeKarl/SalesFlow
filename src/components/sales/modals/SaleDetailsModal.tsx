import React from 'react';
import { X, User, ShoppingCart, CreditCard, Calendar, DollarSign, Package, Clock, Receipt, CheckCircle, AlertCircle, Printer, Download, XCircle, Ban } from 'lucide-react';
import { Sale } from '../../../types';
import { printElement, generateImageFromElement } from '../../../utils/receiptUtils';
import RecordPaymentModal from './RecordPaymentModal';
import ConfirmationModal from './ConfirmationModal';
import { supabase } from '../../../lib/supabase';
import { RpcResult } from '../../../types';
import { useRef, useState } from 'react';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  onRefresh: () => void;
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ isOpen, onClose, sale, onRefresh }) => {
  const receiptContentRef = useRef<HTMLDivElement>(null);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen || !sale) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Terminated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScheduleStatusColor = (status: string) => {
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateOnly = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleRecordPayment = () => {
    setShowRecordPayment(true);
  };

  const handleTerminateSale = async (notes?: string) => {
    if (!sale) return false;

    try {
      const { data, error } = await supabase.rpc('terminate_sale', {
        p_sale_id: sale.id,
        p_termination_notes: notes || null,
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      onRefresh();
      return true;
    } catch (err) {
      console.error('Failed to terminate sale:', err);
      return false;
    }
  };

  const handleCancelSale = async (notes?: string) => {
    if (!sale) return false;

    try {
      const { data, error } = await supabase.rpc('cancel_sale', {
        p_sale_id: sale.id,
        p_cancellation_notes: notes || null,
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      onRefresh();
      return true;
    } catch (err) {
      console.error('Failed to cancel sale:', err);
      return false;
    }
  };

  const handlePrintReceipt = () => {
    if (receiptContentRef.current) {
      printElement(receiptContentRef.current, `Sale Receipt #${sale.id}`);
    }
  };

  const handleGenerateImage = () => {
    if (receiptContentRef.current) {
      generateImageFromElement(receiptContentRef.current, `sale-receipt-${sale.id}`);
    }
  };

  const handlePaymentSuccess = () => {
    setShowRecordPayment(false);
    onRefresh();
  };

  const canRecordPayment = sale.status === 'In Progress' && sale.remaining_balance > 0;
  const canTerminate = sale.status === 'In Progress';
  const canCancel = sale.status === 'In Progress' && (!sale.payment_history || sale.payment_history.length === 0);
  const isCompleted = sale.status === 'Completed';

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Receipt className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sale Details</h2>
                <p className="text-gray-600">Sale ID: #{sale.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={receiptContentRef} className="p-6 space-y-6">
          {/* Sale Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center space-x-3 mb-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Total Amount</h3>
              </div>
              <p className="text-3xl font-bold text-blue-900">${sale.total_amount.toFixed(2)}</p>
              <p className="text-sm text-blue-700 mt-1">{sale.payment_type}</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Amount Paid</h3>
              </div>
              <p className="text-3xl font-bold text-green-900">${sale.amount_paid.toFixed(2)}</p>
              <p className="text-sm text-green-700 mt-1">
                {((sale.amount_paid / sale.total_amount) * 100).toFixed(1)}% completed
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
              <div className="flex items-center space-x-3 mb-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-900">Remaining Balance</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-900">${sale.remaining_balance.toFixed(2)}</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sale.status)} mt-2`}>
                {sale.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Customer Information</h3>
              </div>
              {sale.customer ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-lg text-gray-900">
                      {sale.customer.first_name} {sale.customer.last_name}
                    </p>
                  </div>
                  {sale.customer.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{sale.customer.email}</p>
                    </div>
                  )}
                  {sale.customer.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">{sale.customer.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer Since</p>
                    <p className="text-gray-900">{formatDateOnly(sale.customer.created_at)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No customer information available</p>
              )}
            </div>

            {/* Sale Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Sale Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Seller</p>
                  <p className="text-lg text-gray-900">{sale.seller_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sale Date</p>
                  <p className="text-gray-900">{formatDate(sale.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Type</p>
                  <p className="text-gray-900">{sale.payment_type}</p>
                </div>
                {sale.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-gray-900">{sale.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products */}
          {sale.items && sale.items.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Products</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <ShoppingCart className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-900">{item.product_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900">
                          ${item.unit_price.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900">
                          ${item.total_price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment History */}
          {sale.payment_history && sale.payment_history.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Payment History</h3>
              </div>
              <div className="space-y-4">
                {sale.payment_history.map((payment) => (
                  <div key={payment.payment_id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Payment #{payment.payment_id}</p>
                        <p className="text-sm text-gray-600">
                          {payment.payment_method}
                          {payment.reference_code && ` • Ref: ${payment.reference_code}`}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(payment.payment_datetime)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
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
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Payment Schedule</h3>
              </div>
              <div className="space-y-4">
                {sale.schedule.map((schedule) => (
                  <div key={schedule.schedule_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Clock className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Installment #{schedule.schedule_id}</p>
                        <p className="text-sm text-gray-600">Due: {formatDate(schedule.due_date_time)}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScheduleStatusColor(schedule.status)}`}>
                        {schedule.status}
                      </span>
                      <p className="text-lg font-bold text-gray-900">
                        ${schedule.amount_due.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-2xl">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {canRecordPayment && (
                <button
                  onClick={handleRecordPayment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </button>
              )}
              
              {canTerminate && (
                <button
                  onClick={() => setShowTerminateConfirm(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center text-sm font-medium"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Terminate Sale
                </button>
              )}
              
              {canCancel && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm font-medium"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel Sale
                </button>
              )}
              
              {isCompleted && (
                <>
                  <button
                    onClick={handlePrintReceipt}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center text-sm font-medium"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </button>
                  <button
                    onClick={handleGenerateImage}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center text-sm font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Image
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={showRecordPayment}
        onClose={() => setShowRecordPayment(false)}
        onSuccess={handlePaymentSuccess}
        sale={sale}
      />

      {/* Terminate Sale Confirmation */}
      <ConfirmationModal
        isOpen={showTerminateConfirm}
        onClose={() => setShowTerminateConfirm(false)}
        onConfirm={handleTerminateSale}
        title="Terminate Sale"
        message="This action will terminate the sale and stop all future payments. This action cannot be undone."
        confirmationText="TERMINATE"
        confirmButtonText="Terminate Sale"
        confirmButtonColor="yellow"
        requireNotes={true}
        notesLabel="Termination Notes"
        notesPlaceholder="Please provide a reason for terminating this sale..."
      />

      {/* Cancel Sale Confirmation */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelSale}
        title="Cancel Sale"
        message="This action will cancel the sale completely. This action cannot be undone."
        confirmationText="CANCEL"
        confirmButtonText="Cancel Sale"
        confirmButtonColor="red"
        requireNotes={true}
        notesLabel="Cancellation Notes"
        notesPlaceholder="Please provide a reason for canceling this sale..."
      />
    </>
  );
};

export default SaleDetailsModal;