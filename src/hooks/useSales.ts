import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Sale } from '../types';

interface UseSalesReturn {
  sales: Sale[];
  isLoading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
}

export const useSales = (): UseSalesReturn => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_sales_details_by_user');
      console.log('raw data from rpc (type, value):', typeof data, data); // New log
      console.log('Is raw data an array?', Array.isArray(data)); // New log

      if (error) throw error;

      console.log('first', data[0]);
      let salesData: any[] = []; // Initialize as empty array of any type
      if (Array.isArray(data) && data.length > 0) {
        const rpcResult = data;
        if (rpcResult) {
          // Ensure get_sales_details_by_user is an array before assigning
          if (Array.isArray(rpcResult.get_sales_details_by_user)) {
            salesData = rpcResult.get_sales_details_by_user;
          } else {
            console.warn('get_sales_details_by_user is not an array:', rpcResult.get_sales_details_by_user);
          }
        } else {
          console.warn('RPC result does not contain get_sales_details_by_user or is not an object:', rpcResult);
        }
      } else {
        console.warn('Raw data from RPC is not an array or is empty:', data);
      }

      console.log('salesData after extraction:', salesData);

      const formattedSales: Sale[] = (salesData || []).map((sale: any) => ({
        id: sale.id,
        customer_id: sale.customer?.customer_id,
        customer: sale.customer ? {
          id: sale.customer.customer_id,
          first_name: sale.customer.first_name,
          last_name: sale.customer.last_name,
          email: sale.customer.email,
          phone: sale.customer.phone,
          created_at: sale.customer.created_at,
        } : undefined,
        seller_name: sale.seller_name,
        total_amount: parseFloat(sale.total_amount || '0'),
        amount_paid: parseFloat(sale.amount_paid || '0'),
        remaining_balance: parseFloat(sale.remaining_balance || '0'),
        payment_type: sale.payment_type,
        status: sale.status,
        notes: sale.notes,
        created_at: sale.created_at,
        items: sale.items || [],
        schedule: sale.schedule || [],
        payment_history: sale.payment_history || [],
      }));

      console.log('formattedSales:', formattedSales);
      setSales(formattedSales);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
      console.error('Error fetching sales:', err); // Add error logging
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    isLoading,
    error,
    fetchSales,
  };
};
