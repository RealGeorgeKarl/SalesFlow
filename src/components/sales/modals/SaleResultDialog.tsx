import React, { useRef } from 'react';
import { X, CheckCircle, AlertCircle, Loader2, Printer, Download, User, ShoppingCart, CreditCard, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { NewSaleData } from '../NewSale';
import { useAuth } from '../../../contexts/AuthContext';
import {formatCurrency} from "../../../utils/formatters";


interface SaleResultDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onDone?: () => void;
  message: string;
  type: 'success' | 'error';
  isLoading?: boolean;
  saleData?: NewSaleData;
}

const SaleResultDialog: React.FC<SaleResultDialogProps> = ({ 
  isOpen, 
  onClose, 
  onDone,
  message, 
  type, 
  isLoading = false,
  saleData
}) => {
  const { persona } = useAuth();
  const receiptContentRef = useRef<HTMLDivElement>(null);

  const handlePrintReceipt = () => {
    if (!receiptContentRef.current) {
      alert('Unable to print receipt. Please try again.');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Unable to open print window. Please check your popup blocker.');
      return;
    }

    // Clone the receipt content
    const clonedContent = receiptContentRef.current.cloneNode(true) as HTMLElement;
    
    // Create the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sale Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
            }
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .grid { display: grid; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-6 { gap: 1.5rem; }
            .gap-4 { gap: 1rem; }
            .p-6 { padding: 1.5rem; }
            .p-4 { padding: 1rem; }
            .p-3 { padding: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-lg { font-size: 1.125rem; }
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .border { border: 1px solid #e5e7eb; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .rounded-lg { border-radius: 0.5rem; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-white { background-color: #ffffff; }
            .text-gray-900 { color: #111827; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-500 { color: #6b7280; }
            .text-green-600 { color: #059669; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .space-x-2 > * + * { margin-left: 0.5rem; }
            .space-x-3 > * + * { margin-left: 0.75rem; }
            .pt-3 { padding-top: 0.75rem; }
            .pt-4 { padding-top: 1rem; }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${clonedContent.outerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleGenerateImage = async () => {
    if (!receiptContentRef.current) {
      alert('Unable to generate image. Please try again.');
      return;
    }

    try {
      // Create a temporary container with the receipt content
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '20px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      
      // Clone the receipt content
      const clonedContent = receiptContentRef.current.cloneNode(true) as HTMLElement;
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);

      // Generate the image
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      // Remove the temporary container
      document.body.removeChild(tempContainer);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `receipt-${new Date().toISOString().split('T')[0]}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    }
  };

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
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`h-12 w-12 ${colors.bg} rounded-full flex items-center justify-center ${colors.border} border-2`}>
                {getIcon()}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${colors.text}`}>
                  {isLoading ? 'Processing Sale...' : type === 'success' ? 'Sale Completed!' : 'Sale Failed'}
                </h2>
                <p className="text-gray-600">
                  {type === 'success' ? 'Transaction completed successfully' : 'There was an error processing the sale'}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          <div className={`p-4 ${colors.bg} ${colors.border} border rounded-lg mb-6`}>
            <p className={`text-sm ${colors.text} leading-relaxed`}>
              {message}
            </p>
          </div>

          {/* Receipt Content - Only show for successful sales */}
          {type === 'success' && saleData && !isLoading && (
            <div ref={receiptContentRef} className="space-y-6 bg-white">
              <div className="text-center border-b border-gray-200 pb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sale Receipt</h3>
                <p className="text-gray-600">Transaction Date: {new Date().toLocaleDateString()}</p>
                <p className="text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-medium text-gray-900">Customer Information</h4>
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
                    <h4 className="text-lg font-medium text-gray-900">Sale Details</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Seller:</span> {persona?.name}
                    </p>
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
              </div>

              {/* Products */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  <h4 className="text-lg font-medium text-gray-900">Products</h4>
                </div>
                <div className="space-y-3">
                  {saleData.cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(item.product.price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(saleData.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <h4 className="text-lg font-medium text-gray-900">Payment Information</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Payment Method Type:</span> {saleData.paymentMethodType}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Payment Method:</span> {saleData.paymentMethod}
                  </p>
                  {saleData.referenceCode && (
                    <p className="text-sm">
                      <span className="font-medium">Reference Code:</span> {saleData.referenceCode}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Payment Type:</span> {saleData.paymentType}
                  </p>
                  {saleData.paymentType === 'Custom Installment' && saleData.customDownPaymentAmount && saleData.customDownPaymentAmount > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Down Payment:</span> {formatCurrency(saleData.customDownPaymentAmount)}
                    </p>
                  )}
                  {saleData.paymentType === 'Custom Installment' && (
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Installment Plan:</span> {saleData.customNumInstallments} installments
                      </p>
                      <p>
                        <span className="font-medium">Interest Rate:</span> {saleData.customInterestRate}%
                      </p>
                      <p>
                        <span className="font-medium">Frequency:</span> Every {saleData.customFrequencyInterval} {saleData.customFrequencyUnit}(s)
                      </p>
                      {saleData.customStartDate && (
                        <p>
                          <span className="font-medium">Start Date:</span> {new Date(saleData.customStartDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> 
                    <span className="text-green-600 ml-1">Completed</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isLoading && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
            {type === 'success' ? (
              <div className="flex flex-col space-y-3">
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handlePrintReceipt}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center font-medium"
                  >
                    <Printer className="h-5 w-5 mr-2" />
                    Print Receipt
                  </button>
                  <button
                    onClick={handleGenerateImage}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center font-medium"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Generate Image
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={onDone}
                    className={`px-8 py-3 ${colors.button} text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center`}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={onClose}
                  className={`px-8 py-3 ${colors.button} text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center`}
                >
                  <X className="h-5 w-5 mr-2" />
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleResultDialog;