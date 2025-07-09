import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import KPICard from './KPICard';
import { useDashboardData } from '../../hooks/useDashboardData';
import { formatCurrency } from '../../utils/formatters';
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  Plus,
  Calendar,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { persona } = useAuth();
  const { data, isLoading, error, fetchDashboardData } = useDashboardData();

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading dashboard data...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your latest information</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-gray-600">No dashboard data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Create KPI data from fetched data
  const kpiData = [
    {
      title: "Today's Sales",
      value: formatCurrency(data.kpis.today_sales),
      icon: DollarSign,
      color: 'green' as const,
    },
    {
      title: 'Active Sales',
      value: data.kpis.active_sales_count.toString(),
      icon: ShoppingCart,
      color: 'blue' as const,
    },
    {
      title: 'Total Customers',
      value: data.kpis.total_customers_count.toString(),
      icon: Users,
      color: 'blue' as const,
    },
    {
      title: 'Overdue Payments',
      value: data.kpis.overdue_payments_count.toString(),
      icon: AlertTriangle,
      color: 'red' as const,
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
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(data.performance.monthly_revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Sales This Month</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {data.performance.sales_this_month_count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-gray-600">Avg. Sale Time</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {data.performance.average_sale_time_days} day{data.performance.average_sale_time_days !== 1 ? 's' : ''}
              </span>
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
            {data.lists.upcoming_payments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming payments</p>
              </div>
            ) : (
              data.lists.upcoming_payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.customer_name}</p>
                    <p className="text-xs text-gray-500">
                      Due {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount_due)}
                    </p>
                  </div>
                </div>
              ))
            )}
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
            {data.lists.recent_sales.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent sales</p>
              </div>
            ) : (
              data.lists.recent_sales.map((sale) => (
                <div key={sale.sale_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sale.customer_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(sale.total_amount)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      sale.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : sale.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : sale.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;