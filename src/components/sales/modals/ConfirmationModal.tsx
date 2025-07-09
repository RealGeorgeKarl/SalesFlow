import React, { useState } from 'react';
import { X, AlertTriangle, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => Promise<boolean>;
  title: string;
  message: string;
  confirmationText: string;
  confirmButtonText: string;
  confirmButtonColor?: 'red' | 'yellow' | 'blue';
  requireNotes?: boolean;
  notesLabel?: string;
  notesPlaceholder?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmationText,
  confirmButtonText,
  confirmButtonColor = 'red',
  requireNotes = false,
  notesLabel = 'Notes',
  notesPlaceholder = 'Enter notes...'
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmText !== confirmationText) {
      setError(`Please type "${confirmationText}" to confirm`);
      return;
    }

    if (requireNotes && !notes.trim()) {
      setError(`${notesLabel} are required`);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await onConfirm(notes.trim() || undefined);
      if (result) {
        setSuccess('Action completed successfully!');
        handleClose();
      } else {
        setError('Action failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setNotes('');
    setError('');
    setSuccess('');
    setIsLoading(false);
    onClose();
  };

  const getButtonColors = () => {
    switch (confirmButtonColor) {
      case 'yellow':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-red-600 hover:bg-red-700';
    }
  };

  const getIconColors = () => {
    switch (confirmButtonColor) {
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600';
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-red-100 text-red-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getIconColors()}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Warning</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{message}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {requireNotes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {notesLabel} *
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={notesPlaceholder}
                required={requireNotes}
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type "{confirmationText}" to confirm *
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Type ${confirmationText} to confirm`}
              required
              disabled={isLoading}
              autoFocus
            />
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
              disabled={isLoading || confirmText !== confirmationText || (requireNotes && !notes.trim())}
              className={`px-4 py-2 ${getButtonColors()} text-white rounded-lg disabled:opacity-50 flex items-center`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmButtonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmationModal;