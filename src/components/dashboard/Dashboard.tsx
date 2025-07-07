import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import KPICard from './KPICard';
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  Plus,
  Calendar,
  TrendingUp,
  Clock,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { persona } = useAuth();

  // Mock data - replace with actual API calls
  const kpiData = [
    {
      title: "Today's Sales",
      value: '$12,450',
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true },
      color: 'green' as const,
    },
    {
      title: 'Active Sales',
      value: '47',
      icon: ShoppingCart,
      trend: { value: 8.2, isPositive: true },
      color: 'blue' as const,
    },
    {
      title: 'Total Customers',
      value: '1,234',
      icon: Users,
      trend: { value: 3.1, isPositive: true },
      color: 'blue' as const,
    },
    {
      title: 'Overdue Payments',
      value: '8',
      icon: AlertTriangle,
      trend: { value: 15.3, isPositive: false },
      color: 'red' as const,
    },
  ];

  const upcomingPayments = [
    {
      id: '1',
      customer: 'John Smith',
      amount: '$450',
      dueDate: '2024-01-15',
      status: 'Due Today',
    },
    {
      id: '2',
      customer: 'Sarah Johnson',
      amount: '$750',
      dueDate: '2024-01-16',
      status: 'Due Tomorrow',
    },
    {
      id: '3',
      customer: 'Mike Wilson',
      amount: '$320',
      dueDate: '2024-01-17',
      status: 'Due in 2 days',
    },
  ];

  const recentSales = [
    {
      id: '1',
      customer: 'Alice Brown',
      amount: '$1,200',
      status: 'Completed',
      date: '2024-01-14',
    },
    {
      id: '2',
      customer: 'Bob Davis',
      amount: '$850',
      status: 'Active',
      date: '2024-01-14',
    },
    {
      id: '3',
      customer: 'Carol Miller',
      amount: '$2,100',
      status: 'Active',
      date: '2024-01-13',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {persona?.name}
        </h1>
        <p className="text-gray-600">Here's what's happening with your sales today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
            color={kpi.color}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/new-sale"
              className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-900 font-medium">New Sale</span>
            </Link>
            <Link
              to="/customers"
              className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-900 font-medium">Add Customer</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Monthly Revenue</span>
              </div>
              <span className="text-sm font-medium text-gray-900">$45,678</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Sales This Month</span>
              </div>
              <span className="text-sm font-medium text-gray-900">89</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-gray-600">Avg. Sale Time</span>
              </div>
              <span className="text-sm font-medium text-gray-900">2.5 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Payments</h3>
            <Link
              to="/sales"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{payment.customer}</p>
                  <p className="text-xs text-gray-500">{payment.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{payment.amount}</p>
                  <p className="text-xs text-gray-500">{payment.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            <Link
              to="/sales"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{sale.customer}</p>
                  <p className="text-xs text-gray-500">{sale.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{sale.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    sale.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;