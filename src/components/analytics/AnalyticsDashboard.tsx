import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Package, DollarSign, Download, RefreshCw, Calendar, PieChart, Target, Award } from 'lucide-react';
import LoadingOverlay from '../common/LoadingOverlay';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { exportAnalyticsToCSV } from '../../utils/csvExport';
import { formatCurrency } from '../../utils/formatters';

const AnalyticsDashboard: React.FC = () => {
  const { analyticsData, isLoading, error, refreshAnalytics } = useAnalyticsData();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const handleExportCSV = (type: 'sales' | 'customers' | 'products') => {
    if (!analyticsData) return;
    exportAnalyticsToCSV(analyticsData, type);
  };

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refreshAnalytics}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoadingOverlay isLoading={isLoading} message="Loading analytics data...">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refreshAnalytics}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {analyticsData && (
          <>
            {/* Overview KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totalSales}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totalCustomers}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totalProducts}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.averageOrderValue)}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Time-based Revenue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Today's Revenue</h3>
                </div>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(analyticsData.dailyRevenue)}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">This Week</h3>
                </div>
                <p className="text-3xl font-bold text-blue-900">{formatCurrency(analyticsData.weeklyRevenue)}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900">This Month</h3>
                </div>
                <p className="text-3xl font-bold text-purple-900">{formatCurrency(analyticsData.monthlyRevenue)}</p>
              </div>
            </div>

            {/* Charts and Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sales Trends */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Sales Trends (Last 12 Months)</h3>
                  </div>
                  <button
                    onClick={() => handleExportCSV('sales')}
                    className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analyticsData.salesTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{trend.period}</p>
                        <p className="text-sm text-gray-600">{trend.sales_count} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(trend.total_sales)}</p>
                        <p className="text-sm text-gray-600">Avg: {formatCurrency(trend.average_sale_value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Growth */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-purple-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Customer Growth</h3>
                  </div>
                  <button
                    onClick={() => handleExportCSV('customers')}
                    className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analyticsData.customerGrowth.map((growth, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{growth.period}</p>
                        <p className="text-sm text-gray-600">+{growth.new_customers} new</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{growth.total_customers}</p>
                        <p className="text-sm text-gray-600">Total customers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Performance and Top Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Products */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Award className="h-6 w-6 text-orange-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Top Products</h3>
                  </div>
                  <button
                    onClick={() => handleExportCSV('products')}
                    className="flex items-center px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analyticsData.productPerformance.slice(0, 10).map((product, index) => (
                    <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.product_name}</p>
                          <p className="text-sm text-gray-600">{product.total_sold} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                        <p className="text-sm text-gray-600">Stock: {product.stock_remaining}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Customers */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <Award className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Top Customers</h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analyticsData.topCustomers.map((customer, index) => (
                    <div key={customer.customer_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.customer_name}</p>
                          <p className="text-sm text-gray-600">{customer.total_orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(customer.total_spent)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <PieChart className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-semibold text-gray-900">Sales Status Breakdown</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analyticsData.paymentStatusBreakdown.map((status, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">{status.status}</span>
                      <span className="text-sm text-gray-500">{status.percentage.toFixed(1)}%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${status.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </LoadingOverlay>
  );
};

export default AnalyticsDashboard;