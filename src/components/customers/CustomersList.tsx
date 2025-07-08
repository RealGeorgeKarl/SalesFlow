import React, { useState } from 'react';
import { Search, Plus, User, Mail, Phone, Edit, Trash2, MapPin, Calendar, DollarSign, ShoppingCart, Loader2, AlertCircle, X } from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import { Customer, SocialMedia } from '../../types';

const CustomersList: React.FC = () => {
  const { customers, isLoading, error, addCustomer, editCustomer, deleteCustomer } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    birth: '',
    other_info: '',
    social_media: [] as SocialMedia[],
  });

  const filteredCustomers = customers.filter(customer =>
    `${customer.first_name} ${customer.middle_name || ''} ${customer.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      first_name: customer.first_name,
      middle_name: customer.middle_name || '',
      last_name: customer.last_name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      birth: customer.birth || '',
      other_info: customer.other_info || '',
      social_media: customer.social_media || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (customerId: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const success = await deleteCustomer(customerId);
      if (!success) {
        alert('Failed to delete customer. Please try again.');
      }
    }
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      birth: '',
      other_info: '',
      social_media: [],
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormError('');
    setFormLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      let success = false;
      if (editingCustomer) {
        success = await editCustomer(editingCustomer.id, formData);
      } else {
        success = await addCustomer(formData);
      }

      if (success) {
        handleCloseForm();
      } else {
        setFormError('Operation failed. Please try again.');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const addSocialMedia = () => {
    setFormData(prev => ({
      ...prev,
      social_media: [...prev.social_media, { platform: '', account: '' }],
    }));
  };

  const updateSocialMedia = (index: number, field: keyof SocialMedia, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media: prev.social_media.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeSocialMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      social_media: prev.social_media.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage customer information and contact details</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {customer.first_name} {customer.middle_name && `${customer.middle_name} `}{customer.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Customer since {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(customer)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {customer.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">{customer.address}</span>
                </div>
              )}
              {customer.birth && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Born: {new Date(customer.birth).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Total Sales</span>
                </div>
                <span className="font-medium text-gray-900">
                  ${customer.total_sales?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <div className="flex items-center space-x-1">
                  <ShoppingCart className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Active Sales</span>
                </div>
                <span className="font-medium text-gray-900">{customer.active_sales || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middle_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, middle_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formData.birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Info
                  </label>
                  <input
                    type="text"
                    value={formData.other_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, other_info: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={formLoading}
                  />
                </div>
              </div>

              {/* Social Media Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Social Media
                  </label>
                  <button
                    type="button"
                    onClick={addSocialMedia}
                    className="text-sm text-blue-600 hover:text-blue-700"
                    disabled={formLoading}
                  >
                    + Add Social Media
                  </button>
                </div>
                {formData.social_media.map((social, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Platform (e.g., facebook)"
                      value={social.platform}
                      onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={formLoading}
                    />
                    <input
                      type="text"
                      placeholder="Account URL"
                      value={social.account}
                      onChange={(e) => updateSocialMedia(index, 'account', e.target.value)}
                      className="flex-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={formLoading}
                    />
                    <button
                      type="button"
                      onClick={() => removeSocialMedia(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      disabled={formLoading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {formError && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-700">{formError}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={formLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !formData.first_name || !formData.last_name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingCustomer ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingCustomer ? 'Update Customer' : 'Create Customer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;