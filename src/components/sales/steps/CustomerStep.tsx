import React, { useState } from 'react';
import { Search, Plus, User, Mail, Phone, MapPin } from 'lucide-react';
import { Customer } from '../../../types';

interface CustomerStepProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
}

const CustomerStep: React.FC<CustomerStepProps> = ({ selectedCustomer, onCustomerSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Mock customer data
  const customers: Customer[] = [
    {
      id: '1',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 987-6543',
      address: '456 Oak Ave, City, State 12345',
      created_at: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      first_name: 'Mike',
      last_name: 'Wilson',
      email: 'mike.wilson@email.com',
      phone: '+1 (555) 456-7890',
      address: '789 Pine Rd, City, State 12345',
      created_at: '2024-01-03T00:00:00Z',
    },
  ];

  const filteredCustomers = customers.filter(customer =>
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  const handleCreateCustomer = () => {
    if (newCustomer.first_name && newCustomer.last_name) {
      const customer: Customer = {
        id: Date.now().toString(),
        ...newCustomer,
        created_at: new Date().toISOString(),
      };
      onCustomerSelect(customer);
      setShowNewCustomerForm(false);
      setNewCustomer({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Customer</h2>
        
        {/* Search and Add Customer */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowNewCustomerForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </button>
        </div>

        {/* Customer List */}
        {!showNewCustomerForm && (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCustomer?.id === customer.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onCustomerSelect(customer)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {customer.first_name} {customer.last_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      {customer.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                    {customer.address && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{customer.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Customer Form */}
        {showNewCustomerForm && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Customer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={newCustomer.first_name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={newCustomer.last_name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewCustomerForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={!newCustomer.first_name || !newCustomer.last_name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create Customer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerStep;