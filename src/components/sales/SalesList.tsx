import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Plus, Calendar, DollarSign } from 'lucide-react';
import { Sale } from '../../types';

const SalesList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock sales data
  const sales: Sale[] = [
    {
      id: '1',
      customer_id: '1',
      customer: {
        id: '1',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        created_at: '2024-01-01T00:00:00Z',
      },
      seller_name: 'Jane Doe',
      total_amount: 1200.00,
      amount_paid: 400.00,
      remaining_balance: 800.00,
      payment_type: 'Down Payment + Installments',
      down_payment_amount: 400.00,
      installment_plan_id: '1',
      status: 'Active',
      notes: 'Customer preferred monthly payments',
      created_at: '2024-01-10T10:00:00Z',
      created_by: 'user-123',
    },
    {
      id: '2',
      customer_id: '2',
      customer: {
        id: '2',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 987-6543',
        created_at: '2024-01-02T00:00:00Z',
      },
      seller_name: 'Bob Wilson',
      total_amount: 850.00,
      amount_paid: 850.00,
      remaining_balance: 0.00,
      payment_type: 'Full Payment',
      status: 'Completed',
      created_at: '2024-01-12T14:30:00Z',
      created_by: 'user-123',
    },
    {
      id: '3',
      customer_id: '3',
      customer: {
        id: '3',
        first_name: 'Mike',
        last_name: 'Wilson',
        email: 'mike.wilson@email.com',
        phone: '+1 (555) 456-7890',
        created_at: '2024-01-03T00:00:00Z',
      },
      seller_name: 'Alice Brown',
      total_amount: 2100.00,
      amount_paid: 350.00,
      remaining_balance: 1750.00,
      payment_type: 'Installment Only',
      installment_plan_id: '2',
      status: 'Active',
      created_at: '2024-01-08T09:15:00Z',
      created_by: 'user-123',
    },
  ];

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customer && (
      `${sale.customer.first_name} ${sale.customer.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.seller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || sale.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600 mt-1">Manage all sales and payment tracking</p>
        </div>
        <Link
          to="/new-sale"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Sale
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start date"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{sale.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {sale.customer && `${sale.customer.first_name} ${sale.customer.last_name}`}
                    </div>
                    <div className="text-sm text-gray-500">{sale.customer?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.seller_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${sale.total_amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">{sale.payment_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${sale.amount_paid.toFixed(2)} paid
                    </div>
                    <div className="text-sm text-gray-500">
                      ${sale.remaining_balance.toFixed(2)} remaining
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/sales/${sale.id}`}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${sales.reduce((sum, sale) => sum + sale.total_amount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Sales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sales.filter(sale => sale.status === 'Active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Filter className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Balance</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${sales.reduce((sum, sale) => sum + sale.remaining_balance, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesList;