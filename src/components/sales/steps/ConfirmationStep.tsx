import React from 'react';
import { CheckCircle, User, ShoppingCart, CreditCard, FileText, Printer } from 'lucide-react';
import { NewSaleData } from '../NewSale';

interface ConfirmationStepProps {
  saleData: NewSaleData;
  onComplete: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ saleData, onComplete }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleComplete = () => {
    onComplete();
    // In a real application, this would redirect to the sales list or dashboard
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sale Confirmation</h2>
        <p className="text-gray-600">Review the details below and complete the sale</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
          </div>
          {saleData.customer && (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {saleData.customer.first_name} {saleData.customer.last_name}
              </p>
              {saleData.customer.email && (
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {saleData.customer.email}
                </p>
              )}
              {saleData.customer.phone && (
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {saleData.customer.phone}
                </p>
              )}
              {saleData.customer.address && (
                <p className="text-sm">
                  <span className="font-medium">Address:</span> {saleData.customer.address}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sale Details */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Sale Details</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Payment Type:</span> {saleData.paymentType}
            </p>
            <p className="text-sm">
              <span className="font-medium">Date:</span> {new Date().toLocaleDateString()}
            </p>
            {saleData.notes && (
              <p className="text-sm">
                <span className="font-medium">Notes:</span> {saleData.notes}
              </p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Products</h3>
          </div>
          <div className="space-y-3">
            {saleData.cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-xs text-gray-500">
                    ${item.product.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ${item.total.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Total Amount:</span>
                <span className="text-lg font-bold text-gray-900">
                  ${saleData.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Payment Type:</span> {saleData.paymentType}
            </p>
            {saleData.paymentType === 'Down Payment + Installments' && (
              <p className="text-sm">
                <span className="font-medium">Down Payment:</span> ${saleData.downPaymentAmount.toFixed(2)}
              </p>
            )}
            {saleData.paymentType !== 'Full Payment' && (
              <p className="text-sm">
                <span className="font-medium">Installment Plan:</span> Selected
              </p>
            )}
            <p className="text-sm">
              <span className="font-medium">Status:</span> 
              <span className="text-green-600 ml-1">Ready to Process</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <button
          onClick={handlePrint}
          className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Printer className="h-5 w-5 mr-2" />
          Print Receipt
        </button>
        <button
          onClick={handleComplete}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Complete Sale
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;