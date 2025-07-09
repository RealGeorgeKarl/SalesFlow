import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardData, GetUserDashboardDataRpcResponse } from '../types';

interface UseDashboardDataReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_dashboard_data');

      console.log(rpcData);
      if (rpcError) throw rpcError;

      // Handle the nested response structure
      if (rpcData) {
        
        const responseItem = rpcData as GetUserDashboardDataRpcResponse;
        console.log('respone item:', responseItem);
        console.log('get',responseItem.kpis);
        const dashboardData = responseItem.get_user_dashboard_data;
        console.log('dashboard: ',dashboardData);
        if (dashboardData) {
          setData(responseItem);
        } else {
          throw new Error('No dashboard data found in response');
        }
      } else {
        // Handle case where no data is returned
        setData({
          kpis: {
            today_sales: 0,
            active_sales_count: 0,
            total_customers_count: 0,
            overdue_payments_count: 0,
          },
          lists: {
            recent_sales: [],
            upcoming_payments: [],
          },
          performance: {
            monthly_revenue: 0,
            average_sale_time_days: 0,
            sales_this_month_count: 0,
          },
        });
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      
      // Set fallback data on error
      setData({
        kpis: {
          today_sales: 0,
          active_sales_count: 0,
          total_customers_count: 0,
          overdue_payments_count: 0,
        },
        lists: {
          recent_sales: [],
          upcoming_payments: [],
        },
        performance: {
          monthly_revenue: 0,
          average_sale_time_days: 0,
          sales_this_month_count: 0,
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    isLoading,
    error,
    fetchDashboardData,
  };
};