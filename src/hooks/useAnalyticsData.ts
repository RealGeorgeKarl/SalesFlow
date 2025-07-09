import { useState, useEffect, useCallback } from 'react';
import { useSales } from './useSales';
import { useCustomers } from './useCustomers';
import { useProducts } from './useProducts';
import { Sale, Customer, Product } from '../types';

interface SalesTrend {
  period: string;
  total_sales: number;
  sales_count: number;
  average_sale_value: number;
}

interface CustomerGrowth {
  period: string;
  new_customers: number;
  total_customers: number;
}

interface ProductPerformance {
  product_id: number;
  product_name: string;
  total_sold: number;
  revenue: number;
  stock_remaining: number;
}

interface TopCustomer {
  customer_id: number;
  customer_name: string;
  total_spent: number;
  total_orders: number;
}

interface PaymentStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

interface AnalyticsData {
  // Overview metrics
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  
  // Trends
  salesTrends: SalesTrend[];
  customerGrowth: CustomerGrowth[];
  
  // Performance
  productPerformance: ProductPerformance[];
  topCustomers: TopCustomer[];
  
  // Status breakdowns
  paymentStatusBreakdown: PaymentStatusBreakdown[];
  
  // Time-based metrics
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
}

interface UseAnalyticsDataReturn {
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

export const useAnalyticsData = (): UseAnalyticsDataReturn => {
  const { sales, isLoading: salesLoading, error: salesError, fetchSales } = useSales();
  const { customers, isLoading: customersLoading, error: customersError, fetchCustomers } = useCustomers();
  const { products, isLoading: productsLoading, error: productsError, fetchProductsAndCategories } = useProducts();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateAnalytics = useCallback(() => {
    if (!sales.length && !customers.length && !products.length) {
      return null;
    }

    try {
      // Overview metrics
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
      const totalSales = sales.length;
      const totalCustomers = customers.length;
      const totalProducts = products.length;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Sales trends (last 12 months)
      const salesTrends: SalesTrend[] = [];
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthSales = sales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= monthStart && saleDate <= monthEnd;
        });
        
        const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.total_amount, 0);
        
        salesTrends.push({
          period: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          total_sales: monthRevenue,
          sales_count: monthSales.length,
          average_sale_value: monthSales.length > 0 ? monthRevenue / monthSales.length : 0
        });
      }

      // Customer growth (last 12 months)
      const customerGrowth: CustomerGrowth[] = [];
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const newCustomersThisMonth = customers.filter(customer => {
          const customerDate = new Date(customer.created_at);
          return customerDate >= monthStart && customerDate <= monthEnd;
        }).length;
        
        const totalCustomersUpToMonth = customers.filter(customer => {
          const customerDate = new Date(customer.created_at);
          return customerDate <= monthEnd;
        }).length;
        
        customerGrowth.push({
          period: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          new_customers: newCustomersThisMonth,
          total_customers: totalCustomersUpToMonth
        });
      }

      // Product performance
      const productPerformance: ProductPerformance[] = products.map(product => {
        const productSales = sales.flatMap(sale => 
          (sale.items || []).filter(item => item.product_id === product.id)
        );
        
        const totalSold = productSales.reduce((sum, item) => sum + item.quantity, 0);
        const revenue = productSales.reduce((sum, item) => sum + item.total_price, 0);
        
        return {
          product_id: product.id,
          product_name: product.name,
          total_sold: totalSold,
          revenue: revenue,
          stock_remaining: product.quantity
        };
      }).sort((a, b) => b.revenue - a.revenue);

      // Top customers
      const topCustomers: TopCustomer[] = customers
        .map(customer => {
          const customerSales = sales.filter(sale => sale.customer_id === customer.id);
          const totalSpent = customerSales.reduce((sum, sale) => sum + sale.total_amount, 0);
          
          return {
            customer_id: customer.id,
            customer_name: `${customer.first_name} ${customer.last_name}`,
            total_spent: totalSpent,
            total_orders: customerSales.length
          };
        })
        .filter(customer => customer.total_spent > 0)
        .sort((a, b) => b.total_spent - a.total_spent)
        .slice(0, 10);

      // Payment status breakdown
      const statusCounts = sales.reduce((acc, sale) => {
        acc[sale.status] = (acc[sale.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const paymentStatusBreakdown: PaymentStatusBreakdown[] = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: (count / totalSales) * 100
      }));

      // Time-based metrics
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

      const dailyRevenue = sales
        .filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate.toDateString() === today.toDateString();
        })
        .reduce((sum, sale) => sum + sale.total_amount, 0);

      const weeklyRevenue = sales
        .filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= weekAgo;
        })
        .reduce((sum, sale) => sum + sale.total_amount, 0);

      const monthlyRevenue = sales
        .filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= monthAgo;
        })
        .reduce((sum, sale) => sum + sale.total_amount, 0);

      return {
        totalRevenue,
        totalSales,
        totalCustomers,
        totalProducts,
        averageOrderValue,
        salesTrends,
        customerGrowth,
        productPerformance,
        topCustomers,
        paymentStatusBreakdown,
        monthlyRevenue,
        weeklyRevenue,
        dailyRevenue
      };
    } catch (err) {
      console.error('Error calculating analytics:', err);
      return null;
    }
  }, [sales, customers, products]);

  const refreshAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchSales(),
        fetchCustomers(),
        fetchProductsAndCategories()
      ]);
    } catch (err) {
      setError('Failed to refresh analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchSales, fetchCustomers, fetchProductsAndCategories]);

  useEffect(() => {
    const analytics = calculateAnalytics();
    setAnalyticsData(analytics);
  }, [calculateAnalytics]);

  useEffect(() => {
    const combinedError = salesError || customersError || productsError;
    setError(combinedError);
  }, [salesError, customersError, productsError]);

  useEffect(() => {
    const combinedLoading = salesLoading || customersLoading || productsLoading;
    setIsLoading(combinedLoading);
  }, [salesLoading, customersLoading, productsLoading]);

  return {
    analyticsData,
    isLoading,
    error,
    refreshAnalytics
  };
};