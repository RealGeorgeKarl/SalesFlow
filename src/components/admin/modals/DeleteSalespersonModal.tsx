import React, { useState } from 'react';
import { X, User, Loader2, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { RpcResult, Persona } from '../../../types';

interface DeleteSalespersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  salespersons: Persona[];
}

const DeleteSalespersonModal: React.FC<DeleteSalespersonModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  salespersons 
}) => {
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (confirmationText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('delete_salesperson_account', {
        p_name: selectedSalesperson
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      setSuccess('Salesperson account deleted successfully!');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete salesperson account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedSalesperson('');
    setConfirmationText('');
    setError('');
    setSuccess('');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Delete Salesperson</h2>
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
          <p className="text-sm text-red-700 mt-1">
            This action cannot be undone. The salesperson account will be permanently deleted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Salesperson *
            </label>
            <select
              value={selectedSalesperson}
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            >
              <option value="">Choose a salesperson to delete...</option>
              {salespersons.map((salesperson, index) => (
                <option key={`${salesperson.name}-${index}`} value={salesperson.name}>
                  {salesperson.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type "DELETE" to confirm *
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type DELETE to confirm"
              required
              disabled={isLoading}
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
              disabled={isLoading || !selectedSalesperson || confirmationText !== 'DELETE'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Salesperson
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteSalespersonModal;